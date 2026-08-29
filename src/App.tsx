import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Mic,
  Languages,
  ScanText,
  Volume2,
  Wand2,
  StickyNote,
  ZoomIn,
  Code2,
  Settings as SettingsIcon,
  MousePointer,
  Sparkles,
  ShieldCheck,
  Cpu,
  Keyboard,
  CheckCircle,
  Bot,
  Layers,
  MicOff,
  Clipboard,
} from 'lucide-react';
import {
  ActiveTool,
  AppSettings,
  ClipboardItem,
  Coordinates,
  OCRResult,
  RunningApp,
} from './types';
import { CursorHUD, DEFAULT_ACTIONS } from './components/CursorHUD';
import { ScreenSnipper } from './components/ScreenSnipper';
import { SpeechModal } from './components/ActionModals/SpeechModal';
import { TranslateModal } from './components/ActionModals/TranslateModal';
import { OCRModal } from './components/ActionModals/OCRModal';
import { ClipboardModal } from './components/ActionModals/ClipboardModal';
import { TextToolsModal } from './components/ActionModals/TextToolsModal';
import { QuickMemoModal } from './components/ActionModals/QuickMemoModal';
import { MagnifierModal } from './components/ActionModals/MagnifierModal';
import { AIChatModal } from './components/ActionModals/AIChatModal';
import { TaskbarRoller } from './components/TaskbarRoller';
import { WindowsExporter } from './components/WindowsExporter';
import { SettingsModal } from './components/SettingsModal';
import { SimulatorDesktop } from './components/SimulatorDesktop';
import { sound } from './services/soundService';

const DEFAULT_SETTINGS: AppSettings = {
  hudLayout: 'radial',
  primaryHotkey: 'Alt + Q',
  radiusSize: 110,
  autoCopyResults: true,
  soundEffects: true,
  theme: 'slate',
  triggerOnClickOutside: false,
  autoTranslateOCR: true,
  ttsVoiceRate: 1.0,
  ttsVoicePitch: 1.0,
  clipboardLongTextThreshold: 120,
  autoCaptureClipboard: true,
  customActions: DEFAULT_ACTIONS,
  speechTranslateAutoPL: true,
};

const INITIAL_RUNNING_APPS: RunningApp[] = [
  {
    id: 'app-chrome',
    title: 'Google Chrome - Dokumentacja i Badania AI',
    processName: 'chrome.exe',
    pid: 4120,
    iconName: 'Chrome',
    ramUsageMb: 1420,
    cpuPercent: 4.2,
    status: 'running',
    isPinnedTop: false,
    category: 'browser',
  },
  {
    id: 'app-vscode',
    title: 'Visual Studio Code - KursorAssist.py [Workspace]',
    processName: 'code.exe',
    pid: 8812,
    iconName: 'Code',
    ramUsageMb: 640,
    cpuPercent: 1.8,
    status: 'pinned_top',
    isPinnedTop: true,
    category: 'dev',
  },
  {
    id: 'app-photoshop',
    title: 'Adobe Photoshop 2026 - (Brak odpowiedzi / Zawieszony)',
    processName: 'photoshop.exe',
    pid: 9940,
    iconName: 'Image',
    ramUsageMb: 3200,
    cpuPercent: 98.4,
    status: 'unresponsive',
    isPinnedTop: false,
    category: 'editor',
  },
  {
    id: 'app-spotify',
    title: 'Spotify - Odtwarzanie muzyki w tle',
    processName: 'spotify.exe',
    pid: 5124,
    iconName: 'Music',
    ramUsageMb: 280,
    cpuPercent: 0.5,
    status: 'running',
    isPinnedTop: false,
    category: 'media',
  },
  {
    id: 'app-notepad',
    title: 'Notatnik - Notatki_i_Raport.txt',
    processName: 'notepad.exe',
    pid: 2310,
    iconName: 'Terminal',
    ramUsageMb: 45,
    cpuPercent: 0.1,
    status: 'running',
    isPinnedTop: false,
    category: 'editor',
  },
  {
    id: 'app-excel',
    title: 'Microsoft Excel - Zestawienie_Finansowe_Q3.xlsx',
    processName: 'excel.exe',
    pid: 7720,
    iconName: 'FileSpreadsheet',
    ramUsageMb: 510,
    cpuPercent: 2.1,
    status: 'running',
    isPinnedTop: false,
    category: 'system',
  },
];

