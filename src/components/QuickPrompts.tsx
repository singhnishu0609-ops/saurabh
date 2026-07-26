import React from 'react';
import { motion } from 'motion/react';
import { MessageCircleHeart, Sparkles, ExternalLink, Timer, Flame, CloudSun } from 'lucide-react';

interface QuickPromptsProps {
  onSelectPrompt: (promptText: string) => void;
  isDisabled?: boolean;
}

export const QuickPrompts: React.FC<QuickPromptsProps> = ({ onSelectPrompt, isDisabled }) => {
  const prompts = [
    { label: 'Who created you?', icon: Sparkles, color: 'hover:border-pink-500/50 hover:bg-pink-950/30 text-pink-300' },
    { label: 'Give me a witty one-liner', icon: Flame, color: 'hover:border-rose-500/50 hover:bg-rose-950/30 text-rose-300' },
    { label: 'Open YouTube for me', icon: ExternalLink, color: 'hover:border-cyan-500/50 hover:bg-cyan-950/30 text-cyan-300' },
    { label: 'Set a 10s timer', icon: Timer, color: 'hover:border-amber-500/50 hover:bg-amber-950/30 text-amber-300' },
    { label: 'Change mood to Cyberpunk', icon: MessageCircleHeart, color: 'hover:border-purple-500/50 hover:bg-purple-950/30 text-purple-300' },
    { label: "What's the weather in Paris?", icon: CloudSun, color: 'hover:border-emerald-500/50 hover:bg-emerald-950/30 text-emerald-300' },
  ];

  return (
    <div id="quick-prompts-container" className="w-full max-w-xl mx-auto my-3 px-2">
      <div className="flex items-center gap-1.5 mb-2">
        <Sparkles className="w-3.5 h-3.5 text-pink-400" />
        <span className="text-[10px] font-mono font-bold tracking-[0.2em] text-white/40 uppercase">
          TEST ZOYA'S BANTER & TOOLS
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {prompts.map((p, idx) => {
          const Icon = p.icon;
          return (
            <motion.button
              key={idx}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={isDisabled}
              onClick={() => onSelectPrompt(p.label)}
              className={`p-2.5 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md text-xs font-mono font-medium text-left flex items-center gap-2 transition-all shadow-md hover:border-pink-500/40 hover:bg-white/10 ${p.color} ${
                isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0 text-pink-400" />
              <span className="line-clamp-1">{p.label}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
