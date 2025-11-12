import { Buffer } from 'buffer';

// Constants for Audio Processing (Default to 16kHz standard)
export const TARGET_SAMPLE_RATE = 16000;
export const FFT_SIZE = 512;
export const HOP_LENGTH = 160; // 10ms at 16kHz
export const MEL_BANDS = 129;   // User requested 129 dimensions (matching Log-Mel 124, 129)
export const MIN_FREQ = 20;
export const MAX_FREQ = 8000;  // Nyquist at 16kHz

class AudioSignalProcessing {
    
    /**
     * Resamples audio data to target sample rate using linear interpolation.
     */
    resample(audioData: Float32Array, originalSampleRate: number, targetSampleRate: number): Float32Array {
        if (originalSampleRate === targetSampleRate) return audioData;
        
        const ratio = originalSampleRate / targetSampleRate;
        const newLength = Math.round(audioData.length / ratio);
        const resampled = new Float32Array(newLength);
        
        for (let i = 0; i < newLength; i++) {
            const index = i * ratio;
            const indexFloor = Math.floor(index);
            const indexCeil = Math.ceil(index);
            const fraction = index - indexFloor;
            
            if (indexCeil < audioData.length) {
                resampled[i] = audioData[indexFloor] * (1 - fraction) + audioData[indexCeil] * fraction;
            } else {
                resampled[i] = audioData[indexFloor];
            }
        }
        
        return resampled;
    }

    /**
     * Applies pre-emphasis filter to audio signal.
     */
    preEmphasis(audioData: Float32Array, coeff: number = 0.97): Float32Array {
        const emphasized = new Float32Array(audioData.length);
        emphasized[0] = audioData[0];
        for (let i = 1; i < audioData.length; i++) {
            emphasized[i] = audioData[i] - coeff * audioData[i - 1];
        }
        return emphasized;
    }

    /**
     * Computes Short-Time Fourier Transform (STFT).
     * Returns magnitude spectrum.
     */
    computeSTFT(audioData: Float32Array, nFft: number = FFT_SIZE, hopLength: number = HOP_LENGTH): number[][] {
        const frames: number[][] = [];
        const window = this.hanningWindow(nFft);
        
        for (let i = 0; i + nFft <= audioData.length; i += hopLength) {
            const frame = new Float32Array(nFft);
            for (let j = 0; j < nFft; j++) {
                frame[j] = audioData[i + j] * window[j];
            }
            
            const spectrum = this.fftMagnitude(frame);
            frames.push(spectrum);
        }
        
        return frames;
    }

    /**
     * Computes Log-Mel Spectrogram.
     * Returns flattened Float32Array suitable for TFLite input.
     */
    computeLogMelSpectrogram(
        audioData: Float32Array, 
        sampleRate: number = TARGET_SAMPLE_RATE
    ): Float32Array {
        // 1. Resample if necessary
        let processedAudio = audioData;
        if (sampleRate !== TARGET_SAMPLE_RATE) {
            processedAudio = this.resample(audioData, sampleRate, TARGET_SAMPLE_RATE);
        }

        // 2. Pre-emphasis
        processedAudio = this.preEmphasis(processedAudio);

        // 3. STFT (Magnitude)
        const magnitudeFrames = this.computeSTFT(processedAudio);
        
        if (magnitudeFrames.length === 0) {
            return new Float32Array(0);
        }

        // 4. Create Mel Filterbank
        const melFilters = this.createMelFilterbank(MEL_BANDS, FFT_SIZE, TARGET_SAMPLE_RATE);

        // 5. Apply Mel Filterbank and Log
        const logMelSpectrogram: number[] = [];
        
        for (const frame of magnitudeFrames) {
            for (let m = 0; m < MEL_BANDS; m++) {
                let energy = 0;
                // Dot product of frame spectrum and m-th mel filter
                for (let k = 0; k < frame.length; k++) {
                    energy += frame[k] * melFilters[m][k];
                }
                // Log scaling (stabilized)
                logMelSpectrogram.push(Math.log(energy + 1e-6));
            }
        }

        return new Float32Array(logMelSpectrogram);
    }

    // --- Helpers ---

