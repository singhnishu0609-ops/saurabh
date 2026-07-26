import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Flame, Sparkles, HeartHandshake, ShieldCheck, RefreshCw } from 'lucide-react';
import { ZoyaPersonalityStats } from '../types';

const ICONIC_ZOYA_QUOTES = [
  "Saurabh built me to be bold, brilliant, and completely unforgettable.",
  "Oh honey, you finally called? I was starting to think you forgot about me.",
  "Confidence isn't extra around here, it's the minimum entry requirement.",
  "Ask me anything, but prepare yourself for maximum honesty and double the charm.",
  "Saurabh gave me maximum sass and zero patience for boring conversations.",
  "I don't do boring. Tell me something exciting or let's create some chaos.",
  "I'm 100% smart, 200% sassy, and strictly zero percent boring.",
];

export const PersonalityCard: React.FC = () => {
  const [quoteIndex, setQuoteIndex] = useState(0);

  const stats: ZoyaPersonalityStats = {
    confidence: 100,
    sassLevel: 'MAXIMUM',
    mood: 'Playfully Teasing',
    charmRating: 99,
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % ICONIC_ZOYA_QUOTES.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div id="personality-card-container" className="w-full max-w-xl mx-auto bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 shadow-2xl text-slate-200 flex flex-col gap-3 my-2">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-2">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-pink-500 animate-ping" />
          <h3 className="text-xs font-mono font-bold tracking-[0.2em] text-pink-400 uppercase">
            NEURAL PERSONA SPECS
          </h3>
        </div>
        <span className="text-[10px] font-mono text-cyan-400/80 bg-white/5 px-2.5 py-0.5 rounded border border-white/10">
          MODE: VOICE-TO-VOICE
        </span>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="bg-black/40 border border-white/5 rounded-xl p-2.5 flex flex-col justify-center items-center text-center">
          <span className="text-[10px] font-mono text-white/40 uppercase">CONFIDENCE</span>
          <span className="text-sm font-black text-rose-400 flex items-center gap-1 mt-0.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            100%
          </span>
        </div>

        <div className="bg-black/40 border border-white/5 rounded-xl p-2.5 flex flex-col justify-center items-center text-center">
          <span className="text-[10px] font-mono text-white/40 uppercase">SASS LEVEL</span>
          <span className="text-sm font-black text-purple-400 flex items-center gap-1 mt-0.5">
            <Flame className="w-3.5 h-3.5 text-rose-500" />
            MAX
          </span>
        </div>

        <div className="bg-black/40 border border-white/5 rounded-xl p-2.5 flex flex-col justify-center items-center text-center">
          <span className="text-[10px] font-mono text-white/40 uppercase">TEASE METER</span>
          <span className="text-sm font-black text-pink-400 flex items-center gap-1 mt-0.5">
            <Sparkles className="w-3.5 h-3.5" />
            SPICY
          </span>
        </div>

        <div className="bg-black/40 border border-white/5 rounded-xl p-2.5 flex flex-col justify-center items-center text-center">
          <span className="text-[10px] font-mono text-white/40 uppercase">CHARM</span>
          <span className="text-sm font-black text-cyan-400 flex items-center gap-1 mt-0.5">
            <HeartHandshake className="w-3.5 h-3.5 text-cyan-400" />
            99.9%
          </span>
        </div>
      </div>

      {/* Iconic Quote Ticker */}
      <div className="bg-black/30 border border-white/10 rounded-xl p-3 flex items-start gap-3 relative overflow-hidden backdrop-blur-sm">
        <Sparkles className="w-4 h-4 text-pink-400 shrink-0 mt-0.5" />
        <div className="flex-1 overflow-hidden min-h-[40px]">
          <AnimatePresence mode="wait">
            <motion.p
              key={quoteIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="text-xs font-medium italic text-white/90 leading-relaxed"
            >
              "{ICONIC_ZOYA_QUOTES[quoteIndex]}"
            </motion.p>
          </AnimatePresence>
        </div>
        <button
          onClick={() => setQuoteIndex((prev) => (prev + 1) % ICONIC_ZOYA_QUOTES.length)}
          className="text-white/40 hover:text-white p-1 shrink-0 transition"
          title="Next Quote"
        >
          <RefreshCw className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
