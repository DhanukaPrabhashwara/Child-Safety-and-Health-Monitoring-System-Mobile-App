import AsyncStorage from '@react-native-async-storage/async-storage';
import { readAsStringAsync } from 'expo-file-system';
import AudioSignalProcessing from './AudioSignalProcessing';
import { Buffer } from 'buffer';

const TRUSTED_VOICES_KEY = 'TRUSTED_VOICES';
const EMBEDDING_SIZE = 128;

// Debug Stats Storage
let lastProcessingStats = {
    inputShape: '',
    spectrogramShape: '',
    embeddingSize: 0,
    processingTimeMs: 0,
    lastVector: [] as number[],
    lastError: '' // Added to track why it failed
};

// Interface for the TFLite Model
interface TensorflowModel {
    run(inputs: any[]): Promise<any[]>;
}

interface TrustCheckResult {
    status: 'SAFE' | 'DANGER';
    score: number;
    person?: string;
}

class TrustModelService {
    private isModelLoaded = false;
    private model: TensorflowModel | null = null;
    private loadError: string = '';

    async loadModel(): Promise<void> {
        if (this.isModelLoaded) return;
        
        console.log('Loading Trustmodel2.tflite...');
        this.loadError = '';
        
        try {
            const { loadTensorflowModel } = require('react-native-fast-tflite');
            const { Asset } = require('expo-asset');
            
            // Ensure the asset is bundled
            const modelAsset = Asset.fromModule(require('../assets/Trustmodel2.tflite'));
            await modelAsset.downloadAsync();
            
            console.log('Model Asset:', modelAsset); // Debug asset info

            // Pass the local URI or URI to the loader
            if (modelAsset.localUri) {
                this.model = await loadTensorflowModel({ url: modelAsset.localUri });
            } else {
                 this.model = await loadTensorflowModel({ url: modelAsset.uri });
            }

            this.isModelLoaded = true;
            console.log('Real TFLite Model (Trustmodel2) loaded successfully.');
        } catch (error: any) {
            console.error('Failed to load real TFLite model:', error);
            this.loadError = error.message || JSON.stringify(error);
            // We do NOT fallback to mock silently anymore, unless explicitly requested or handled.
            // But for app stability, we might set a flag or keep model null.
        }
    }

    // Helper: Convert Base64 Audio (WAV/PCM) to Float32Array
    private async decodeAudioToFloat32(filePath: string): Promise<Float32Array> {
        const base64 = await readAsStringAsync(filePath, {
            encoding: 'base64',
        });
        
        const buffer = Buffer.from(base64, 'base64');
        // Fix RangeError: Ensure buffer length is even for Int16Array
        const adjustedBuffer = buffer.length % 2 === 1 ? buffer.slice(0, -1) : buffer;
        
        // Skip WAV header (usually 44 bytes), start reading PCM data
        // We assume standard WAV header. If raw PCM, offset is 0.
        // react-native-audio-record produces WAV.
        const pcmData = new Int16Array(adjustedBuffer.buffer, 44);
        
        const floatData = new Float32Array(pcmData.length);
        for (let i = 0; i < pcmData.length; i++) {
            // Normalize 16-bit integer to [-1.0, 1.0]
            floatData[i] = pcmData[i] / 32768.0;
        }
        return floatData;
    }

    async processAudio(filePath: string): Promise<number[]> {
        if (!this.isModelLoaded) {
            await this.loadModel();
        }

        if (!this.model) {
            const msg = `Model not loaded. Error: ${this.loadError || 'Unknown'}`;
            console.warn(msg);
            return this.mockProcess(msg);
        }

        try {
            console.log(`Processing real audio: ${filePath}`);
            const startTime = Date.now();

            let rawAudio: Float32Array;
            
            try {
                // 1. Decode WAV to Float32 PCM
                rawAudio = await this.decodeAudioToFloat32(filePath);
            } catch (decodeError: any) {
                const msg = `Audio decoding failed: ${decodeError.message}`;
                console.warn(msg, decodeError);
                return this.mockProcess(msg);
            }
            
            // 2. Compute Log-Mel Spectrogram
            // Input is 44100Hz (from VoiceRecorderService), target is 16000Hz (Model expected)
            const spectrogram = AudioSignalProcessing.computeLogMelSpectrogram(rawAudio, 44100);
            
            // 3. Inference
            // TFLite 'run' expects an array of inputs. Our model likely takes [1, Time, Freq] or flattened.
            // FastTFLite handles flattening often, or we pass typed array.
            const output = await this.model.run([spectrogram]);
            const embedding = output[0]; // Output is likely [1, 128] or [128]
            
            // 4. Normalize Embedding (L2 Norm)
            // @ts-ignore
            const vector = Array.from(embedding) as number[];
            const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
            const normalizedVector = vector.map(val => val / (magnitude + 1e-9)); // Avoid div by zero
            
            // Capture Stats
            const frames = Math.floor(spectrogram.length / 129);
            lastProcessingStats = {
                inputShape: `Raw PCM: ${rawAudio.length}`,
                spectrogramShape: `Log-Mel: ${frames} frames x 129 bins`,
                embeddingSize: normalizedVector.length,
                processingTimeMs: Date.now() - startTime,
                lastVector: normalizedVector,
                lastError: ''
            };

            return normalizedVector;

        } catch (e: any) {
            console.error('Inference Failed:', e);
            const msg = `Inference Failed: ${e.message}`;
            return this.mockProcess(msg); // Return mock stats instead of throwing, so user can check Debug Info
        }
    }