    private hanningWindow(size: number): Float32Array {
        const window = new Float32Array(size);
        for (let i = 0; i < size; i++) {
            window[i] = 0.5 * (1 - Math.cos((2 * Math.PI * i) / (size - 1)));
        }
        return window;
    }

    private fftMagnitude(input: Float32Array): number[] {
        const n = input.length;
        const real = new Float32Array(input);
        const imag = new Float32Array(n).fill(0);
        
        this.transform(real, imag);
        
        // Compute magnitude for first n/2 + 1 bins
        const outputSize = Math.floor(n / 2) + 1;
        const magnitudes: number[] = new Array(outputSize);
        
        for (let i = 0; i < outputSize; i++) {
            magnitudes[i] = Math.sqrt(real[i] * real[i] + imag[i] * imag[i]);
        }
        
        return magnitudes;
    }

    // Simple Cooley-Tukey FFT (Radix-2)
    private transform(real: Float32Array, imag: Float32Array) {
        const n = real.length;
        if (n <= 1) return;

        const i2 = Math.floor(n / 2);
        const cosTable = new Float32Array(i2);
        const sinTable = new Float32Array(i2);
        
        for (let i = 0; i < i2; i++) {
            cosTable[i] = Math.cos(-2 * Math.PI * i / n);
            sinTable[i] = Math.sin(-2 * Math.PI * i / n);
        }

        // Bit-reverse copy
        let j = 0;
        for (let i = 0; i < n - 1; i++) {
            if (i < j) {
                const tr = real[i]; real[i] = real[j]; real[j] = tr;
                const ti = imag[i]; imag[i] = imag[j]; imag[j] = ti;
            }
            let k = n >> 1;
            while (k <= j) {
                j -= k;
                k >>= 1;
            }
            j += k;
        }

        // Butterfly operations
        let step = 1;
        while (step < n) {
            const jump = step << 1;
            let theta = -Math.PI / step;
            
            const wRealStep = Math.cos(theta);
            const wImagStep = Math.sin(theta);
            
            for (let i = 0; i < n; i += jump) {
                let wReal = 1.0;
                let wImag = 0.0;
                
                for (let k = 0; k < step; k++) {
                    const idx = i + k + step;
                    const tempReal = wReal * real[idx] - wImag * imag[idx];
                    const tempImag = wReal * imag[idx] + wImag * real[idx];
                    
                    real[idx] = real[i + k] - tempReal;
                    imag[idx] = imag[i + k] - tempImag;
                    real[i + k] += tempReal;
                    imag[i + k] += tempImag;
                    
                    // Update W
                    const wTemp = wReal;
                    wReal = wReal * wRealStep - wImag * wImagStep;
                    wImag = wTemp * wImagStep + wImag * wRealStep;
                }
            }
            step = jump;
        }
    }

    private createMelFilterbank(numMels: number, nFft: number, sampleRate: number): number[][] {
        const fMin = MIN_FREQ;
        const fMax = MAX_FREQ;
        
        const melMin = 1125 * Math.log(1 + fMin / 700);
        const melMax = 1125 * Math.log(1 + fMax / 700);
        
        const melPoints = new Float32Array(numMels + 2);
        for (let i = 0; i < numMels + 2; i++) {
            melPoints[i] = melMin + (melMax - melMin) * i / (numMels + 1);
        }
        
        const hzPoints = new Float32Array(numMels + 2);
        for (let i = 0; i < numMels + 2; i++) {
            hzPoints[i] = 700 * (Math.exp(melPoints[i] / 1125) - 1);
        }
        
        const binPoints = new Int32Array(numMels + 2);
        for (let i = 0; i < numMels + 2; i++) {
            binPoints[i] = Math.floor((nFft + 1) * hzPoints[i] / sampleRate);
        }
        
        const filters: number[][] = [];
        const numBins = Math.floor(nFft / 2) + 1;
        
        for (let i = 0; i < numMels; i++) {
            const filter = new Float32Array(numBins).fill(0);
            const start = binPoints[i];
            const center = binPoints[i + 1];
            const end = binPoints[i + 2];
            
            for (let j = start; j < center; j++) {
                filter[j] = (j - start) / (center - start);
            }
            for (let j = center; j < end; j++) {
                filter[j] = (end - j) / (end - center);
            }
            filters.push(Array.from(filter));
        }
        
        return filters;
    }
}

export default new AudioSignalProcessing();
