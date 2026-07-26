export interface GoogleUser {
  id: string;
  name: string;
  email: string;
  picture: string;
  isSignedIn: boolean;
}

export type SessionState =
  | 'disconnected'
  | 'connecting'
  | 'idle'
  | 'listening'
  | 'speaking'
  | 'interrupted'
  | 'error';

export type MoodLighting = 'spicy' | 'cyberpunk' | 'romantic' | 'zen' | 'neon_violet';

export interface OpenWebsiteArgs {
  url: string;
  title?: string;
  reason?: string;
}

export interface GetWeatherArgs {
  location: string;
}

export interface SetReminderArgs {
  seconds: number;
  label: string;
}

export interface MoodLightingArgs {
  mood: MoodLighting;
  primaryColor?: string;
  secondaryColor?: string;
}

export interface PlayVibeSoundArgs {
  soundType: 'applause' | 'heartbeat' | 'laser' | 'gasp' | 'cheer' | 'chime';
}

export interface ExecutedToolCall {
  id: string;
  name: string;
  args: any;
  result?: any;
  timestamp: number;
  status: 'executing' | 'completed' | 'failed';
}

export interface TranscriptItem {
  id: string;
  sender: 'user' | 'zoya';
  text: string;
  timestamp: number;
}

export interface ZoyaPersonalityStats {
  confidence: number; // percentage e.g. 100
  sassLevel: string; // e.g. "Maximum"
  mood: string; // e.g. "Playfully Teasing"
  charmRating: number; // e.g. 98
}

export interface ServerToClientMessage {
  type: 'status' | 'audio' | 'interrupted' | 'transcript' | 'tool_call' | 'error';
  status?: SessionState;
  audio?: string; // base64 PCM 24kHz
  sender?: 'user' | 'zoya';
  text?: string;
  toolCall?: {
    id: string;
    name: string;
    args: any;
  };
  error?: string;
}

export interface ClientToServerMessage {
  type: 'audio' | 'tool_response' | 'interrupt' | 'system_prompt_update';
  audio?: string; // base64 PCM 16kHz
  toolResponse?: {
    id: string;
    name: string;
    response: any;
  };
}
