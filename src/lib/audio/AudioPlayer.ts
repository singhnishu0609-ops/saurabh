import { base64ToInt16Array, int16ToFloat32Array } from './pcmUtils';

export class AudioPlayer {
  private audioCtx: AudioContext | null = null;
  private analyserNode: AnalyserNode | null = null;
  private nextStartTime: number = 0;
  private activeSourceNodes: AudioBufferSourceNode[] = [];
  private sampleRate: number = 24000;

  constructor(sampleRate: number = 24000) {
    this.sampleRate = sampleRate;
  }

  private initCtx(): void {
    if (!this.audioCtx || this.audioCtx.state === 'closed') {
      this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: this.sampleRate,
      });

      this.analyserNode = this.audioCtx.createAnalyser();
      this.analyserNode.fftSize = 256;
      this.analyserNode.smoothingTimeConstant = 0.6;
      this.analyserNode.connect(this.audioCtx.destination);
    }

    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  public async playChunk(base64Pcm: string): Promise<void> {
    this.initCtx();
    if (!this.audioCtx || !this.analyserNode) return;

    try {
      const int16 = base64ToInt16Array(base64Pcm);
      const float32 = int16ToFloat32Array(int16);

      if (float32.length === 0) return;

      const audioBuffer = this.audioCtx.createBuffer(1, float32.length, this.sampleRate);
      audioBuffer.getChannelData(0).set(float32);

      const source = this.audioCtx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.analyserNode);

      const currentTime = this.audioCtx.currentTime;
      if (this.nextStartTime < currentTime) {
        this.nextStartTime = currentTime;
      }

      source.start(this.nextStartTime);
      this.nextStartTime += audioBuffer.duration;

      this.activeSourceNodes.push(source);

      source.onended = () => {
        const index = this.activeSourceNodes.indexOf(source);
        if (index > -1) {
          this.activeSourceNodes.splice(index, 1);
        }
      };
    } catch (err) {
      console.error("AudioPlayer playChunk error:", err);
    }
  }

  public interrupt(): void {
    // Stop all active playing audio nodes immediately
    for (const source of this.activeSourceNodes) {
      try {
        source.stop();
        source.disconnect();
      } catch (e) {
        // Source may already be stopped
      }
    }
    this.activeSourceNodes = [];

    if (this.audioCtx) {
      this.nextStartTime = this.audioCtx.currentTime;
    }
  }

  public getAnalyser(): AnalyserNode | null {
    return this.analyserNode;
  }

  public stop(): void {
    this.interrupt();
    if (this.audioCtx) {
      this.audioCtx.close();
      this.audioCtx = null;
    }
    this.analyserNode = null;
  }
}
