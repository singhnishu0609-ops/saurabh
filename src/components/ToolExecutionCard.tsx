import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ExecutedToolCall } from '../types';
import { ExternalLink, CloudSun, Timer, Palette, Music, CheckCircle2, Terminal } from 'lucide-react';

interface ToolExecutionCardProps {
  toolCalls: ExecutedToolCall[];
}

export const ToolExecutionCard: React.FC<ToolExecutionCardProps> = ({ toolCalls }) => {
  if (toolCalls.length === 0) return null;

  const latestCall = toolCalls[toolCalls.length - 1];

  return (
    <div id="tool-execution-container" className="w-full max-w-xl mx-auto my-2">
      <AnimatePresence mode="wait">
        <motion.div
          key={latestCall.id}
          initial={{ opacity: 0, y: 15, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white/5 border border-white/10 rounded-2xl p-4 shadow-2xl backdrop-blur-md text-slate-200"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-2.5 mb-3">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyan-400 animate-pulse" />
              <span className="text-xs font-mono font-bold tracking-[0.2em] text-cyan-400 uppercase">
                BROWSER ACTION EXECUTED
              </span>
            </div>
            <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">
              <CheckCircle2 className="w-3 h-3" />
              COMPLETED
            </span>
          </div>

          {/* Render based on tool name */}
          {latestCall.name === 'openWebsite' && (
            <div className="flex flex-col gap-2">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <ExternalLink className="w-4 h-4 text-cyan-400" />
                    {latestCall.args.title || 'Target Website'}
                  </h4>
                  <p className="text-xs text-slate-400 font-mono mt-0.5 break-all">
                    {latestCall.args.url}
                  </p>
                </div>
                <a
                  href={latestCall.args.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg text-xs font-semibold hover:opacity-90 flex items-center gap-1 shadow-lg shadow-cyan-500/20"
                >
                  Visit Site
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              {latestCall.args.reason && (
                <p className="text-xs italic text-pink-300/90 bg-pink-950/30 border border-pink-500/20 p-2 rounded-lg mt-1">
                  Zoya says: "{latestCall.args.reason}"
                </p>
              )}
            </div>
          )}

          {latestCall.name === 'getWeather' && (
            <div className="flex items-center justify-between bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              <div className="flex items-center gap-3">
                <CloudSun className="w-8 h-8 text-amber-400 shrink-0" />
                <div>
                  <h4 className="text-sm font-bold text-white">
                    {latestCall.args.location || 'Location'}
                  </h4>
                  <p className="text-xs text-slate-400">Sunny with a sassy breeze</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xl font-black text-amber-300">24°C</span>
                <p className="text-[10px] text-slate-400 font-mono">75°F</p>
              </div>
            </div>
          )}

          {latestCall.name === 'setTimeReminder' && (
            <TimerWidget seconds={latestCall.args.seconds} label={latestCall.args.label} />
          )}

          {latestCall.name === 'changeMoodLighting' && (
            <div className="flex items-center gap-3 p-2.5 bg-purple-950/30 border border-purple-500/30 rounded-xl">
              <Palette className="w-5 h-5 text-purple-400 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-purple-200">
                  Mood lighting updated to <span className="uppercase text-pink-400 font-bold">{latestCall.args.mood}</span>
                </p>
                <p className="text-[10px] text-slate-400">UI atmosphere synced live</p>
              </div>
            </div>
          )}

          {latestCall.name === 'playVibeSound' && (
            <div className="flex items-center gap-3 p-2.5 bg-pink-950/30 border border-pink-500/30 rounded-xl">
              <Music className="w-5 h-5 text-pink-400 shrink-0 animate-bounce" />
              <div>
                <p className="text-xs font-semibold text-pink-200">
                  Played audio vibe: <span className="uppercase text-amber-300 font-bold">{latestCall.args.soundType}</span>
                </p>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

// Sub-component for live timer countdown
const TimerWidget: React.FC<{ seconds: number; label: string }> = ({ seconds, label }) => {
  const [timeLeft, setTimeLeft] = useState(seconds);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft]);

  return (
    <div className="flex items-center justify-between bg-slate-950/60 p-3 rounded-xl border border-slate-800">
      <div className="flex items-center gap-3">
        <Timer className="w-6 h-6 text-cyan-400 animate-pulse shrink-0" />
        <div>
          <h4 className="text-xs font-bold text-slate-200">{label || 'Reminder'}</h4>
          <p className="text-[10px] text-slate-400 font-mono">COUNTDOWN ACTIVE</p>
        </div>
      </div>
      <div className="text-right">
        <span className="text-xl font-black font-mono text-cyan-300">
          {timeLeft > 0 ? `${timeLeft}s` : 'DONE!'}
        </span>
      </div>
    </div>
  );
};
