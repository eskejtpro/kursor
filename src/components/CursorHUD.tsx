import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Mic,
  Languages,
  ScanText,
  Volume2,
  Wand2,
  StickyNote,
  ZoomIn,
  Code2,
  X,
  Keyboard,
  Sparkles,
  Command,
  Bot,
  Layers,
  Clipboard,
  FileText,
  Pin,
  Zap,
  Sliders,
  Shield,
  Eye,
  Settings,
} from 'lucide-react';
import { ActionItem, ActiveTool, AppSettings, Coordinates } from '../types';
import { sound } from '../services/soundService';

interface CursorHUDProps {
  isOpen: boolean;
  position: Coordinates;
  settings: AppSettings;
  onSelectTool: (tool: ActiveTool) => void;
  onClose: () => void;
}

export const DEFAULT_ACTIONS: ActionItem[] = [
  {
    id: 'ai_chat',
    tool: 'ai_chat',
    label: 'Czat Gemini / GPT',
    description: 'Szybki asystent AI, szablony promptów i bezpośredni dostęp',
    iconName: 'Bot',
    shortcut: '1',
    color: 'from-cyan-500 to-blue-600',
    badge: 'AI Chat',
    enabled: true,
  },
  {
    id: 'clipboard',
    tool: 'clipboard',
    label: 'Inteligentny Schowek',
    description: 'Historia schowka, krótkie teksty na wierzchu, tryb notesu',
    iconName: 'Clipboard',
    shortcut: '2',
    color: 'from-blue-500 to-indigo-600',
    badge: 'Schowek',
    enabled: true,
  },
  {
    id: 'speech',
    tool: 'speech',
    label: 'Mowa na tekst / Tłumacz',
    description: 'Dyktuj głosem lub tłumacz mowę w locie na język polski',
    iconName: 'Mic',
    shortcut: '3',
    color: 'from-amber-500 to-orange-500',
    badge: 'Mowa & PL',
    enabled: true,
  },
  {
    id: 'translate',
    tool: 'translate',
    label: 'Tłumacz na polski',
    description: 'Automatycznie rozpoznaj język i przetłumacz na polski',
    iconName: 'Languages',
    shortcut: '4',
    color: 'from-sky-500 to-cyan-500',
    badge: 'Auto-PL',
    enabled: true,
  },
  {
    id: 'ocr',
    tool: 'ocr',
    label: 'OCR / Zaznacz z obrazu',
    description: 'Wytnij obszar ekranu lub wklej obraz i odczytaj tekst',
    iconName: 'ScanText',
    shortcut: '5',
    color: 'from-emerald-500 to-teal-500',
    badge: 'Snip OCR',
    enabled: true,
  },
  {
    id: 'task_manager',
    tool: 'task_manager',
    label: 'Pasek Zadań & Killer',
    description: 'Rolka aktywnych okien, przypinanie na wierzch i force kill',
    iconName: 'Layers',
    shortcut: '6',
    color: 'from-rose-500 to-amber-500',
    badge: 'Taskbar',
    enabled: true,
  },
  {
    id: 'text_tools',
    tool: 'text_tools',
    label: 'Narzędzia tekstu',
    description: 'Oczyszczanie, formatowanie i wyciąganie danych',
    iconName: 'Wand2',
    shortcut: '7',
    color: 'from-pink-500 to-rose-500',
    badge: 'Formatuj',
    enabled: true,
  },
  {
    id: 'memo',
    tool: 'memo',
    label: 'Szybka notatka',
    description: 'Pływający podręczny notes ze stałym autozapisem',
    iconName: 'StickyNote',
    shortcut: '8',
    color: 'from-yellow-400 to-amber-600',
    badge: 'Notes',
    enabled: true,
  },
  {
    id: 'magnifier',
    tool: 'magnifier',
    label: 'Lupa ekranowa',
    description: 'Powiększ dowolny fragment ekranu pod kursorem',
    iconName: 'ZoomIn',
    shortcut: '9',
    color: 'from-indigo-400 to-purple-600',
    badge: 'Zoom',
    enabled: true,
  },
];

