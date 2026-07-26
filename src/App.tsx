import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FuturisticOrb } from './components/FuturisticOrb';
import { ControlBar } from './components/ControlBar';
import { PersonalityCard } from './components/PersonalityCard';
import { ToolExecutionCard } from './components/ToolExecutionCard';
import { TranscriptOverlay } from './components/TranscriptOverlay';
import { QuickPrompts } from './components/QuickPrompts';
import { GoogleAuthModal } from './components/GoogleAuthModal';
import { LiveSessionClient } from './lib/LiveSessionClient';
import {
  SessionState,
  ExecutedToolCall,
  TranscriptItem,
  MoodLighting,
  GoogleUser,
} from './types';
import { Sparkles, AlertCircle, Info, RefreshCw, Radio, Key, ShieldCheck } from 'lucide-react';

export default function App() {
  const [sessionState, setSessionState] = useState<SessionState>('disconnected');
  const [isMuted, setIsMuted] = useState(false);
  const [mood, setMood] = useState<MoodLighting>('spicy');
  const [transcripts, setTranscripts] = useState<TranscriptItem[]>([]);
  const [toolCalls, setToolCalls] = useState<ExecutedToolCall[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [hasServerApiKey, setHasServerApiKey] = useState<boolean | null>(null);

  // Google User & API Key states
  const [googleUser, setGoogleUser] = useState<GoogleUser>(() => {
    const saved = localStorage.getItem('zoya_google_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return {
      id: 'google-saurabh-101',
      name: 'Saurabh',
      email: 'singhnishu0609@gmail.com',
      picture:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
      isSignedIn: true,
    };
  });

  const [customApiKey, setCustomApiKey] = useState<string>(() => {
    return localStorage.getItem('gemini_custom_api_key') || '';
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const liveClientRef = useRef<LiveSessionClient | null>(null);

  // Check server health and API key status on mount
  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => {
        setHasServerApiKey(data.hasApiKey);
        if (!data.hasApiKey && !customApiKey) {
          setErrorMsg('GEMINI_API_KEY is not configured on the server. Click Google/API Key above to enter your key.');
        }
      })
      .catch((err) => {
        console.warn('Server health check error:', err);
      });
  }, [customApiKey]);

  // Initialize LiveSessionClient
  useEffect(() => {
    const client = new LiveSessionClient({
      onStateChange: (newState) => {
        setSessionState(newState);
      },
      onTranscript: (sender, text) => {
        setTranscripts((prev) => [
          ...prev,
          {
            id: String(Date.now() + Math.random()),
            sender,
            text,
            timestamp: Date.now(),
          },
        ]);
      },
      onToolCall: (toolCall) => {
        setToolCalls((prev) => [...prev, toolCall]);
      },
      onError: (err) => {
        setErrorMsg(err);
      },
      onMoodChange: (newMood) => {
        setMood(newMood);
      },
    });

    liveClientRef.current = client;

    return () => {
      client.disconnect();
    };
  }, []);

  const handleUpdateUser = (newUser: GoogleUser) => {
    setGoogleUser(newUser);
    localStorage.setItem('zoya_google_user', JSON.stringify(newUser));
  };

  const handleSaveApiKey = (key: string) => {
    setCustomApiKey(key);
    if (key) {
      localStorage.setItem('gemini_custom_api_key', key);
    } else {
      localStorage.removeItem('gemini_custom_api_key');
    }
  };

  const handleTogglePower = async () => {
    setErrorMsg(null);
    if (!liveClientRef.current) return;

    if (
      sessionState === 'idle' ||
      sessionState === 'listening' ||
      sessionState === 'speaking' ||
      sessionState === 'connecting'
    ) {
      liveClientRef.current.disconnect();
    } else {
      if (!hasServerApiKey && !customApiKey) {
        setErrorMsg('Please configure your Gemini API Key or sign in with Google to start Zoya.');
        setIsAuthModalOpen(true);
        return;
      }

      await liveClientRef.current.connect({
        apiKey: customApiKey || undefined,
        user: googleUser.isSignedIn
          ? { name: googleUser.name, email: googleUser.email }
          : undefined,
      });
    }
  };

  const handleToggleMute = () => {
    if (!liveClientRef.current) return;
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    liveClientRef.current.setMuteMic(newMuted);
  };

  const handleChangeMood = (newMood: MoodLighting) => {
    setMood(newMood);
  };

  const handleSelectQuickPrompt = (promptText: string) => {
    // Add prompt as user transcript
    setTranscripts((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        sender: 'user',
        text: promptText,
        timestamp: Date.now(),
      },
    ]);

    if (sessionState === 'disconnected') {
      handleTogglePower();
    }
  };

  // Dynamic background style based on active mood
  const getMoodBackground = () => {
    switch (mood) {
      case 'spicy':
        return 'from-slate-950 via-rose-950/40 to-slate-950';
      case 'cyberpunk':
        return 'from-slate-950 via-cyan-950/40 to-slate-900';
      case 'romantic':
        return 'from-slate-950 via-pink-950/40 to-purple-950/30';
      case 'zen':
        return 'from-slate-950 via-emerald-950/40 to-slate-900';
      case 'neon_violet':
      default:
        return 'from-slate-950 via-purple-950/40 to-slate-950';
    }
  };

  return (
    <div
      id="app-root"
      className="min-h-screen w-full bg-[#050505] text-[#e0e0e0] flex flex-col font-sans transition-colors duration-700 relative overflow-x-hidden selection:bg-pink-500 selection:text-white"
    >
      {/* Background Atmospheric Glows */}
      <div className="pointer-events-none absolute top-[-100px] left-[-100px] w-[500px] h-[500px] bg-pink-600/10 rounded-full blur-[120px]" />
      <div className="pointer-events-none absolute bottom-[-100px] right-[-100px] w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-[120px]" />

      {/* Scanning Lines Overlay */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.15)_50%),linear-gradient(90deg,rgba(255,0,0,0.01),rgba(0,255,0,0.005),rgba(0,0,255,0.01))] bg-[length:100%_4px,3px_100%] z-50 opacity-20" />

      {/* Header Navigation */}
      <nav className="relative z-10 w-full max-w-2xl mx-auto px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-pink-500 rounded-full shadow-[0_0_10px_#ec4899] animate-pulse" />
          <span className="text-xs font-mono tracking-[0.3em] uppercase text-pink-500 font-bold">
            LIVE SESSION
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Google Account Profile Button */}
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-xs font-mono backdrop-blur-md cursor-pointer"
            title="Google Account & API Settings"
          >
            {googleUser.isSignedIn ? (
              <>
                <img
                  src={
                    googleUser.picture ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'
                  }
                  alt={googleUser.name}
                  className="w-4 h-4 rounded-full object-cover border border-pink-500"
                />
                <span className="text-white font-medium max-w-[80px] sm:max-w-[120px] truncate">
                  {googleUser.name}
                </span>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.39 7.37 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.15 0 9.99 0 12s.45 3.85 1.24 5.42l4.04-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.37 0 3.26 2.61 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span className="text-pink-300 font-bold">Sign In</span>
              </>
            )}
          </button>

          {/* API Key Settings Button */}
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-cyan-400 transition-all cursor-pointer"
            title="Gemini API Key Configuration"
          >
            <Key className="w-3.5 h-3.5" />
          </button>

          <span className="text-[10px] font-mono bg-white/5 text-pink-300 border border-white/10 px-3 py-1 rounded-full hidden sm:flex items-center gap-1.5 backdrop-blur-md">
            <Radio className="w-3 h-3 text-pink-400 animate-pulse" />
            GEMINI-3.1-FLASH
          </span>
        </div>
      </nav>

      {/* Main Content Body */}
      <main className="relative z-10 flex-1 max-w-2xl w-full mx-auto px-6 py-2 flex flex-col items-center justify-between">
        {/* Branding Title Section */}
        <div className="text-center my-2 flex flex-col items-center">
          <h1 className="text-5xl sm:text-6xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-500 mb-1 italic">
            ZOYA
          </h1>
          <p className="text-[11px] font-mono text-pink-400/70 uppercase tracking-[0.4em] mb-2">
            ADVANCED NEURAL PERSONA
          </p>
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-500/30 backdrop-blur-md shadow-[0_0_15px_rgba(236,72,153,0.15)]">
            <span className="text-[10px] font-mono text-white/50 uppercase tracking-widest">MASTERMIND CREATOR:</span>
            <span className="text-xs font-mono font-bold text-pink-400 tracking-wider">SAURABH</span>
          </div>
        </div>

        {/* Error / Alert Notice */}
        <AnimatePresence>
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="w-full bg-rose-950/80 border border-rose-500/50 rounded-xl p-3 text-rose-200 text-xs flex items-start gap-2.5 shadow-xl my-2 backdrop-blur-md"
            >
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-bold">Notice: </span>
                {errorMsg}
              </div>
              <button
                onClick={() => setErrorMsg(null)}
                className="text-rose-400 hover:text-white text-xs font-mono underline"
              >
                Dismiss
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Central Core Futuristic Orb */}
        <FuturisticOrb
          sessionState={sessionState}
          mood={mood}
          micAnalyser={liveClientRef.current?.getMicAnalyser() || null}
          playerAnalyser={liveClientRef.current?.getPlayerAnalyser() || null}
          onOrbClick={handleTogglePower}
        />

        {/* Executed Tool Cards */}
        <ToolExecutionCard toolCalls={toolCalls} />

        {/* Subtitle / Transcript Overlay */}
        <TranscriptOverlay transcripts={transcripts} />

        {/* Personality & Stats */}
        <PersonalityCard />

        {/* Quick Voice Banter Prompts */}
        <QuickPrompts onSelectPrompt={handleSelectQuickPrompt} />

        {/* Control Bar */}
        <ControlBar
          sessionState={sessionState}
          isMuted={isMuted}
          mood={mood}
          onTogglePower={handleTogglePower}
          onToggleMute={handleToggleMute}
          onChangeMood={handleChangeMood}
        />
      </main>

      {/* Footer Status */}
      <footer className="relative z-10 py-4 px-6 border-t border-white/5 mt-4 text-center">
        <div className="max-w-2xl mx-auto flex justify-between items-center text-[10px] font-mono text-white/40">
          <div className="flex gap-6">
            <div>
              <span className="uppercase tracking-widest text-white/20 block">MODE</span>
              <span className="text-cyan-400 font-bold">VOICE-ONLY (FLIRTY)</span>
            </div>
            <div>
              <span className="uppercase tracking-widest text-white/20 block">CREATOR</span>
              <span className="text-pink-400 font-bold">SAURABH</span>
            </div>
          </div>
          <div className="text-right">
            <span className="uppercase tracking-widest text-white/20 block">SESSION ID</span>
            <span className="text-white/70">ZOYA_LIVE_4082_BETA</span>
          </div>
        </div>
      </footer>

      {/* Google Account & API Key Configuration Modal */}
      <GoogleAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        user={googleUser}
        onUpdateUser={handleUpdateUser}
        customApiKey={customApiKey}
        onSaveApiKey={handleSaveApiKey}
        hasServerApiKey={Boolean(hasServerApiKey)}
        onStartSession={() => {
          if (sessionState === 'disconnected') {
            handleTogglePower();
          }
        }}
      />
    </div>
  );
}