    private async mockProcess(reason: string = 'Unknown'): Promise<number[]> {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const vector = Array.from({ length: EMBEDDING_SIZE }, () => Math.random() - 0.5);
        
        // Normalize mock vector so dot product isn't > 1
        const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
        const normalizedVector = vector.map(val => val / (magnitude + 1e-9));

        lastProcessingStats = {
            inputShape: 'Mock',
            spectrogramShape: 'Mock',
            embeddingSize: EMBEDDING_SIZE,
            processingTimeMs: 1000,
            lastVector: normalizedVector,
            lastError: reason
        };
        return normalizedVector;
    }

    // Enroll a single voice sample
    async enrollVoiceSample(name: string, audioPath: string): Promise<void> {
        console.log(`Enrolling sample for ${name}...`);
        
        const newEmbedding = await this.processAudio(audioPath);
        
        // Load existing keyring
        const storedData = await AsyncStorage.getItem(TRUSTED_VOICES_KEY);
        let keyring: Record<string, number[][]> = {};
        
        if (storedData) {
            keyring = JSON.parse(storedData);
        }
        
        // Initialize array for user if not exists
        if (!keyring[name]) {
            keyring[name] = [];
        }
        
        // Append new vector
        keyring[name].push(newEmbedding);

        // Store audio path
        const storedAudio = await AsyncStorage.getItem(TRUSTED_VOICES_KEY + '_AUDIO');
        let audioPaths: Record<string, string[]> = {};
        if (storedAudio) {
            audioPaths = JSON.parse(storedAudio);
        }
        if (!audioPaths[name]) {
            audioPaths[name] = [];
        }
        audioPaths[name].push(audioPath);
        await AsyncStorage.setItem(TRUSTED_VOICES_KEY + '_AUDIO', JSON.stringify(audioPaths));
        
        // Save back
        await AsyncStorage.setItem(TRUSTED_VOICES_KEY, JSON.stringify(keyring));
        console.log(`Saved sample for ${name}. Total samples: ${keyring[name].length}`);
    }

    // Check audio against enrolled voices
    async checkAudio(testAudioPath: string): Promise<TrustCheckResult> {
        const storedData = await AsyncStorage.getItem(TRUSTED_VOICES_KEY);
        if (!storedData) {
            // No trusted voices enrolled, any voice is "Stranger"
            // But we still process it to show debug info
            await this.processAudio(testAudioPath); 
            return { status: 'DANGER', score: 0 };
        }

        const keyring: Record<string, number[][]> = JSON.parse(storedData);
        const testEmbedding = await this.processAudio(testAudioPath);
        
        let maxScore = -1;
        let identifiedPerson: string | undefined = undefined;

        // Iterate through all users
        for (const [personName, vectors] of Object.entries(keyring)) {
            // Iterate through all vectors for this user
            for (const enrolledVector of vectors) {
                // Cosine Similarity
                const dotProduct = enrolledVector.reduce((sum, val, idx) => sum + val * testEmbedding[idx], 0);
                
                if (dotProduct > maxScore) {
                    maxScore = dotProduct;
                    identifiedPerson = personName;
                }
            }
        }
        
        console.log(`Max Similarity Score: ${maxScore} (Matched: ${identifiedPerson})`);
        
        // Threshold check (0.75 is a common starting point for Cosine Sim)
        if (maxScore > 0.75 && identifiedPerson) {
            return { status: 'SAFE', score: maxScore, person: identifiedPerson };
        }
        
        return { status: 'DANGER', score: maxScore };
    }

    async isEnrolled(): Promise<boolean> {
        const stored = await AsyncStorage.getItem(TRUSTED_VOICES_KEY);
        if (!stored) return false;
        const keyring = JSON.parse(stored);
        return Object.keys(keyring).length > 0;
    }
    
