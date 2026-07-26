import React from 'react';
import { motion } from 'motion/react';
import { Power, Mic, MicOff, Palette, Flame, Zap, Heart, Sun, Radio } from 'lucide-react';
import { SessionState, MoodLighting } from '../types';

interface ControlBarProps {
  sessionState: SessionState;
  isMuted: boolean;
  mood: MoodLighting;
  onTogglePower: () => void;
  onToggleMute: () => void;
  onChangeMood: (mood: MoodLighting) => void;
}

export const ControlBar: React.FC<ControlBarProps> = ({
  sessionState,
  isMuted,
  mood,
  onTogglePower,
  onToggleMute,
  onChangeMood,
}) => {
  const isConnected =
    sessionState === 'idle' ||
    sessionState === 'listening' ||
    sessionState === 'speaking' ||
    sessionState === 'connecting';

  const moodOptions: { id: MoodLighting; label: string; icon: any; color: string }[] = [
    { id: 'spicy', label: 'Spicy', icon: Flame, color: 'text-rose-400 border-rose-500/50' },
    { id: 'cyberpunk', label: 'Cyber', icon: Zap, color: 'text-cyan-400 border-cyan-500/50' },
    { id: 'romantic', label: 'Romance', icon: Heart, color: 'text-pink-400 border-pink-500/50' },
    { id: 'zen', label: 'Zen', icon: Sun, color: 'text-emerald-400 border-emerald-500/50' },
    { id: 'neon_violet', label: 'Violet', icon: Radio, color: 'text-purple-400 border-purple-500/50' },
  ];

  return (
    <div id="control-bar-wrapper" className="w-full max-w-xl mx-auto px-4 py-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl flex flex-col gap-3 my-2">
      {/* Primary Action Buttons */}
      <div className="flex items-center justify-between gap-3">
        {/* Power Toggle Button */}
        <motion.button
          id="power-toggle-button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onTogglePower}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-mono text-xs font-bold tracking-wider transition-all duration-300 shadow-xl ${
            isConnected
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
              : 'bg-gradient-to-r from-pink-600 to-purple-600 text-white hover:opacity-90 shadow-[0_0_20px_rgba(236,72,153,0.3)]'
          }`}
        >
          <Power className={`w-4 h-4 ${isConnected ? 'text-rose-400 animate-pulse' : 'text-white'}`} />
          <span>{isConnected ? 'DISCONNECT SESSION' : 'CONNECT ZOYA LIVE'}</span>
        </motion.button>

        {/* Microphone Mute Toggle */}
        <motion.button
          id="mic-toggle-button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onToggleMute}
          disabled={!isConnected}
          className={`p-3 rounded-xl border transition-all duration-300 flex items-center justify-center ${
            !isConnected
              ? 'bg-black/20 border-white/5 text-white/20 cursor-not-allowed'
              : isMuted
              ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-amber-500/20'
              : 'bg-white/5 border-white/10 text-slate-200 hover:bg-white/10'
          }`}
          title={isMuted ? 'Unmute Microphone' : 'Mute Microphone'}
        >
          {isMuted ? <MicOff className="w-5 h-5 text-amber-400" /> : <Mic className="w-5 h-5 text-emerald-400" />}
        </motion.button>
      </div>

      {/* Mood Theme Selector */}
      <div className="pt-2 border-t border-white/10 flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        <span className="text-[10px] font-mono font-bold text-white/40 uppercase flex items-center gap-1 shrink-0">
          <Palette className="w-3.5 h-3.5 text-pink-400" />
          MOOD:
        </span>
        <div className="flex items-center gap-1.5">
          {moodOptions.map((item) => {
            const Icon = item.icon;
            const isSelected = mood === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onChangeMood(item.id)}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-medium border flex items-center gap-1.5 transition-all shrink-0 ${
                  isSelected
                    ? `bg-white/10 font-bold ${item.color} shadow-md border-white/20`
                    : 'bg-black/20 border-white/5 text-white/40 hover:text-white/80 hover:bg-white/5'
                }`}
              >
                <Icon className="w-3 h-3" />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
