import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleUser } from '../types';
import {
  Key,
  CheckCircle2,
  ShieldCheck,
  User,
  X,
  ExternalLink,
  Lock,
  Eye,
  EyeOff,
  LogOut,
  Sparkles,
  AlertCircle,
} from 'lucide-react';

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: GoogleUser;
  onUpdateUser: (user: GoogleUser) => void;
  customApiKey: string;
  onSaveApiKey: (key: string) => void;
  hasServerApiKey: boolean;
  onStartSession: () => void;
}

export const GoogleAuthModal: React.FC<GoogleAuthModalProps> = ({
  isOpen,
  onClose,
  user,
  onUpdateUser,
  customApiKey,
  onSaveApiKey,
  hasServerApiKey,
  onStartSession,
}) => {
  const [apiKeyInput, setApiKeyInput] = useState(customApiKey);
  const [showKey, setShowKey] = useState(false);
  const [customNameInput, setCustomNameInput] = useState(user.name);
  const [customEmailInput, setCustomEmailInput] = useState(user.email);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGoogleSignIn = () => {
    // Simulate Google Account OAuth sign-in flow
    const googleProfile: GoogleUser = {
      id: 'google-saurabh-101',
      name: customNameInput || 'Saurabh',
      email: customEmailInput || 'singhnishu0609@gmail.com',
      picture:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
      isSignedIn: true,
    };
    onUpdateUser(googleProfile);
    setSaveSuccessMsg('Successfully signed in with Google Account!');
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  const handleGoogleSignOut = () => {
    onUpdateUser({
      id: '',
      name: 'Guest User',
      email: 'guest@aistudio.google',
      picture: '',
      isSignedIn: false,
    });
    setSaveSuccessMsg('Signed out of Google Account');
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  const handleSaveKey = () => {
    onSaveApiKey(apiKeyInput.trim());
    setSaveSuccessMsg('Gemini API Key updated successfully!');
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  const handleStart = () => {
    onClose();
    onStartSession();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-lg bg-[#0e0d12] border border-pink-500/30 rounded-3xl p-6 shadow-[0_0_50px_rgba(236,72,153,0.2)] text-white overflow-hidden"
        >
          {/* Top Background Glow */}
          <div className="pointer-events-none absolute -top-24 -right-24 w-60 h-60 bg-pink-500/20 rounded-full blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-24 w-60 h-60 bg-cyan-500/20 rounded-full blur-3xl" />

          {/* Modal Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center shadow-lg shadow-pink-500/30">
                <Sparkles className="w-5 h-5 text-white animate-pulse" />
              </div>
              <div>
                <h3 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
                  Zoya Launch & Authentication
                </h3>
                <p className="text-xs text-white/50 font-mono">
                  Google Account & Gemini API Configuration
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Success Banner */}
          {saveSuccessMsg && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 font-mono"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{saveSuccessMsg}</span>
            </motion.div>
          )}

          {/* Section 1: Google Account Integration */}
          <div className="mt-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-pink-400 uppercase tracking-wider font-bold flex items-center gap-1.5">
                {/* Official Google Color SVG Icon */}
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
                Google Account Login
              </span>

              {user.isSignedIn && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Connected
                </span>
              )}
            </div>

            {user.isSignedIn ? (
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={
                        user.picture ||
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'
                      }
                      alt={user.name}
                      className="w-11 h-11 rounded-full object-cover border-2 border-pink-500 shadow-md"
                    />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-[#0e0d12] flex items-center justify-center">
                      <CheckCircle2 className="w-3 h-3 text-white" />
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                      {user.name}
                      <span className="text-[10px] font-mono text-pink-400 bg-pink-500/10 px-2 py-0.5 rounded-full border border-pink-500/20">
                        Mastermind
                      </span>
                    </h4>
                    <p className="text-xs text-white/50 font-mono">{user.email}</p>
                  </div>
                </div>

                <button
                  onClick={handleGoogleSignOut}
                  className="p-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-mono font-medium transition-all flex items-center gap-1.5"
                  title="Sign out of Google"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col gap-3">
                <p className="text-xs text-white/70 leading-relaxed">
                  Sign in with your Google Account so Zoya recognizes you, customizes voice interactions, and personalizes responses.
                </p>

                <div className="flex flex-col gap-2">
                  <button
                    onClick={handleGoogleSignIn}
                    className="w-full py-3 px-4 rounded-xl bg-white text-slate-900 font-medium text-xs flex items-center justify-center gap-3 hover:bg-slate-100 transition-all shadow-lg active:scale-[0.99]"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
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
                    <span>Sign in with Google Account</span>
                  </button>

                  <div className="flex items-center justify-between text-[11px] text-white/40 font-mono pt-1">
                    <span>Default Profile: Saurabh (singhnishu0609@gmail.com)</span>
                    <button
                      onClick={() => setIsEditingProfile(!isEditingProfile)}
                      className="text-pink-400 hover:underline"
                    >
                      {isEditingProfile ? 'Hide Custom Profile' : 'Edit Profile Info'}
                    </button>
                  </div>

                  {isEditingProfile && (
                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <div>
                        <label className="text-[10px] font-mono text-white/50 block mb-1">
                          Display Name:
                        </label>
                        <input
                          type="text"
                          value={customNameInput}
                          onChange={(e) => setCustomNameInput(e.target.value)}
                          placeholder="Saurabh"
                          className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-pink-500"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-mono text-white/50 block mb-1">
                          Google Email:
                        </label>
                        <input
                          type="text"
                          value={customEmailInput}
                          onChange={(e) => setCustomEmailInput(e.target.value)}
                          placeholder="singhnishu0609@gmail.com"
                          className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-pink-500"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Gemini API Key Configuration */}
          <div className="mt-6 space-y-3 pt-4 border-t border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider font-bold flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-cyan-400" />
                Gemini API Key Configuration
              </span>

              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                  hasServerApiKey || customApiKey
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                }`}
              >
                {customApiKey
                  ? 'Custom Key Active'
                  : hasServerApiKey
                  ? 'Server Key Active'
                  : 'Key Missing'}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col gap-3">
              <p className="text-xs text-white/70 leading-relaxed">
                {hasServerApiKey
                  ? 'Server environment has GEMINI_API_KEY injected automatically by Google AI Studio. You can optionally enter a custom key below.'
                  : 'Enter your custom Google Gemini API Key to enable real-time voice streaming with Zoya.'}
              </p>

              <div className="relative">
                <input
                  type={showKey ? 'text' : 'password'}
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder={
                    hasServerApiKey
                      ? '•••••••••••••••••••••••• (Using Server Secret)'
                      : 'AIzaSy...'
                  }
                  className="w-full bg-black/50 border border-white/15 rounded-xl px-3.5 py-2.5 pr-20 text-xs font-mono text-white focus:outline-none focus:border-cyan-400"
                />

                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="p-1.5 text-white/40 hover:text-white transition-colors"
                    title={showKey ? 'Hide key' : 'Show key'}
                  >
                    {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveKey}
                    className="px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-[11px] font-mono font-bold transition-all"
                  >
                    Save
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] font-mono text-white/40">
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-400 hover:underline flex items-center gap-1"
                >
                  Get API Key from Google AI Studio
                  <ExternalLink className="w-3 h-3" />
                </a>

                {customApiKey && (
                  <button
                    onClick={() => {
                      setApiKeyInput('');
                      onSaveApiKey('');
                    }}
                    className="text-rose-400 hover:underline"
                  >
                    Reset to Server Key
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 text-xs font-mono transition-colors"
            >
              Cancel
            </button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleStart}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 via-purple-600 to-cyan-600 text-white text-xs font-mono font-bold tracking-wider shadow-lg shadow-pink-500/25 flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 animate-pulse" />
              <span>START ZOYA SESSION</span>
            </motion.button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
