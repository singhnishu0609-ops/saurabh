import { AudioStreamer } from './audio/AudioStreamer';
import { AudioPlayer } from './audio/AudioPlayer';
import { playVibeEffect } from './soundEffects';
import {
  SessionState,
  ExecutedToolCall,
  ServerToClientMessage,
  ClientToServerMessage,
  MoodLighting,
} from '../types';

export interface LiveSessionCallbacks {
  onStateChange: (state: SessionState) => void;
  onTranscript: (sender: 'user' | 'zoya', text: string) => void;
  onToolCall: (toolCall: ExecutedToolCall) => void;
  onError: (error: string) => void;
  onMoodChange: (mood: MoodLighting, primaryColor?: string, secondaryColor?: string) => void;
}

export class LiveSessionClient {
  private ws: WebSocket | null = null;
  private audioStreamer: AudioStreamer;
  private audioPlayer: AudioPlayer;
  private currentState: SessionState = 'disconnected';
  private callbacks: LiveSessionCallbacks;
  private isMuted: boolean = false;
  private speakingTimeout: any = null;

  constructor(callbacks: LiveSessionCallbacks) {
    this.callbacks = callbacks;
    this.audioStreamer = new AudioStreamer();
    this.audioPlayer = new AudioPlayer(24000);
  }

  public getState(): SessionState {
    return this.currentState;
  }

  private setState(newState: SessionState): void {
    if (this.currentState !== newState) {
      this.currentState = newState;
      this.callbacks.onStateChange(newState);
    }
  }

