import React, { useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { SessionState, MoodLighting } from '../types';
import { Sparkles, Mic, Volume2, Radio, Zap, AlertCircle } from 'lucide-react';

interface FuturisticOrbProps {
  sessionState: SessionState;
  mood: MoodLighting;
  micAnalyser: AnalyserNode | null;
  playerAnalyser: AnalyserNode | null;
  onOrbClick: () => void;
  primaryColor?: string;
}

export const FuturisticOrb: React.FC<FuturisticOrbProps> = ({
  sessionState,
  mood,
  micAnalyser,
  playerAnalyser,
  onOrbClick,
  primaryColor,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Determine glow colors based on mood
  const getGlowColors = () => {
    if (primaryColor) {
      return {
        primary: primaryColor,
        secondary: '#a855f7',
        border: 'rgba(236, 72, 153, 0.4)',
      };
    }
    switch (mood) {
      case 'spicy':
        return { primary: '#f43f5e', secondary: '#fb7185', border: 'rgba(244, 63, 94, 0.5)' };
      case 'cyberpunk':
        return { primary: '#06b6d4', secondary: '#facc15', border: 'rgba(6, 182, 212, 0.5)' };
      case 'romantic':
        return { primary: '#ec4899', secondary: '#c084fc', border: 'rgba(236, 72, 153, 0.5)' };
      case 'zen':
        return { primary: '#10b981', secondary: '#34d399', border: 'rgba(16, 185, 129, 0.5)' };
      case 'neon_violet':
      default:
        return { primary: '#8b5cf6', secondary: '#d946ef', border: 'rgba(139, 92, 246, 0.5)' };
    }
  };

  const colors = getGlowColors();

  // Canvas visualizer loop for reactive audio frequencies
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    const dataArray = new Uint8Array(128);

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;
      const radius = Math.min(width, height) / 3.2;

      ctx.clearRect(0, 0, width, height);

      let currentAnalyser = null;
      if (sessionState === 'speaking') {
        currentAnalyser = playerAnalyser;
      } else if (sessionState === 'listening' || sessionState === 'idle') {
        currentAnalyser = micAnalyser;
      }

      if (currentAnalyser) {
        currentAnalyser.getByteFrequencyData(dataArray);
      } else {
        // Subtle ambient oscillation if no active analyser
        for (let i = 0; i < 128; i++) {
          dataArray[i] = Math.sin(Date.now() * 0.003 + i * 0.1) * 20 + 20;
        }
      }

      // Draw outer frequency ring
      const bars = 64;
      const step = (Math.PI * 2) / bars;

      ctx.save();
      ctx.translate(centerX, centerY);

      for (let i = 0; i < bars; i++) {
        const val = dataArray[i % dataArray.length] || 10;
        const barHeight = (val / 255) * 45;
        const angle = i * step;

        const x1 = Math.cos(angle) * radius;
        const y1 = Math.sin(angle) * radius;
        const x2 = Math.cos(angle) * (radius + barHeight);
        const y2 = Math.sin(angle) * (radius + barHeight);

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = i % 2 === 0 ? colors.primary : colors.secondary;
        ctx.shadowColor = colors.primary;
        ctx.shadowBlur = 10;
        ctx.stroke();
      }

      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [sessionState, micAnalyser, playerAnalyser, colors]);

  const getStateBadge = () => {
    switch (sessionState) {
      case 'connecting':
        return { label: 'CONNECTING TO ZOYA...', bg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40', icon: Radio };
      case 'listening':
        return { label: 'ZOYA IS LISTENING...', bg: 'bg-pink-500/20 text-pink-300 border-pink-500/40', icon: Mic };
      case 'speaking':
        return { label: 'ZOYA IS TALKING...', bg: 'bg-purple-500/20 text-purple-300 border-purple-500/40', icon: Volume2 };
      case 'interrupted':
        return { label: 'INTERRUPTED', bg: 'bg-amber-500/20 text-amber-300 border-amber-500/40', icon: Zap };
      case 'error':
        return { label: 'CONNECTION ERROR', bg: 'bg-rose-500/20 text-rose-300 border-rose-500/40', icon: AlertCircle };
      case 'idle':
        return { label: 'ZOYA ONLINE', bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40', icon: Sparkles };
      case 'disconnected':
      default:
        return { label: 'TAP TO WAKE ZOYA', bg: 'bg-slate-800/80 text-slate-300 border-slate-700', icon: Sparkles };
    }
  };

  const badge = getStateBadge();
  const BadgeIcon = badge.icon;

  return (
    <div id="futuristic-orb-container" className="relative flex flex-col items-center justify-center my-6 select-none">
      {/* Immersive Pulsing Concentric Outer Rings */}
      <div className="relative flex items-center justify-center w-72 h-72 sm:w-96 sm:h-96">
        <div className="absolute w-[360px] h-[360px] sm:w-[400px] sm:h-[400px] border border-white/5 rounded-full pointer-events-none" />
        <div className="absolute w-[280px] h-[280px] sm:w-[320px] sm:h-[320px] border border-pink-500/10 rounded-full pointer-events-none" />
        <div className="absolute w-[200px] h-[200px] sm:w-[240px] sm:h-[240px] border border-cyan-400/20 rounded-full shadow-[0_0_40px_rgba(34,211,238,0.1)] pointer-events-none" />

        {/* Floating Ambient Status Particles */}
        <div className="absolute top-2 right-12 w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_10px_#22d3ee] animate-pulse pointer-events-none" />
        <div className="absolute bottom-16 left-6 w-1.5 h-1.5 bg-pink-400 rounded-full shadow-[0_0_8px_#ec4899] opacity-70 pointer-events-none" />

        {sessionState === 'speaking' && (
          <>
            <motion.div
              className="absolute inset-4 rounded-full border-2 opacity-60 pointer-events-none"
              style={{ borderColor: colors.primary }}
              animate={{ scale: [1, 1.35, 1.6], opacity: [0.8, 0.3, 0] }}
              transition={{ repeat: Infinity, duration: 1.8, ease: 'easeOut' }}
            />
            <motion.div
              className="absolute inset-4 rounded-full border-2 opacity-40 pointer-events-none"
              style={{ borderColor: colors.secondary }}
              animate={{ scale: [1, 1.25, 1.5], opacity: [0.6, 0.2, 0] }}
              transition={{ repeat: Infinity, duration: 2.2, ease: 'easeOut', delay: 0.4 }}
            />
          </>
        )}

        {sessionState === 'listening' && (
          <motion.div
            className="absolute inset-8 rounded-full border border-dashed border-pink-500/40 pointer-events-none"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 8, ease: 'linear' }}
          />
        )}

        {/* Audio Reactive Canvas Overlay */}
        <canvas
          ref={canvasRef}
          width={380}
          height={380}
          className="absolute inset-0 z-10 pointer-events-none w-full h-full"
        />

        {/* Central Core Orb Button */}
        <motion.button
          id="central-orb-button"
          onClick={onOrbClick}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative z-20 flex flex-col items-center justify-center w-48 h-48 sm:w-52 sm:h-52 rounded-full bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border border-white/10 shadow-2xl overflow-hidden cursor-pointer group"
        >
          {/* Inner Core Glow */}
          <div className="absolute inset-0 rounded-full bg-pink-500/10 blur-xl group-hover:bg-pink-500/20 transition-all" />

          {/* Glowing Mic Circle Core */}
          <div className="w-16 h-16 bg-pink-500 rounded-full flex items-center justify-center shadow-[0_0_35px_#ec4899] z-30 group-hover:scale-110 transition-transform">
            {sessionState === 'speaking' ? (
              <Volume2 className="w-8 h-8 text-white animate-bounce" />
            ) : sessionState === 'listening' ? (
              <Mic className="w-8 h-8 text-white animate-pulse" />
            ) : (
              <Sparkles className="w-8 h-8 text-white" />
            )}
          </div>

          <span className="relative z-30 text-[10px] font-mono font-bold tracking-widest text-white/80 uppercase mt-3">
            {sessionState === 'disconnected'
              ? 'WAKE ZOYA'
              : sessionState === 'speaking'
              ? 'ZOYA TALKING'
              : sessionState === 'listening'
              ? 'LISTENING'
              : 'ZOYA ACTIVE'}
          </span>
        </motion.button>
      </div>

      {/* State Badge Pill */}
      <div className="mt-2 flex items-center gap-2 z-20">
        <span
          className={`px-4 py-1.5 rounded-full text-xs font-mono font-bold tracking-wider border backdrop-blur-md flex items-center gap-2 shadow-lg ${badge.bg}`}
        >
          <BadgeIcon className="w-3.5 h-3.5 animate-pulse" />
          {badge.label}
        </span>
      </div>
    </div>
  );
};