const INITIAL_CLIPBOARD_ITEMS: ClipboardItem[] = [
  {
    id: 'clip-1',
    text: 'biuro@firma-polska.pl',
    timestamp: Date.now() - 1000 * 60 * 5,
    isPinned: true,
    charCount: 22,
    wordCount: 1,
    category: 'email',
    source: 'Ręczny',
  },
  {
    id: 'clip-2',
    text: 'https://github.com/microsoft/PowerToys',
    timestamp: Date.now() - 1000 * 60 * 12,
    isPinned: false,
    charCount: 39,
    wordCount: 1,
    category: 'url',
    source: 'Schowek',
  },
  {
    id: 'clip-3',
    text: 'Ctrl+Shift+T - Przywracanie zamkniętej karty w przeglądarce',
    timestamp: Date.now() - 1000 * 60 * 25,
    isPinned: false,
    charCount: 57,
    wordCount: 7,
    category: 'text',
    source: 'Notatka',
  },
  {
    id: 'clip-4',
    text: 'Raport techniczny ułatwień dostępu: Wszystkie moduły rozpoznawania mowy offline (STT), OCR ze zrzutów ekranu oraz translator offline na język polski działają bezpośrednio na procesorze lokalnym bez użycia zewnętrznych płatnych API. Zaawansowane ułatwienia dostępu Windows obejmują przypinanie okna zawsze na wierzchu (Always on Top) oraz wymuszone zamykanie zawieszonych procesów.',
    timestamp: Date.now() - 1000 * 60 * 45,
    isPinned: false,
    charCount: 382,
    wordCount: 48,
    category: 'long_doc',
    source: 'Tłumacz PL',
  },
  {
    id: 'clip-5',
    text: 'const handleForceKill = (pid: number) => { exec(`taskkill /F /PID ${pid}`); };',
    timestamp: Date.now() - 1000 * 60 * 60,
    isPinned: true,
    charCount: 77,
    wordCount: 10,
    category: 'code',
    source: 'OCR',
  },
  {
    id: 'clip-6',
    text: 'Instrukcja obsługi KursorAssist:\n1. Naciśnij skrót Alt+Q w dowolnym programie Windows, a menu otworzy się wokół kursora myszki.\n2. Wybierz narzędzie z wieńca lub naciśnij przypisany klawisz (np. 1-9 lub własny).\n3. W razie awarii aplikacji wybierz rolkę na pasku zadań i kliknij "Zakończ natychmiast (Force Kill)".\n4. Dłuższe teksty w schowku mają zwinięty podgląd i tryb czytnika notesu.',
    timestamp: Date.now() - 1000 * 60 * 90,
    isPinned: false,
    charCount: 395,
    wordCount: 53,
    category: 'long_doc',
    source: 'AI Chat',
  },
];