  public async connect(options?: { apiKey?: string; user?: { name?: string; email?: string } }): Promise<void> {
    if (this.currentState === 'connecting' || this.currentState === 'idle' || this.currentState === 'listening' || this.currentState === 'speaking') {
      return;
    }

    this.setState('connecting');

    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const params = new URLSearchParams();
      if (options?.apiKey) params.append('apiKey', options.apiKey);
      if (options?.user?.name) params.append('userName', options.user.name);
      if (options?.user?.email) params.append('userEmail', options.user.email);

      const queryString = params.toString() ? `?${params.toString()}` : '';
      const wsUrl = `${protocol}//${window.location.host}/live${queryString}`;
      console.log('Connecting to Zoya Live WebSocket:', wsUrl);

      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = async () => {
        console.log('WebSocket connection opened');
        try {
          // Start streaming mic audio
          await this.audioStreamer.start((base64Pcm) => {
            if (this.ws && this.ws.readyState === WebSocket.OPEN && !this.isMuted) {
              const msg: ClientToServerMessage = {
                type: 'audio',
                audio: base64Pcm,
              };
              this.ws.send(JSON.stringify(msg));
            }
          });
          this.setState('idle');
        } catch (err: any) {
          console.error('Microphone access error:', err);
          this.callbacks.onError('Microphone access denied or unavailable: ' + (err?.message || String(err)));
          this.disconnect();
        }
      };

      this.ws.onmessage = (event) => {
        try {
          const msg: ServerToClientMessage = JSON.parse(event.data);

          if (msg.type === 'status' && msg.status) {
            this.setState(msg.status);
          } else if (msg.type === 'audio' && msg.audio) {
            this.handleAudioOutput(msg.audio);
          } else if (msg.type === 'interrupted') {
            this.handleInterruption();
          } else if (msg.type === 'transcript' && msg.sender && msg.text) {
            this.callbacks.onTranscript(msg.sender, msg.text);
          } else if (msg.type === 'tool_call' && msg.toolCall) {
            this.handleToolCall(msg.toolCall);
          } else if (msg.type === 'error' && msg.error) {
            this.callbacks.onError(msg.error);
            this.setState('error');
          }
        } catch (e) {
          console.error('Error handling WebSocket server message:', e);
        }
      };

      this.ws.onerror = (e) => {
        console.error('WebSocket error:', e);
        this.callbacks.onError('Connection error to Zoya Live server');
        this.setState('error');
      };

      this.ws.onclose = () => {
        console.log('WebSocket closed');
        this.stopAudio();
        this.setState('disconnected');
      };
    } catch (err: any) {
      console.error('LiveSessionClient connect failure:', err);
      this.callbacks.onError('Failed to connect: ' + (err?.message || String(err)));
      this.setState('disconnected');
    }
  }

  private handleAudioOutput(base64Pcm: string): void {
    this.setState('speaking');
    this.audioPlayer.playChunk(base64Pcm);

    if (this.speakingTimeout) {
      clearTimeout(this.speakingTimeout);
    }

    // Reset back to idle/listening if no new audio chunks arrive within 1.2 seconds
    this.speakingTimeout = setTimeout(() => {
      if (this.currentState === 'speaking') {
        this.setState(this.isMuted ? 'idle' : 'listening');
      }
    }, 1200);
  }

  private handleInterruption(): void {
    console.log('Zoya speech interrupted by user!');
    this.audioPlayer.interrupt();
    this.setState('interrupted');

    setTimeout(() => {
      this.setState('listening');
    }, 300);
  }

  private handleToolCall(toolCall: { id: string; name: string; args: any }): void {
    console.log('Executing Tool Call:', toolCall);

    const executedTool: ExecutedToolCall = {
      id: toolCall.id,
      name: toolCall.name,
      args: toolCall.args,
      timestamp: Date.now(),
      status: 'executing',
    };

    this.callbacks.onToolCall(executedTool);

    let resultResponse: any = { success: true };

    try {
      if (toolCall.name === 'openWebsite') {
        const url = toolCall.args.url;
        if (url) {
          // Attempt to open in browser window or frame
          try {
            window.open(url, '_blank', 'noopener,noreferrer');
          } catch (e) {
            // Ignore popup blocks if any
          }
        }
        resultResponse = {
          opened: true,
          url: url,
          message: `Opened website ${url} for user`,
        };
      } else if (toolCall.name === 'getWeather') {
        const loc = toolCall.args.location || 'Your city';
        resultResponse = {
          location: loc,
          temperature: '24°C / 75°F',
          condition: 'Sunny with a sassy breeze',
          humidity: '45%',
        };
      } else if (toolCall.name === 'setTimeReminder') {
        resultResponse = {
          reminderSet: true,
          seconds: toolCall.args.seconds,
          label: toolCall.args.label,
          message: `Timer set for ${toolCall.args.seconds}s: ${toolCall.args.label}`,
        };
      } else if (toolCall.name === 'changeMoodLighting') {
        const mood = toolCall.args.mood as MoodLighting;
        this.callbacks.onMoodChange(mood, toolCall.args.primaryColor, toolCall.args.secondaryColor);
        resultResponse = {
          moodChanged: true,
          currentMood: mood,
        };
      } else if (toolCall.name === 'playVibeSound') {
        playVibeEffect(toolCall.args.soundType || 'chime');
        resultResponse = {
          soundPlayed: toolCall.args.soundType,
        };
      }
    } catch (err: any) {
      console.error('Error executing tool call:', err);
      resultResponse = { success: false, error: String(err) };
    }

    // Send tool response back to Gemini Live
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const respMsg: ClientToServerMessage = {
        type: 'tool_response',
        toolResponse: {
          id: toolCall.id,
          name: toolCall.name,
          response: resultResponse,
        },
      };
      this.ws.send(JSON.stringify(respMsg));
    }
  }

  public setMuteMic(muted: boolean): void {
    this.isMuted = muted;
    this.audioStreamer.setMute(muted);
    if (this.currentState === 'listening' || this.currentState === 'idle') {
      this.setState(muted ? 'idle' : 'listening');
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public getMicAnalyser(): AnalyserNode | null {
    return this.audioStreamer.getAnalyser();
  }

  public getPlayerAnalyser(): AnalyserNode | null {
    return this.audioPlayer.getAnalyser();
  }

  private stopAudio(): void {
    this.audioStreamer.stop();
    this.audioPlayer.stop();
    if (this.speakingTimeout) {
      clearTimeout(this.speakingTimeout);
      this.speakingTimeout = null;
    }
  }

  public disconnect(): void {
    this.stopAudio();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.setState('disconnected');
  }
}