    async clearEnrollment(): Promise<void> {
        await AsyncStorage.removeItem(TRUSTED_VOICES_KEY);
    }

    async getEnrolledVoices(): Promise<{ name: string; sampleCount: number; audioPaths: string[] }[]> {
        const storedData = await AsyncStorage.getItem(TRUSTED_VOICES_KEY);
        if (!storedData) return [];
        
        const keyring: Record<string, number[][]> = JSON.parse(storedData);
        
        const storedAudio = await AsyncStorage.getItem(TRUSTED_VOICES_KEY + '_AUDIO');
        const audioPaths: Record<string, string[]> = storedAudio ? JSON.parse(storedAudio) : {};

        return Object.keys(keyring).map(name => ({
            name,
            sampleCount: keyring[name].length,
            audioPaths: audioPaths[name] || []
        }));
    }

    async deleteVoice(name: string): Promise<void> {
        const storedData = await AsyncStorage.getItem(TRUSTED_VOICES_KEY);
        if (!storedData) return;
        
        const keyring: Record<string, number[][]> = JSON.parse(storedData);
        if (keyring[name]) {
            delete keyring[name];
            await AsyncStorage.setItem(TRUSTED_VOICES_KEY, JSON.stringify(keyring));
        }

        const storedAudio = await AsyncStorage.getItem(TRUSTED_VOICES_KEY + '_AUDIO');
        if (storedAudio) {
            const audioPaths: Record<string, string[]> = JSON.parse(storedAudio);
            if (audioPaths[name]) {
                delete audioPaths[name];
                await AsyncStorage.setItem(TRUSTED_VOICES_KEY + '_AUDIO', JSON.stringify(audioPaths));
            }
        }
    }

    async deleteVoiceClip(name: string, path: string): Promise<void> {
        const storedAudio = await AsyncStorage.getItem(TRUSTED_VOICES_KEY + '_AUDIO');
        if (!storedAudio) return;

        const audioPaths: Record<string, string[]> = JSON.parse(storedAudio);
        if (audioPaths[name]) {
            // Remove the path
            const pathIndex = audioPaths[name].indexOf(path);
            if (pathIndex > -1) {
                audioPaths[name].splice(pathIndex, 1);
                await AsyncStorage.setItem(TRUSTED_VOICES_KEY + '_AUDIO', JSON.stringify(audioPaths));
                
                // Also remove the corresponding embedding vector to keep counts in sync
                const storedData = await AsyncStorage.getItem(TRUSTED_VOICES_KEY);
                if (storedData) {
                    const keyring: Record<string, number[][]> = JSON.parse(storedData);
                    if (keyring[name] && keyring[name].length > pathIndex) {
                        keyring[name].splice(pathIndex, 1);
                        // If no samples left, maybe remove user? Or keep empty user? 
                        // Let's keep empty user for now unless explicitly deleted.
                        await AsyncStorage.setItem(TRUSTED_VOICES_KEY, JSON.stringify(keyring));
                    }
                }
            }
        }
    }

    // Get info about what is stored and last run
    async getDebugInfo(): Promise<string> {
        const storedData = await AsyncStorage.getItem(TRUSTED_VOICES_KEY);
        let info = '';
        
        if (!storedData) {
            info += 'No voices stored.\n';
        } else {
            const keyring = JSON.parse(storedData);
            info += `Enrolled Users: ${Object.keys(keyring).join(', ')}\n`;
            for (const name in keyring) {
                info += `- ${name}: ${keyring[name].length} samples\n`;
            }
        }
        
        info += '\n--- Last Inference ---\n';
        info += `Input: ${lastProcessingStats.inputShape}\n`;
        info += `Spectrogram: ${lastProcessingStats.spectrogramShape}\n`;
        info += `Embedding: ${lastProcessingStats.embeddingSize}\n`;
        info += `Time: ${lastProcessingStats.processingTimeMs}ms\n`;
        if (lastProcessingStats.lastError) {
             info += `\n[ERROR] FALLBACK TO MOCK:\n${lastProcessingStats.lastError}\n`;
        }
        
        if (lastProcessingStats.lastVector && lastProcessingStats.lastVector.length > 0) {
            const v = lastProcessingStats.lastVector;
            // Show first 5 and last 5
            const start = v.slice(0, 5).map(n => n.toFixed(3)).join(', ');
            info += `Vector (First 5): [${start}...]\n`;
        }
        
        return info;
    }

    getLastEmbedding(): number[] {
        return lastProcessingStats.lastVector;
    }
}

export default new TrustModelService();
