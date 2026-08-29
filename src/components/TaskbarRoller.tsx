import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Pin,
  PinOff,
  Skull,
  ChevronLeft,
  ChevronRight,
  Mic,
  MicOff,
  Sparkles,
  Bot,
  Layers,
  Cpu,
  HardDrive,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Plus,
  Maximize2,
  X,
  Volume2,
  Monitor,
  Activity,
  Terminal,
} from 'lucide-react';
import { RunningApp, Coordinates } from '../types';
import { sound } from '../services/soundService';

interface TaskbarRollerProps {
  runningApps: RunningApp[];
  activeAppIndex: number;
  onSelectAppIndex: (index: number) => void;
  onTogglePinTop: (appId: string) => void;
  onForceKillApp: (appId: string) => void;
  onRestoreApps: () => void;
  isMicMuted: boolean;
  onToggleMicMute: () => void;
  onOpenAIChat: () => void;
  onOpenHUD: (pos?: Coordinates) => void;
  soundEffects: boolean;
}

export const TaskbarRoller: React.FC<TaskbarRollerProps> = ({
  runningApps,
  activeAppIndex,
  onSelectAppIndex,
  onTogglePinTop,
  onForceKillApp,
  onRestoreApps,
  isMicMuted,
  onToggleMicMute,
  onOpenAIChat,
  onOpenHUD,
  soundEffects,
}) => {
  const [currentTime, setCurrentTime] = useState('');
  const [killedNotification, setKilledNotification] = useState<string | null>(null);

  // Live Windows clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const safeIndex =
    runningApps.length > 0
      ? Math.max(0, Math.min(activeAppIndex, runningApps.length - 1))
      : 0;

  const currentApp = runningApps[safeIndex];

  const handlePrev = () => {
    if (runningApps.length <= 1) return;
    const newIdx = (safeIndex - 1 + runningApps.length) % runningApps.length;
    onSelectAppIndex(newIdx);
    sound.playPop(soundEffects);
  };

  const handleNext = () => {
    if (runningApps.length <= 1) return;
    const newIdx = (safeIndex + 1) % runningApps.length;
    onSelectAppIndex(newIdx);
    sound.playPop(soundEffects);
  };

  const handleForceKill = (app: RunningApp) => {
    sound.playKill(soundEffects);
    setKilledNotification(`Wymuszono zamknięcie: ${app.processName} (PID: ${app.pid})`);
    onForceKillApp(app.id);
    setTimeout(() => {
      setKilledNotification(null);
    }, 3200);
  };

  return (
    <footer
      id="windows-fluent-taskbar"
      className="fixed bottom-0 left-0 right-0 z-40 h-14 bg-slate-950/90 backdrop-blur-2xl border-t border-slate-800/80 shadow-[0_-8px_30px_rgba(0,0,0,0.5)] flex items-center justify-between px-3 md:px-5 select-none"
    >
      {/* 1. Left Section: Windows Start Orb & Quick AI Button */}
      <div className="flex items-center gap-2">
        {/* Windows Start Launcher button */}
        <button
          onClick={() => onOpenHUD()}
          title="KursorAssist HUD (Alt+Q)"
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-500/20 transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-cyan-300 animate-spin-slow" />
          <span className="hidden sm:inline font-sans">KursorAssist</span>
        </button>

        {/* Quick Gemini / ChatGPT Button */}
        <button
          id="taskbar-ai-chat-btn"
          onClick={() => {
            sound.playPop(soundEffects);
            onOpenAIChat();
          }}
          title="Szybki Czat AI (Gemini / ChatGPT)"
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 hover:border-cyan-500/50 text-xs font-semibold shadow transition-all cursor-pointer group"
        >
          <div className="w-2 h-2 rounded-full bg-cyan-400 group-hover:animate-ping" />
          <Bot className="w-4 h-4 text-cyan-400" />
          <span className="hidden md:inline">Czat Gemini / GPT</span>
        </button>
      </div>

      {/* 2. Center Section: Taskbar Roller / Carousel App Switcher */}
      <div className="flex-1 max-w-2xl mx-2 flex items-center justify-center">
        {runningApps.length === 0 ? (
          <div className="flex items-center gap-3 px-4 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-400">
            <span>Brak aktywnych procesów w pasku</span>
            <button
              onClick={onRestoreApps}
              className="flex items-center gap-1 text-blue-400 hover:text-blue-300 font-bold underline cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              Przywróć domyślne aplikacje
            </button>
          </div>
        ) : (
          <div className="relative w-full flex items-center justify-between gap-1 sm:gap-2 bg-slate-900/95 border border-slate-700/70 p-1.5 rounded-2xl shadow-inner">
            
            {/* Roller Scroll Left Button */}
            <button
              onClick={handlePrev}
              title="Poprzednia aplikacja (kółko myszy w lewo)"
              className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Active App Roller Card Container */}
            <div className="flex-1 overflow-hidden relative min-h-[36px] flex items-center justify-center">
              <AnimatePresence mode="wait">
                {currentApp && (
                  <motion.div
                    key={currentApp.id}
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.96 }}
                    transition={{ duration: 0.18, ease: 'easeOut' }}
                    className="w-full flex items-center justify-between gap-2 px-2"
                  >
                    {/* App Identity & Status Indicator */}
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border ${
                          currentApp.status === 'unresponsive'
                            ? 'bg-rose-500/20 border-rose-500 text-rose-400 animate-pulse'
                            : currentApp.isPinnedTop
                            ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                            : 'bg-blue-500/20 border-blue-500/50 text-blue-300'
                        }`}
                      >
                        <Layers className="w-3.5 h-3.5" />
                      </div>

                      <div className="min-w-0 text-left">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-white truncate max-w-[140px] sm:max-w-[220px]">
                            {currentApp.title}
                          </span>
                          {currentApp.status === 'unresponsive' && (
                            <span className="shrink-0 px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                              Brak odpowiedzi!
                            </span>
                          )}
                          {currentApp.isPinnedTop && (
                            <span className="shrink-0 px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-0.5">
                              <Pin className="w-2.5 h-2.5" />
                              Na wierzchu
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                          <span className="text-slate-300">{currentApp.processName}</span>
                          <span>PID: {currentApp.pid}</span>
                          <span className="hidden sm:inline text-slate-500">
                            RAM: {currentApp.ramUsageMb} MB
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Quick App Action Bar: PIN TO TOP & FORCE KILL */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      {/* 1. Always on Top Pin Button */}
                      <button
                        onClick={() => {
                          onTogglePinTop(currentApp.id);
                          sound.playClick(soundEffects);
                        }}
                        title={
                          currentApp.isPinnedTop
                            ? 'Odepnij z wierzchu ekranu'
                            : 'Przypnij aplikację zawsze na wierzchu (Always on Top)'
                        }
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          currentApp.isPinnedTop
                            ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-300 border border-slate-700'
                        }`}
                      >
                        {currentApp.isPinnedTop ? (
                          <>
                            <Pin className="w-3 h-3 fill-slate-950" />
                            <span className="hidden sm:inline">Przypięte</span>
                          </>
                        ) : (
                          <>
                            <Pin className="w-3 h-3" />
                            <span className="hidden sm:inline">Przypnij</span>
                          </>
                        )}
                      </button>

                      {/* 2. FORCE KILL PROCESS BUTTON */}
                      <button
                        onClick={() => handleForceKill(currentApp)}
                        title={`Wymuś natychmiastowe zabicie procesu (taskkill /F /PID ${currentApp.pid})`}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-rose-600/90 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-600/20 border border-rose-500/40 transition-all active:scale-95 cursor-pointer"
                      >
                        <Skull className="w-3 h-3" />
                        <span className="hidden sm:inline">Zabij proces</span>
                        <span className="sm:hidden">Zabij</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Roller Scroll Right Button */}
            <button
              onClick={handleNext}
              title="Następna aplikacja (kółko myszy w prawo)"
              className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* 3. Right Section: Global Microphone Mute & System Tray */}
      <div className="flex items-center gap-2">
        {/* Global Microphone Mute Toggle */}
        <button
          id="global-mic-mute-btn"
          onClick={() => {
            sound.playMute(!isMicMuted, soundEffects);
            onToggleMicMute();
          }}
          title={
            isMicMuted
              ? 'Mikrofon jest WYCISZONY (Kliknij, aby włączyć - Ctrl+M)'
              : 'Mikrofon jest AKTYWNY (Kliknij, aby wyciszyć - Ctrl+M)'
          }
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border font-bold text-xs transition-all cursor-pointer shadow-md ${
            isMicMuted
              ? 'bg-rose-600/20 border-rose-500 text-rose-300 hover:bg-rose-600/30'
              : 'bg-emerald-600/20 border-emerald-500 text-emerald-300 hover:bg-emerald-600/30'
          }`}
        >
          {isMicMuted ? (
            <>
              <MicOff className="w-3.5 h-3.5 text-rose-400" />
              <span className="hidden sm:inline text-rose-300">Wyciszony</span>
            </>
          ) : (
            <>
              <div className="relative">
                <Mic className="w-3.5 h-3.5 text-emerald-400" />
                <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              </div>
              <span className="hidden sm:inline text-emerald-300">Mikrofon ON</span>
            </>
          )}
        </button>

        {/* Windows Clock Tray */}
        <div className="hidden sm:flex flex-col items-end justify-center px-2 py-0.5 text-right font-mono">
          <span className="text-xs font-bold text-slate-200">{currentTime}</span>
          <span className="text-[10px] text-slate-500">Windows 11</span>
        </div>
      </div>

      {/* Floating Taskkill Toast Banner */}
      <AnimatePresence>
        {killedNotification && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-16 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2 rounded-2xl bg-rose-950 border border-rose-500 text-rose-200 text-xs font-semibold shadow-2xl backdrop-blur-md"
          >
            <Skull className="w-4 h-4 text-rose-400 animate-bounce" />
            <span>{killedNotification}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </footer>
  );
};
