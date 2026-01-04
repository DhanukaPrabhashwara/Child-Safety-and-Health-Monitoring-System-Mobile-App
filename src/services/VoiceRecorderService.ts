import { Audio } from 'expo-av';
// @ts-ignore
import AudioRecord from 'react-native-audio-record';

class VoiceRecorderService {
    private isRecording = false;
    private isInitialized = false;
    private useNativeRecorder = false;
    private expoRecording: Audio.Recording | null = null;

    async init() {
        if (this.isInitialized) return;
        try {
            // Request permissions using Expo AV
            const { status } = await Audio.requestPermissionsAsync();
            if (status !== 'granted') {
                throw new Error('Microphone permission not granted');
            }

            // Check if AudioRecord is available and has native backing
            // AudioRecord might be an object, but we need to check if it works or if NativeModules linked it.
            if (AudioRecord && AudioRecord.init) {
                try {
                    const options = {
                        sampleRate: 44100,
                        channels: 1,
                        bitsPerSample: 16,
                        audioSource: 6, // Android: VOICE_RECOGNITION
                        wavFile: 'test.wav'
                    };
                    AudioRecord.init(options);
                    this.useNativeRecorder = true;
                    console.log('VoiceRecorderService: Native AudioRecord initialized');
                } catch (e) {
                    console.warn('VoiceRecorderService: Native AudioRecord init failed (likely missing native module). Falling back to Expo AV.', e);
                    this.useNativeRecorder = false;
                }
            } else {
                console.warn('VoiceRecorderService: AudioRecord library not found or invalid. Falling back to Expo AV.');
                this.useNativeRecorder = false;
            }
            
            // Also set Expo Audio mode for playback routing
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
            });

            this.isInitialized = true;
        } catch (error) {
            console.error('VoiceRecorderService init failed:', error);
            throw error;
        }
    }

    async start() {
        try {
            if (!this.isInitialized) {
                await this.init();
            }

            if (this.isRecording) {
                await this.stop();
            }

            if (this.useNativeRecorder) {
                AudioRecord.start();
            } else {
                // Fallback: Use Expo AV
                // Note: This often produces compressed audio on Android which may not work with the AI model.
                // But it prevents the app from crashing.
                const { recording } = await Audio.Recording.createAsync(
                    Audio.RecordingOptionsPresets.HIGH_QUALITY
                );
                this.expoRecording = recording;
            }
            
            this.isRecording = true;
            console.log(`VoiceRecorderService started recording (Native: ${this.useNativeRecorder})`);
        } catch (error) {
            console.error('VoiceRecorderService start failed:', error);
            throw error;
        }
    }

    async stop(): Promise<string> {
        if (!this.isRecording) {
            console.warn('VoiceRecorderService: Stop called but not recording.');
            return ""; 
        }

        try {
            let uri = "";
            if (this.useNativeRecorder) {
                const audioFile = await AudioRecord.stop();
                console.log('Audio saved to (Native):', audioFile);
                uri = audioFile.startsWith('file://') ? audioFile : `file://${audioFile}`;
            } else {
                if (this.expoRecording) {
                    await this.expoRecording.stopAndUnloadAsync();
                    uri = this.expoRecording.getURI() || "";
                    this.expoRecording = null;
                    console.log('Audio saved to (Expo):', uri);
                }
            }
            
            this.isRecording = false;
            
            if (!uri) {
                throw new Error('Recording produced no URI');
            }
            
            return uri;
        } catch (error) {
            console.error('VoiceRecorderService stop failed:', error);
            throw error;
        }
    }
}

export default new VoiceRecorderService();
