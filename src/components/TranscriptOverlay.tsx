import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TranscriptItem } from '../types';
import { MessageSquare, ChevronDown, ChevronUp, User, Sparkles, Volume2 } from 'lucide-react';

interface TranscriptOverlayProps {
  transcripts: TranscriptItem[];
}

export const TranscriptOverlay: React.FC<TranscriptOverlayProps> = ({ transcripts }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const logEndRef = useRef<HTMLDivElement | null>(null);

  const latestZoyaTranscript = [...transcripts].reverse().find((t) => t.sender === 'zoya');
  const latestUserTranscript = [...transcripts].reverse().find((t) => t.sender === 'user');

  useEffect(() => {
    if (isExpanded) {
      logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [transcripts, isExpanded]);

  if (transcripts.length === 0) return null;

  return (
    <div id="transcript-overlay-container" className="w-full max-w-xl mx-auto my-2 px-2">
      {/* HUD Subtitle Bar */}
      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-3 shadow-2xl flex flex-col gap-2">
        <div className="flex items-center justify-between border-b border-white/10 pb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-pink-400" />
            <span className="text-xs font-mono font-bold tracking-[0.2em] text-pink-400 uppercase">
              LIVE SPEECH TRANSCRIPT
            </span>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 text-xs font-mono text-cyan-400 hover:text-white bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded-lg border border-white/10 transition"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>{isExpanded ? 'Hide History' : `History (${transcripts.length})`}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Subtitle Snippet */}
        <div className="flex flex-col gap-1.5 py-1">
          <AnimatePresence mode="wait">
            {latestUserTranscript && (
              <motion.div
                key={latestUserTranscript.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="flex items-start gap-2 text-xs text-white/60"
              >
                <User className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                <p className="line-clamp-1 italic font-mono text-cyan-200">
                  You: "{latestUserTranscript.text}"
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {latestZoyaTranscript && (
              <motion.div
                key={latestZoyaTranscript.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="flex items-start gap-2 text-xs font-medium text-white"
              >
                <Volume2 className="w-4 h-4 text-pink-400 shrink-0 mt-0.5 animate-pulse" />
                <p className="line-clamp-2 leading-relaxed text-pink-100 italic">
                  Zoya: "{latestZoyaTranscript.text}"
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Expanded Transcript History Modal/Drawer */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden border-t border-white/10 pt-3 mt-1"
            >
              <div className="max-h-60 overflow-y-auto pr-2 flex flex-col gap-2 space-y-1">
                <AnimatePresence initial={false}>
                  {transcripts.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 15, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.25, ease: 'easeOut' }}
                      className={`p-2.5 rounded-xl text-xs flex items-start gap-2 ${
                        item.sender === 'zoya'
                          ? 'bg-pink-500/10 border border-pink-500/30 text-pink-100 ml-2'
                          : 'bg-black/30 border border-white/10 text-cyan-200 mr-2'
                      }`}
                    >
                      {item.sender === 'zoya' ? (
                        <Sparkles className="w-3.5 h-3.5 text-pink-400 shrink-0 mt-0.5" />
                      ) : (
                        <User className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <span className="font-mono text-[10px] font-bold tracking-wider uppercase block text-white/40">
                          {item.sender === 'zoya' ? 'ZOYA' : 'YOU'}
                        </span>
                        <p className="mt-0.5 leading-relaxed">{item.text}</p>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                <div ref={logEndRef} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