export const CursorHUD: React.FC<CursorHUDProps> = ({
  isOpen,
  position,
  settings,
  onSelectTool,
  onClose,
}) => {
  const [hoveredAction, setHoveredAction] = useState<ActionItem | null>(null);

  // Active actions filtered by enabled state from settings
  const actions = useMemo(() => {
    const raw = settings.customActions && settings.customActions.length > 0
      ? settings.customActions
      : DEFAULT_ACTIONS;
    return raw.filter((a) => a.enabled !== false);
  }, [settings.customActions]);

  // Compute safe coordinates clamped to viewport boundaries
  const clampedPosition = useMemo(() => {
    if (typeof window === 'undefined') return position;
    const padding = settings.hudLayout === 'radial' ? 160 : 120;
    const maxX = window.innerWidth - padding;
    const minX = padding;
    const maxY = window.innerHeight - padding;
    const minY = padding;

    return {
      x: Math.max(minX, Math.min(position.x, maxX)),
      y: Math.max(minY, Math.min(position.y, maxY)),
    };
  }, [position, settings.hudLayout]);

  // Keyboard navigation when HUD is open
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        sound.playClick(settings.soundEffects);
        onClose();
        return;
      }

      const pressedKey = e.key.toLowerCase();

      // Check exact assigned shortcut match
      const matchedAction = actions.find(
        (a) => a.shortcut.toLowerCase() === pressedKey ||
               (a.shortcut.toLowerCase() === 'space' && e.code === 'Space')
      );

      if (matchedAction) {
        e.preventDefault();
        sound.playPop(settings.soundEffects);
        onSelectTool(matchedAction.tool);
        return;
      }

      // Check fallback number key (1 to actions.length)
      const num = parseInt(e.key, 10);
      if (!isNaN(num) && num >= 1 && num <= actions.length) {
        e.preventDefault();
        const action = actions[num - 1];
        sound.playPop(settings.soundEffects);
        onSelectTool(action.tool);
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, actions, onSelectTool, onClose, settings.soundEffects]);

  const getIcon = (name: string, className = 'w-5 h-5') => {
    switch (name) {
      case 'Bot': return <Bot className={className} />;
      case 'Clipboard': return <Clipboard className={className} />;
      case 'Layers': return <Layers className={className} />;
      case 'Mic': return <Mic className={className} />;
      case 'Languages': return <Languages className={className} />;
      case 'ScanText': return <ScanText className={className} />;
      case 'Volume2': return <Volume2 className={className} />;
      case 'Wand2': return <Wand2 className={className} />;
      case 'StickyNote': return <StickyNote className={className} />;
      case 'ZoomIn': return <ZoomIn className={className} />;
      case 'Code2': return <Code2 className={className} />;
      case 'FileText': return <FileText className={className} />;
      case 'Pin': return <Pin className={className} />;
      case 'Zap': return <Zap className={className} />;
      case 'Sliders': return <Sliders className={className} />;
      case 'Shield': return <Shield className={className} />;
      case 'Eye': return <Eye className={className} />;
      case 'Settings': return <Settings className={className} />;
      default: return <Sparkles className={className} />;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          id="cursor-hud-container"
          className="fixed inset-0 z-50 pointer-events-none select-none overflow-hidden"
        >
          {/* Subtle backdrop overlay with backdrop blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 bg-black/25 backdrop-blur-[2px] pointer-events-auto"
            onClick={onClose}
          />

          {/* ========================================================
              LAYOUT 1: RADIAL WHEEL MENU (Wieniec kołowy wokół kursora)
              ======================================================== */}
          {settings.hudLayout === 'radial' && (
            <div
              className="absolute pointer-events-auto"
              style={{
                left: clampedPosition.x,
                top: clampedPosition.y,
                transform: 'translate(-50%, -50%)',
              }}
            >
              {/* Radial Center Core */}
              <motion.div
                initial={{ scale: 0.2, opacity: 0, rotate: -25 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                exit={{ scale: 0.3, opacity: 0, rotate: 25 }}
                transition={{ type: 'spring', damping: 20, stiffness: 350 }}
                className="relative flex items-center justify-center w-28 h-28 rounded-full bg-slate-900/90 border border-slate-700/80 shadow-2xl shadow-blue-500/10 backdrop-blur-xl text-center p-2 group"
              >
                <div className="flex flex-col items-center justify-center">
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center mb-1 ring-1 ring-blue-500/40 animate-pulse">
                    <Command className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-bold tracking-wider text-slate-200 uppercase">
                    Kursor HUD
                  </span>
                  <span className="text-[9px] text-slate-400 font-mono">
                    {settings.primaryHotkey}
                  </span>
                </div>

                {/* Pulsing Outer Ring */}
                <div className="absolute inset-0 rounded-full border border-blue-500/30 scale-125 animate-ping opacity-20 pointer-events-none" />
              </motion.div>

              {/* Radial Action Nodes */}
              {actions.map((action, index) => {
                const total = actions.length;
                const angle = (index * (2 * Math.PI)) / total - Math.PI / 2;
                const radius = settings.radiusSize || 115;
                const nodeX = Math.cos(angle) * radius;
                const nodeY = Math.sin(angle) * radius;

                return (
                  <motion.div
                    key={action.id}
                    initial={{ scale: 0, opacity: 0, x: 0, y: 0 }}
                    animate={{ scale: 1, opacity: 1, x: nodeX, y: nodeY }}
                    exit={{ scale: 0, opacity: 0, x: 0, y: 0 }}
                    transition={{
                      type: 'spring',
                      damping: 18,
                      stiffness: 300,
                      delay: index * 0.02,
                    }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                  >
                    <button
                      id={`hud-radial-btn-${action.id}`}
                      onClick={() => {
                        sound.playPop(settings.soundEffects);
                        onSelectTool(action.tool);
                      }}
                      onMouseEnter={() => {
                        setHoveredAction(action);
                        sound.playHover(settings.soundEffects);
                      }}
                      onMouseLeave={() => setHoveredAction(null)}
                      className={`relative group w-12 h-12 rounded-2xl bg-slate-900/95 border border-slate-700/90 shadow-xl flex items-center justify-center text-slate-200 transition-all duration-200 hover:scale-115 hover:border-white/80 hover:shadow-2xl hover:text-white cursor-pointer backdrop-blur-md ${
                        hoveredAction?.id === action.id ? 'ring-2 ring-blue-400 shadow-blue-500/30' : ''
                      }`}
                    >
                      {/* Gradient Ambient Halo on Hover */}
                      <div
                        className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${action.color} opacity-0 group-hover:opacity-25 blur-sm transition-opacity pointer-events-none`}
                      />

                      {/* Icon */}
                      <div className="relative z-10 transition-transform group-hover:scale-110">
                        {getIcon(action.iconName, 'w-5 h-5')}
                      </div>

                      {/* Quick Shortcut Badge */}
                      <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-slate-800 border border-slate-600 text-[10px] font-mono font-extrabold text-blue-300 flex items-center justify-center shadow-md">
                        {action.shortcut}
                      </span>
                    </button>
                  </motion.div>
                );
              })}

              {/* Hover Tooltip / Detail Floating Card */}
              <AnimatePresence>
                {hoveredAction && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 5, scale: 0.95 }}
                    className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-64 p-3 rounded-xl bg-slate-900/95 border border-slate-700/80 shadow-2xl backdrop-blur-xl text-center pointer-events-none z-30"
                  >
                    <div className="flex items-center justify-center gap-1.5 mb-0.5">
                      <span className="text-xs font-bold text-white">
                        {hoveredAction.label}
                      </span>
                      <span className="px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 text-[9px] font-mono font-bold">
                        Klawisz: [{hoveredAction.shortcut}]
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-tight">
                      {hoveredAction.description}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* ========================================================
              LAYOUT 2: CAPSULE BAR (Pasek kapsułowy pod kursorem)
              ======================================================== */}
          {settings.hudLayout === 'capsule' && (
            <div
              className="absolute pointer-events-auto"
              style={{
                left: clampedPosition.x,
                top: clampedPosition.y + 15,
                transform: 'translate(-50%, 0)',
              }}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0, y: -10 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.8, opacity: 0, y: -10 }}
                transition={{ type: 'spring', damping: 22, stiffness: 350 }}
                className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-900/95 border border-slate-700 shadow-2xl backdrop-blur-xl"
              >
                {actions.map((action, i) => (
                  <button
                    key={action.id}
                    onClick={() => {
                      sound.playPop(settings.soundEffects);
                      onSelectTool(action.tool);
                    }}
                    onMouseEnter={() => sound.playHover(settings.soundEffects)}
                    className="relative group flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/90 text-slate-200 hover:text-white border border-transparent hover:border-slate-600 transition-all cursor-pointer"
                    title={`${action.label} [${action.shortcut}]`}
                  >
                    {getIcon(action.iconName, 'w-4 h-4')}
                    <span className="text-xs font-semibold">{action.label}</span>
                    <span className="px-1.5 py-0.5 rounded bg-slate-900/80 border border-slate-700 text-[10px] font-mono text-amber-300">
                      {action.shortcut}
                    </span>
                  </button>
                ))}
              </motion.div>
            </div>
          )}

          {/* ========================================================
              LAYOUT 3: GRID MATRIX (Kompaktowa siatka kafelków)
              ======================================================== */}
          {settings.hudLayout === 'grid' && (
            <div
              className="absolute pointer-events-auto"
              style={{
                left: clampedPosition.x,
                top: clampedPosition.y,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <motion.div
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.85, opacity: 0 }}
                transition={{ type: 'spring', damping: 24, stiffness: 350 }}
                className="w-80 rounded-2xl bg-slate-900/95 border border-slate-700 shadow-2xl backdrop-blur-xl p-3 text-slate-100 overflow-hidden"
              >
                {/* Header */}
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
                    <Command className="w-3.5 h-3.5 text-blue-400" />
                    <span>KursorAssist Ułatwienia</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {actions.length} aktywnych akcji
                  </span>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-2 gap-1.5 max-h-[300px] overflow-y-auto pr-0.5">
                  {actions.map((action, i) => (
                    <button
                      key={action.id}
                      onClick={() => {
                        sound.playPop(settings.soundEffects);
                        onSelectTool(action.tool);
                      }}
                      onMouseEnter={() => sound.playHover(settings.soundEffects)}
                      className="flex items-center gap-2 p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/90 text-left border border-slate-700/60 hover:border-blue-500/50 transition-all cursor-pointer group"
                    >
                      <div className={`p-1.5 rounded-lg bg-gradient-to-br ${action.color} text-white shadow-sm`}>
                        {getIcon(action.iconName, 'w-3.5 h-3.5')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-slate-200 group-hover:text-white truncate">
                          {action.label}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          Klawisz: <b className="text-amber-300">[{action.shortcut}]</b>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            </div>
          )}
        </div>
      )}
    </AnimatePresence>
  );
};
