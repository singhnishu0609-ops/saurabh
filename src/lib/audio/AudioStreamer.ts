import { float32ToInt16Base64 } from './pcmUtils';

export class AudioStreamer {
  private audioCtx: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private sourceNode: MediaStreamAudioSourceNode | null = null;
  private processorNode: ScriptProcessorNode | null = null;
  private analyserNode: AnalyserNode | null = null;
  private isMuted: boolean = false;
  private onChunkCallback: ((base64Pcm: string) => void) | null = null;

  public async start(onChunk: (base64Pcm: string) => void): Promise<void> {
    this.onChunkCallback = onChunk;
    
    // Request microphone access
    this.mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        channelCount: 1,
        sampleRate: 16000,
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });

    // Create 16kHz AudioContext
    this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({
      sampleRate: 16000,
    });

    if (this.audioCtx.state === 'suspended') {
      await this.audioCtx.resume();
    }

    this.sourceNode = this.audioCtx.createMediaStreamSource(this.mediaStream);

    // Setup Analyser for visualization
    this.analyserNode = this.audioCtx.createAnalyser();
    this.analyserNode.fftSize = 256;
    this.analyserNode.smoothingTimeConstant = 0.5;

    // ScriptProcessor for PCM chunk extraction (2048 samples ~128ms per chunk)
    this.processorNode = this.audioCtx.createScriptProcessor(2048, 1, 1);

    this.processorNode.onaudioprocess = (e) => {
      if (this.isMuted) return;
      const inputBuffer = e.inputBuffer.getChannelData(0);
      const base64Pcm = float32ToInt16Base64(inputBuffer);
      if (this.onChunkCallback && base64Pcm) {
        this.onChunkCallback(base64Pcm);
      }
    };

    // Connect nodes
    this.sourceNode.connect(this.analyserNode);
    this.analyserNode.connect(this.processorNode);
    // Connect to destination to keep ScriptProcessor active in browser engine
    this.processorNode.connect(this.audioCtx.destination);
  }

  public setMute(muted: boolean): void {
    this.isMuted = muted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public getAnalyser(): AnalyserNode | null {
    return this.analyserNode;
  }

  public stop(): void {
    if (this.processorNode) {
      this.processorNode.onaudioprocess = null;
      this.processorNode.disconnect();
      this.processorNode = null;
    }

    if (this.sourceNode) {
      this.sourceNode.disconnect();
      this.sourceNode = null;
    }

    if (this.analyserNode) {
      this.analyserNode.disconnect();
      this.analyserNode = null;
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }

    if (this.audioCtx) {
      this.audioCtx.close();
      this.audioCtx = null;
    }

    this.onChunkCallback = null;
  }
}