export default function App() {
  // App Settings with LocalStorage persistence
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem('kursor_assist_settings');
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  // Clipboard Items with LocalStorage persistence
  const [clipboardItems, setClipboardItems] = useState<ClipboardItem[]>(() => {
    try {
      const saved = localStorage.getItem('kursor_clipboard_items');
      return saved ? JSON.parse(saved) : INITIAL_CLIPBOARD_ITEMS;
    } catch {
      return INITIAL_CLIPBOARD_ITEMS;
    }
  });

  const updateSettings = (newPartial: Partial<AppSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newPartial };
      try {
        localStorage.setItem('kursor_assist_settings', JSON.stringify(updated));
      } catch {
        // Ignore
      }
      return updated;
    });
  };

  const updateClipboard = (newItems: ClipboardItem[]) => {
    setClipboardItems(newItems);
    try {
      localStorage.setItem('kursor_clipboard_items', JSON.stringify(newItems));
    } catch {
      // Ignore
    }
  };

  // Helper to add new item to clipboard
  const handleAddToClipboard = (text: string, source: string = 'KursorAssist') => {
    if (!text.trim()) return;

    // Check if duplicate already exists at top
    if (clipboardItems.length > 0 && clipboardItems[0].text === text.trim()) {
      return;
    }

    const trimmed = text.trim();
    const threshold = settings.clipboardLongTextThreshold || 120;
    let category: ClipboardItem['category'] = 'text';

    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      category = 'url';
    } else if (trimmed.includes('@') && !trimmed.includes('\n') && trimmed.length < 60) {
      category = 'email';
    } else if (
      trimmed.includes('{') ||
      trimmed.includes('function') ||
      trimmed.includes('const ') ||
      trimmed.includes('import ') ||
      trimmed.includes('def ')
    ) {
      category = 'code';
    } else if (trimmed.length > threshold) {
      category = 'long_doc';
    }

    const newItem: ClipboardItem = {
      id: `clip_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      text: trimmed,
      timestamp: Date.now(),
      isPinned: false,
      charCount: trimmed.length,
      wordCount: trimmed.split(/\s+/).filter(Boolean).length,
      category,
      source,
    };

    updateClipboard([newItem, ...clipboardItems.slice(0, 99)]);
  };

  // Cursor tracking
  const [cursorPos, setCursorPos] = useState<Coordinates>({
    x: typeof window !== 'undefined' ? window.innerWidth / 2 : 400,
    y: typeof window !== 'undefined' ? window.innerHeight / 2 : 300,
  });
  const [hudPos, setHudPos] = useState<Coordinates>({ x: 400, y: 300 });

  // UI state
  const [isHUDOpen, setIsHUDOpen] = useState(false);
  const [activeTool, setActiveTool] = useState<ActiveTool>(null);
  const [isSnipperActive, setIsSnipperActive] = useState(false);

  // Taskbar Roller & System States
  const [runningApps, setRunningApps] = useState<RunningApp[]>(INITIAL_RUNNING_APPS);
  const [activeAppIndex, setActiveAppIndex] = useState(0);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [notificationToast, setNotificationToast] = useState<{
    message: string;
    type: 'kill' | 'mute' | 'pin' | 'info';
  } | null>(null);

  // Cross-modal data transfer
  const [initialTranslateText, setInitialTranslateText] = useState('');
  const [initialOCRResult, setInitialOCRResult] = useState<OCRResult | null>(null);
  const [activeTargetText, setActiveTargetText] = useState(
    'Kliknij skrót Alt+Q w dowolnym miejscu lub zaznacz tekst do natychmiastowego przetłumaczenia na język polski.'
  );

  const showToast = (message: string, type: 'kill' | 'mute' | 'pin' | 'info') => {
    setNotificationToast({ message, type });
    setTimeout(() => {
      setNotificationToast(null);
    }, 3500);
  };

  // Mouse position tracker
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setCursorPos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Global hotkeys (Alt + Q, Ctrl + Space, Ctrl + M, Alt + C, Alt + G, F8)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle HUD (Alt + Q or Ctrl + Space)
      if ((e.altKey && e.key.toLowerCase() === 'q') || (e.ctrlKey && e.code === 'Space')) {
        e.preventDefault();
        setHudPos({ x: cursorPos.x, y: cursorPos.y });
        setIsHUDOpen((prev) => {
          const nextState = !prev;
          if (nextState) sound.playPop(settings.soundEffects);
          return nextState;
        });
        return;
      }

      // Quick Mic Mute Toggle (Ctrl + M)
      if (e.ctrlKey && e.key.toLowerCase() === 'm') {
        e.preventDefault();
        handleToggleMicMute();
        return;
      }

      // Quick Smart Clipboard (Alt + C)
      if (e.altKey && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        setActiveTool('clipboard');
        sound.playPop(settings.soundEffects);
        return;
      }

      // Quick AI Chat (Alt + G)
      if (e.altKey && e.key.toLowerCase() === 'g') {
        e.preventDefault();
        setActiveTool('ai_chat');
        sound.playPop(settings.soundEffects);
        return;
      }

      // Quick test key (F8)
      if (e.key === 'F8') {
        e.preventDefault();
        setHudPos({ x: cursorPos.x, y: cursorPos.y });
        setIsHUDOpen(true);
        sound.playPop(settings.soundEffects);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cursorPos, settings.soundEffects, isMicMuted]);

  // Open HUD manually at specified position
  const handleOpenHUD = (pos?: Coordinates) => {
    const targetPos = pos || cursorPos;
    setHudPos(targetPos);
    setIsHUDOpen(true);
    sound.playPop(settings.soundEffects);
  };

  // Tool Selection from HUD
  const handleSelectTool = (tool: ActiveTool) => {
    setIsHUDOpen(false);

    if (tool === 'ocr') {
      setIsSnipperActive(true);
      return;
    }

    if (tool === 'translate') {
      const selected = window.getSelection()?.toString().trim();
      if (selected) {
        setInitialTranslateText(selected);
      }
    }

    setActiveTool(tool);
  };

  // Toggle Pin on Top for an app
  const handleTogglePinTop = (id: string) => {
    setRunningApps((prev) =>
      prev.map((app) => {
        if (app.id === id) {
          const nextPinned = !app.isPinnedTop;
          sound.playPop(settings.soundEffects);
          showToast(
            nextPinned
              ? `📌 Przypięto okno "${app.processName}" na wierzch (Always on Top)`
              : `Odpięto okno "${app.processName}"`,
            'pin'
          );
          return { ...app, isPinnedTop: nextPinned };
        }
        return app;
      })
    );
  };

  // Force Kill unresponsive/selected process
  const handleForceKillApp = (id: string) => {
    const targetApp = runningApps.find((a) => a.id === id);
    if (!targetApp) return;

    sound.playKill(settings.soundEffects);
    showToast(
      `💀 Wymuszono natychmiastowe zakończenie procesu: ${targetApp.processName} (PID: ${targetApp.pid})`,
      'kill'
    );

    setRunningApps((prev) => {
      const remaining = prev.filter((a) => a.id !== id);
      if (activeAppIndex >= remaining.length && remaining.length > 0) {
        setActiveAppIndex(remaining.length - 1);
      }
      return remaining;
    });
  };

  // Toggle Microphone Mute
  const handleToggleMicMute = () => {
    setIsMicMuted((prev) => {
      const next = !prev;
      sound.playMute(settings.soundEffects, next);
      showToast(
        next ? '🎙️ Mikrofon został WYCISZONY (Global Mute)' : '🎙️ Mikrofon jest AKTYWNY',
        'mute'
      );
      return next;
    });
  };

  // Reset running apps simulation
  const handleRestoreApps = () => {
    setRunningApps(INITIAL_RUNNING_APPS);
    setActiveAppIndex(0);
    sound.playPop(settings.soundEffects);
    showToast('Przywrócono domyślną listę procesów Windows', 'info');
  };

  // OCR Snippet Captured Callback
  const handleSnippetCaptured = (result: OCRResult) => {
    setIsSnipperActive(false);
    setInitialOCRResult(result);
    setActiveTool('ocr');
    if (result.text) {
      handleAddToClipboard(result.text, 'OCR');
    }
  };

  // Direct Translate from other modals (e.g. OCR -> Translate)
  const handleDirectTranslate = (text: string) => {
    setActiveTool(null);
    setInitialTranslateText(text);
    setTimeout(() => {
      setActiveTool('translate');
    }, 100);
  };

  // Paste text into active simulated target editor
  const handlePasteToTarget = (text: string) => {
    setActiveTargetText((prev) => (prev ? `${prev}\n${text}` : text));
    handleAddToClipboard(text, 'Wklejono');
  };

  const isCurrentWindowPinned = runningApps[activeAppIndex]?.isPinnedTop ?? false;

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 font-sans select-none overflow-hidden pb-14">
      {/* Top Application Bar (Windows 11 Fluent Header) */}
      <header className="h-[68px] px-4 md:px-6 bg-slate-900/95 border-b border-slate-800 flex items-center justify-between z-30 shadow-md backdrop-blur-xl">
        {/* Brand & Hotkey Badge */}
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-cyan-400 p-[1px] shadow-lg shadow-blue-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[15px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm md:text-base font-extrabold tracking-tight text-white">
                KursorAssist
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/15 text-blue-300 border border-blue-500/30">
                Windows HUD & Taskbar
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="flex items-center gap-1 font-mono text-amber-400 text-[11px]">
                <Keyboard className="w-3 h-3" />
                HUD: <b>{settings.primaryHotkey}</b>
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                100% Offline AI / Bez API
              </span>
            </div>
          </div>
        </div>

        {/* Quick Action Buttons in Navbar */}
        <div className="hidden md:flex items-center gap-1.5 bg-slate-950/60 p-1.5 rounded-2xl border border-slate-800">
          <button
            onClick={() => handleOpenHUD(cursorPos)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
            title="Otwórz menu wokół wskaźnika myszy (Alt+Q)"
          >
            <MousePointer className="w-3.5 h-3.5" />
            Otwórz HUD (Alt+Q)
          </button>

          <button
            onClick={() => setActiveTool('clipboard')}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-indigo-300 text-xs transition-colors"
            title="Inteligentny schowek & notes (Alt+C)"
          >
            <Clipboard className="w-3.5 h-3.5 text-indigo-400" />
            Schowek ({clipboardItems.length})
          </button>

          <button
            onClick={() => setActiveTool('ai_chat')}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-cyan-300 text-xs transition-colors"
            title="Czat Gemini / GPT (Alt+G)"
          >
            <Bot className="w-3.5 h-3.5 text-cyan-400" />
            Czat AI
          </button>

          <button
            onClick={() => setActiveTool('speech')}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-amber-300 text-xs transition-colors"
            title="Mowa na tekst & tłumacz audio"
          >
            <Mic className="w-3.5 h-3.5 text-amber-400" />
            Dyktuj / Audio
          </button>

          <button
            onClick={() => setActiveTool('translate')}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-cyan-300 text-xs transition-colors"
            title="Tłumacz na polski"
          >
            <Languages className="w-3.5 h-3.5 text-cyan-400" />
            Tłumacz PL
          </button>

          <button
            onClick={() => setIsSnipperActive(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-emerald-300 text-xs transition-colors"
            title="OCR ze zrzutu ekranu"
          >
            <ScanText className="w-3.5 h-3.5 text-emerald-400" />
            OCR Snip
          </button>
        </div>

        {/* Right Utility Buttons */}
        <div className="flex items-center gap-2">
          {/* Quick Mic Mute in Header */}
          <button
            onClick={handleToggleMicMute}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
              isMicMuted
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-lg shadow-amber-500/10'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
            }`}
            title="Wycisz mikrofon (Ctrl+M)"
          >
            {isMicMuted ? <MicOff className="w-3.5 h-3.5 text-amber-400" /> : <Mic className="w-3.5 h-3.5 text-slate-400" />}
            <span className="hidden sm:inline">{isMicMuted ? 'MUTE (Wyciszony)' : 'Mikrofon WŁ'}</span>
          </button>

          {/* Windows Python Native Exporter Button */}
          <button
            onClick={() => setActiveTool('windows_export')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs shadow-lg shadow-indigo-500/20 border border-indigo-400/30 transition-all cursor-pointer"
          >
            <Code2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Kod Windows (.py)</span>
            <span className="sm:hidden">.py</span>
          </button>

          {/* Settings Button */}
          <button
            onClick={() => setActiveTool('settings')}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
            title="Ustawienia ułatwień dostępu"
          >
            <SettingsIcon className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Interactive Desktop Simulator Playground */}
      <main className="flex-1 relative">
        <SimulatorDesktop
          cursorPos={cursorPos}
          onOpenHUD={handleOpenHUD}
          activeTargetText={activeTargetText}
          onTargetTextChange={setActiveTargetText}
          onTranslateSelected={(txt) => {
            setInitialTranslateText(txt);
            setActiveTool('translate');
          }}
          onStartOCR={() => setIsSnipperActive(true)}
          onOpenWindowsExport={() => setActiveTool('windows_export')}
          onOpenAIChat={() => setActiveTool('ai_chat')}
          isWindowPinned={isCurrentWindowPinned}
        />
      </main>

      {/* ========================================================
          WINDOWS TASKBAR ROLLER & APP KILLER (At the Bottom)
          ======================================================== */}
      <TaskbarRoller
        runningApps={runningApps}
        activeAppIndex={activeAppIndex}
        isMicMuted={isMicMuted}
        onSelectAppIndex={setActiveAppIndex}
        onTogglePinTop={handleTogglePinTop}
        onForceKillApp={handleForceKillApp}
        onToggleMicMute={handleToggleMicMute}
        onOpenAIChat={() => setActiveTool('ai_chat')}
        onOpenHUD={() => handleOpenHUD(cursorPos)}
        onRestoreApps={handleRestoreApps}
        soundEffects={settings.soundEffects}
      />

      {/* Floating Global Toast Notification */}
      {notificationToast && (
        <div
          className={`fixed bottom-18 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl shadow-2xl backdrop-blur-xl border text-xs font-semibold flex items-center gap-2 animate-bounce ${
            notificationToast.type === 'kill'
              ? 'bg-rose-950/90 text-rose-200 border-rose-500/50 shadow-rose-500/20'
              : notificationToast.type === 'mute'
              ? 'bg-amber-950/90 text-amber-200 border-amber-500/50 shadow-amber-500/20'
              : notificationToast.type === 'pin'
              ? 'bg-blue-950/90 text-blue-200 border-blue-500/50 shadow-blue-500/20'
              : 'bg-slate-900/90 text-slate-200 border-slate-700 shadow-slate-900/40'
          }`}
        >
          <span>{notificationToast.message}</span>
        </div>
      )}

      {/* ========================================================
          CORE FLOATING CURSOR HUD (Po kliknięciu skrótu Alt+Q)
          ======================================================== */}
      <CursorHUD
        isOpen={isHUDOpen}
        position={hudPos}
        settings={settings}
        onSelectTool={handleSelectTool}
        onClose={() => setIsHUDOpen(false)}
      />

      {/* Interactive Screen Snipping Marquee Tool */}
      <ScreenSnipper
        isActive={isSnipperActive}
        onSnippetCaptured={handleSnippetCaptured}
        onCancel={() => setIsSnipperActive(false)}
        soundEffects={settings.soundEffects}
      />

      {/* Action Panels & Modals */}
      <ClipboardModal
        isOpen={activeTool === 'clipboard'}
        items={clipboardItems}
        threshold={settings.clipboardLongTextThreshold || 120}
        onUpdateItems={updateClipboard}
        onClose={() => setActiveTool(null)}
        soundEffects={settings.soundEffects}
        onPasteToTarget={handlePasteToTarget}
        onOpenSettings={() => setActiveTool('settings')}
      />

      <AIChatModal
        isOpen={activeTool === 'ai_chat'}
        onClose={() => setActiveTool(null)}
        soundEffects={settings.soundEffects}
        onPasteToTarget={handlePasteToTarget}
      />

      <SpeechModal
        isOpen={activeTool === 'speech'}
        onClose={() => setActiveTool(null)}
        onTranslate={handleDirectTranslate}
        onPasteToTarget={handlePasteToTarget}
        onAddToClipboard={handleAddToClipboard}
        soundEffects={settings.soundEffects}
        autoCopy={settings.autoCopyResults}
      />

      <TranslateModal
        isOpen={activeTool === 'translate'}
        initialText={initialTranslateText}
        onClose={() => {
          setActiveTool(null);
          setInitialTranslateText('');
        }}
        soundEffects={settings.soundEffects}
        autoCopy={settings.autoCopyResults}
        onPasteToTarget={handlePasteToTarget}
        onAddToClipboard={handleAddToClipboard}
      />

      <OCRModal
        isOpen={activeTool === 'ocr'}
        initialResult={initialOCRResult}
        onClose={() => {
          setActiveTool(null);
          setInitialOCRResult(null);
        }}
        onStartSnipper={() => setIsSnipperActive(true)}
        onTranslateText={handleDirectTranslate}
        onPasteToTarget={handlePasteToTarget}
        onAddToClipboard={handleAddToClipboard}
        soundEffects={settings.soundEffects}
        autoCopy={settings.autoCopyResults}
      />

      <TextToolsModal
        isOpen={activeTool === 'text_tools'}
        initialText={initialTranslateText || activeTargetText}
        onClose={() => setActiveTool(null)}
        soundEffects={settings.soundEffects}
        onPasteToTarget={handlePasteToTarget}
      />

      <QuickMemoModal
        isOpen={activeTool === 'memo'}
        onClose={() => setActiveTool(null)}
        soundEffects={settings.soundEffects}
      />

      <MagnifierModal
        isOpen={activeTool === 'magnifier'}
        onClose={() => setActiveTool(null)}
        cursorPos={cursorPos}
      />

      <WindowsExporter
        isOpen={activeTool === 'windows_export'}
        onClose={() => setActiveTool(null)}
        soundEffects={settings.soundEffects}
      />

      <SettingsModal
        isOpen={activeTool === 'settings'}
        settings={settings}
        onUpdateSettings={updateSettings}
        onClose={() => setActiveTool(null)}
      />
    </div>
  );
}
