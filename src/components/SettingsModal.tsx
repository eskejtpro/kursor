import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Settings,
  X,
  Volume2,
  VolumeX,
  Copy,
  Keyboard,
  Sparkles,
  Layers,
  CircleDot,
  Columns,
  LayoutGrid,
  Clipboard,
  Mic,
  RotateCcw,
  Plus,
  Trash2,
  Check,
  Edit2,
  Sliders,
  FileText,
  Bot,
  ScanText,
  Languages,
  ZoomIn,
  Wand2,
  StickyNote,
} from 'lucide-react';
import { ActionItem, ActiveTool, AppSettings, HUDLayoutMode } from '../types';
import { DEFAULT_ACTIONS } from './CursorHUD';
import { sound } from '../services/soundService';

interface SettingsModalProps {
  isOpen: boolean;
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onClose: () => void;
}

const AVAILABLE_ICONS = [
  'Bot',
  'Clipboard',
  'Mic',
  'Languages',
  'ScanText',
  'Layers',
  'Wand2',
  'StickyNote',
  'ZoomIn',
  'Volume2',
  'FileText',
  'Code2',
  'Sparkles',
  'Settings',
];

const AVAILABLE_COLORS = [
  { name: 'Niebieski / Indygo', value: 'from-blue-500 to-indigo-600' },
  { name: 'Cyjan / Błękit', value: 'from-cyan-500 to-blue-600' },
  { name: 'Bursztyn / Pomarańcz', value: 'from-amber-500 to-orange-500' },
  { name: 'Szmaragd / Morski', value: 'from-emerald-500 to-teal-500' },
  { name: 'Róż / Karmazyn', value: 'from-pink-500 to-rose-500' },
  { name: 'Fiolet / Purpura', value: 'from-indigo-400 to-purple-600' },
  { name: 'Złoto / Żółty', value: 'from-yellow-400 to-amber-600' },
  { name: 'Czerwień / Rubin', value: 'from-rose-500 to-red-600' },
];

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  settings,
  onUpdateSettings,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'actions' | 'clipboard' | 'hud' | 'audio'>('actions');
  const [recordingShortcutId, setRecordingShortcutId] = useState<string | null>(null);
  const [editingActionId, setEditingActionId] = useState<string | null>(null);

  const actions = settings.customActions && settings.customActions.length > 0
    ? settings.customActions
    : DEFAULT_ACTIONS;

  // Key press listener for assigning any keyboard shortcut
  useEffect(() => {
    if (!recordingShortcutId) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();

      // Don't bind bare modifiers like Shift alone
      if (['Shift', 'Control', 'Alt', 'Meta'].includes(e.key)) return;

      let keyLabel = e.key;
      if (e.code === 'Space') keyLabel = 'Space';
      if (keyLabel.length === 1) keyLabel = keyLabel.toUpperCase();

      // Update action shortcut
      const updated = actions.map((act) => {
        if (act.id === recordingShortcutId) {
          return { ...act, shortcut: keyLabel };
        }
        return act;
      });

      onUpdateSettings({ customActions: updated });
      sound.playSuccess(settings.soundEffects);
      setRecordingShortcutId(null);
    };

    window.addEventListener('keydown', handleKeyDown, { capture: true });
    return () => window.removeEventListener('keydown', handleKeyDown, { capture: true });
  }, [recordingShortcutId, actions, onUpdateSettings, settings.soundEffects]);

  if (!isOpen) return null;

  // Toggle action enabled status
  const handleToggleAction = (id: string) => {
    const updated = actions.map((act) => {
      if (act.id === id) {
        return { ...act, enabled: act.enabled === false ? true : false };
      }
      return act;
    });
    onUpdateSettings({ customActions: updated });
    sound.playClick(settings.soundEffects);
  };

  // Reset actions to default
  const handleResetActions = () => {
    onUpdateSettings({ customActions: DEFAULT_ACTIONS });
    sound.playPop(settings.soundEffects);
  };

  // Add new custom action
  const handleAddAction = () => {
    if (actions.length >= 12) {
      alert('Osiągnięto limit 12 akcji w menu HUD, aby zachować ergonomię.');
      return;
    }

    const nextNumber = String(actions.length + 1);
    const newAction: ActionItem = {
      id: `custom_${Date.now()}`,
      tool: 'clipboard',
      label: `Ułatwienie ${actions.length + 1}`,
      description: 'Dostosowane ułatwienie dostępu',
      iconName: 'Sparkles',
      shortcut: nextNumber,
      color: 'from-blue-500 to-indigo-600',
      badge: 'Własne',
      enabled: true,
    };

    onUpdateSettings({ customActions: [...actions, newAction] });
    setEditingActionId(newAction.id);
    sound.playSuccess(settings.soundEffects);
  };

  // Delete an action (enforce minimum 3)
  const handleDeleteAction = (id: string) => {
    if (actions.length <= 3) {
      alert('Wymagane są co najmniej 3 ułatwienia dostępu w menu.');
      return;
    }
    const updated = actions.filter((a) => a.id !== id);
    onUpdateSettings({ customActions: updated });
    sound.playClick(settings.soundEffects);
  };

  // Edit single action field
  const handleEditActionField = (id: string, field: keyof ActionItem, value: any) => {
    const updated = actions.map((act) => {
      if (act.id === id) {
        return { ...act, [field]: value };
      }
      return act;
    });
    onUpdateSettings({ customActions: updated });
  };

  return (
    <div
      id="settings-modal-container"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          setRecordingShortcutId(null);
          onClose();
        }
      }}
    >
      <motion.div
        initial={{ scale: 0.94, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.94, opacity: 0, y: 10 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        className="w-full max-w-3xl h-[88vh] max-h-[720px] rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl flex flex-col overflow-hidden text-slate-100"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-800 text-blue-400 flex items-center justify-center border border-slate-700 shadow-md">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Centrum Konfiguracji Ułatwień Dostępu</h3>
              <p className="text-xs text-slate-400">
                Pełna personalizacja skrótów klawiszowych, schowka, ilości opcji i parametrów
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-5 pt-2 border-b border-slate-800 bg-slate-950/40 flex items-center gap-1 text-xs">
          <button
            onClick={() => setActiveTab('actions')}
            className={`flex items-center gap-2 px-3 py-2 rounded-t-xl font-bold transition-all border-b-2 ${
              activeTab === 'actions'
                ? 'bg-slate-900 text-blue-400 border-blue-500'
                : 'text-slate-400 hover:text-slate-200 border-transparent'
            }`}
          >
            <Keyboard className="w-3.5 h-3.5" />
            <span>Skróty & Opcje HUD ({actions.filter((a) => a.enabled !== false).length})</span>
          </button>

          <button
            onClick={() => setActiveTab('clipboard')}
            className={`flex items-center gap-2 px-3 py-2 rounded-t-xl font-bold transition-all border-b-2 ${
              activeTab === 'clipboard'
                ? 'bg-slate-900 text-indigo-400 border-indigo-500'
                : 'text-slate-400 hover:text-slate-200 border-transparent'
            }`}
          >
            <Clipboard className="w-3.5 h-3.5" />
            <span>Inteligentny Schowek</span>
          </button>

          <button
            onClick={() => setActiveTab('hud')}
            className={`flex items-center gap-2 px-3 py-2 rounded-t-xl font-bold transition-all border-b-2 ${
              activeTab === 'hud'
                ? 'bg-slate-900 text-emerald-400 border-emerald-500'
                : 'text-slate-400 hover:text-slate-200 border-transparent'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Układ & Wygląd</span>
          </button>

          <button
            onClick={() => setActiveTab('audio')}
            className={`flex items-center gap-2 px-3 py-2 rounded-t-xl font-bold transition-all border-b-2 ${
              activeTab === 'audio'
                ? 'bg-slate-900 text-amber-400 border-amber-500'
                : 'text-slate-400 hover:text-slate-200 border-transparent'
            }`}
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>Dźwięki & Mowa</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* ========================================================
              TAB 1: ACTIONS & KEYBINDINGS CUSTOMIZER
              ======================================================== */}
          {activeTab === 'actions' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-2">
                    <span>Przypisane Skróty Klawiszowe i Ułatwienia</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-mono">
                      Limit: 3 - 12 opcji
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Kliknij przycisk klawisza, aby przypisać <b>DOWOLNY klawisz z klawiatury</b> (np. litery A-Z, cyfry 0-9, Space, F1-F12).
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleResetActions}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
                    title="Przywróć domyślne skróty i narzędzia"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Reset
                  </button>
                  <button
                    onClick={handleAddAction}
                    disabled={actions.length >= 12}
                    className="flex items-center gap-1 px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all disabled:opacity-40"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Dodaj opcję
                  </button>
                </div>
              </div>

              {/* Recording Overlay Notice */}
              {recordingShortcutId && (
                <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs flex items-center justify-between animate-pulse">
                  <span className="font-semibold">
                    ⌨️ Naciśnij teraz dowolny klawisz na klawiaturze, aby przypisać go do wybranego ułatwienia...
                  </span>
                  <button
                    onClick={() => setRecordingShortcutId(null)}
                    className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 hover:bg-slate-700 text-[10px]"
                  >
                    Anuluj
                  </button>
                </div>
              )}

              {/* Actions List */}
              <div className="space-y-2.5">
                {actions.map((action, index) => {
                  const isEnabled = action.enabled !== false;
                  const isRecording = recordingShortcutId === action.id;
                  const isEditing = editingActionId === action.id;

                  return (
                    <div
                      key={action.id}
                      className={`p-3 rounded-xl border transition-all ${
                        isEnabled
                          ? 'bg-slate-800/80 border-slate-700/80 hover:border-slate-600'
                          : 'bg-slate-900/50 border-slate-800/60 opacity-60'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        {/* Left: Checkbox + Icon + Label */}
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <input
                            type="checkbox"
                            checked={isEnabled}
                            onChange={() => handleToggleAction(action.id)}
                            className="w-4 h-4 rounded text-blue-500 bg-slate-800 border-slate-700 cursor-pointer accent-blue-500"
                            title={isEnabled ? 'Wyłącz ułatwienie' : 'Włącz ułatwienie'}
                          />

                          <div className={`p-2 rounded-xl bg-gradient-to-br ${action.color} text-white shadow-sm flex-shrink-0`}>
                            <Sparkles className="w-4 h-4" />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-white truncate">
                                {action.label}
                              </span>
                              {action.badge && (
                                <span className="px-1.5 py-0.2 rounded bg-slate-900 text-slate-400 text-[9px] font-mono">
                                  {action.badge}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-400 truncate">
                              {action.description}
                            </p>
                          </div>
                        </div>

                        {/* Right: Keybinding Button + Edit + Delete */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {/* Dedicated Keybinding Button */}
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-slate-400 font-medium">Skrót:</span>
                            <button
                              onClick={() => {
                                setRecordingShortcutId(action.id);
                                sound.playPop(settings.soundEffects);
                              }}
                              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-extrabold transition-all cursor-pointer border ${
                                isRecording
                                  ? 'bg-amber-500 text-slate-950 border-amber-400 ring-2 ring-amber-400/50 animate-bounce'
                                  : 'bg-slate-950 text-amber-300 border-slate-700 hover:border-amber-400 hover:bg-slate-900'
                              }`}
                              title="Kliknij, a następnie naciśnij dowolny klawisz"
                            >
                              {isRecording ? 'Naciśnij...' : `[ ${action.shortcut} ]`}
                            </button>
                          </div>

                          {/* Quick Edit Toggle */}
                          <button
                            onClick={() => setEditingActionId(isEditing ? null : action.id)}
                            className={`p-1.5 rounded-lg text-xs transition-colors ${
                              isEditing ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-700'
                            }`}
                            title="Edytuj szczegóły"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => handleDeleteAction(action.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-700 text-xs transition-colors"
                            title="Usuń ułatwienie"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Expandable Action Editor */}
                      {isEditing && (
                        <div className="mt-3 pt-3 border-t border-slate-700/60 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                          <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase">Nazwa opcji:</label>
                            <input
                              type="text"
                              value={action.label}
                              onChange={(e) => handleEditActionField(action.id, 'label', e.target.value)}
                              className="w-full mt-1 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase">Powiązane Narzędzie:</label>
                            <select
                              value={action.tool || 'clipboard'}
                              onChange={(e) => handleEditActionField(action.id, 'tool', e.target.value as ActiveTool)}
                              className="w-full mt-1 px-2 py-1 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white"
                            >
                              <option value="ai_chat">Czat AI Gemini / GPT</option>
                              <option value="clipboard">Inteligentny Schowek</option>
                              <option value="speech">Mowa na tekst & Tłumacz</option>
                              <option value="translate">Tłumacz na polski</option>
                              <option value="ocr">OCR ze zrzutu ekranu</option>
                              <option value="task_manager">Pasek Zadań & Killer</option>
                              <option value="text_tools">Narzędzia tekstu</option>
                              <option value="memo">Szybka notatka</option>
                              <option value="magnifier">Lupa ekranowa</option>
                              <option value="windows_export">Program Windows .py</option>
                            </select>
                          </div>

                          <div className="sm:col-span-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase">Kolor akcentu:</label>
                            <div className="flex flex-wrap gap-1.5 mt-1">
                              {AVAILABLE_COLORS.map((col) => (
                                <button
                                  key={col.value}
                                  onClick={() => handleEditActionField(action.id, 'color', col.value)}
                                  className={`px-2 py-1 rounded-lg text-[10px] font-medium transition-all ${
                                    action.color === col.value
                                      ? 'bg-blue-600 text-white font-bold ring-1 ring-white'
                                      : 'bg-slate-950 text-slate-300 hover:bg-slate-700'
                                  }`}
                                >
                                  {col.name}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ========================================================
              TAB 2: SMART CLIPBOARD SETTINGS
              ======================================================== */}
          {activeTab === 'clipboard' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-bold text-white flex items-center gap-2">
                  <Clipboard className="w-4 h-4 text-indigo-400" />
                  Konfiguracja Inteligentnego Schowka & Notesu
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Dostosuj automatyczny podział skopiowanych tekstów na krótkie kafelki i długie notatki
                </p>
              </div>

              {/* Threshold Selector */}
              <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-200">
                      Próg podziału długiego tekstu: <b className="text-indigo-400">{settings.clipboardLongTextThreshold || 120} znaków</b>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Teksty poniżej tego limitu są w całości widoczne na wierzchu jako szybkie kafelki (1-klik do skopiowania). Dłuższe teksty mają zwinięty podgląd i tryb czytnika notesu.
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  {[60, 100, 120, 200, 300, 500].map((thr) => (
                    <button
                      key={thr}
                      onClick={() => {
                        onUpdateSettings({ clipboardLongTextThreshold: thr });
                        sound.playPop(settings.soundEffects);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                        (settings.clipboardLongTextThreshold || 120) === thr
                          ? 'bg-indigo-600 text-white shadow-md'
                          : 'bg-slate-900 text-slate-300 hover:bg-slate-700 border border-slate-700'
                      }`}
                    >
                      {thr} zn.
                    </button>
                  ))}
                </div>
              </div>

              {/* Auto Capture Toggle */}
              <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-200">
                      Automatyczne zapisywanie mowy, OCR i tłumaczeń
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Każde rozpoznanie mowy, odczyt ze zrzutu ekranu lub przetłumaczony tekst natychmiast trafia do Twojej bazy schowka
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.autoCaptureClipboard !== false}
                    onChange={(e) => {
                      onUpdateSettings({ autoCaptureClipboard: e.target.checked });
                      sound.playClick(settings.soundEffects);
                    }}
                    className="w-4 h-4 rounded text-blue-500 bg-slate-800 border-slate-700 cursor-pointer accent-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ========================================================
              TAB 3: HUD LAYOUT & GENERAL APPEARANCE
              ======================================================== */}
          {activeTab === 'hud' && (
            <div className="space-y-4">
              {/* Layout Mode Selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-blue-400" />
                  Układ Wizualny Menu wokół Kursora
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => {
                      onUpdateSettings({ hudLayout: 'radial' });
                      sound.playPop(settings.soundEffects);
                    }}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-2 text-center transition-all cursor-pointer ${
                      settings.hudLayout === 'radial'
                        ? 'bg-blue-600/20 border-blue-500 text-white shadow-lg'
                        : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <CircleDot className="w-5 h-5 text-blue-400" />
                    <div>
                      <div className="text-xs font-bold">Wieniec (Radial)</div>
                      <div className="text-[10px] text-slate-400">Kołowe wokół kursora</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      onUpdateSettings({ hudLayout: 'capsule' });
                      sound.playPop(settings.soundEffects);
                    }}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-2 text-center transition-all cursor-pointer ${
                      settings.hudLayout === 'capsule'
                        ? 'bg-blue-600/20 border-blue-500 text-white shadow-lg'
                        : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Columns className="w-5 h-5 text-amber-400" />
                    <div>
                      <div className="text-xs font-bold">Kapsuła</div>
                      <div className="text-[10px] text-slate-400">Pasek pod wskaźnikiem</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      onUpdateSettings({ hudLayout: 'grid' });
                      sound.playPop(settings.soundEffects);
                    }}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-2 text-center transition-all cursor-pointer ${
                      settings.hudLayout === 'grid'
                        ? 'bg-blue-600/20 border-blue-500 text-white shadow-lg'
                        : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <LayoutGrid className="w-5 h-5 text-emerald-400" />
                    <div>
                      <div className="text-xs font-bold">Siatka Matrix</div>
                      <div className="text-[10px] text-slate-400">Kompaktowy kafelek</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Global Trigger Hotkey */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Keyboard className="w-3.5 h-3.5 text-amber-400" />
                  Główny Skrót Klawiszowy Aktywacji Menu
                </label>
                <div className="flex items-center gap-2">
                  {['Alt + Q', 'Ctrl + Spacja', 'F8', 'Win + Spacja', 'Alt + Spacja'].map((hotkey) => (
                    <button
                      key={hotkey}
                      onClick={() => {
                        onUpdateSettings({ primaryHotkey: hotkey });
                        sound.playPop(settings.soundEffects);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                        settings.primaryHotkey === hotkey
                          ? 'bg-amber-500 text-slate-950 shadow-md'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                      }`}
                    >
                      {hotkey}
                    </button>
                  ))}
                </div>
              </div>

              {/* Radius Size slider */}
              <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-200">Promień rozstawienia ikon w menu kołowym:</span>
                  <span className="text-blue-400 font-mono">{settings.radiusSize || 115} px</span>
                </div>
                <input
                  type="range"
                  min="90"
                  max="155"
                  step="5"
                  value={settings.radiusSize || 115}
                  onChange={(e) => onUpdateSettings({ radiusSize: parseInt(e.target.value, 10) })}
                  className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>
            </div>
          )}

          {/* ========================================================
              TAB 4: AUDIO, SPEECH & TTS
              ======================================================== */}
          {activeTab === 'audio' && (
            <div className="space-y-4">
              {/* Sound effects */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-800/80 border border-slate-700">
                <div>
                  <div className="text-xs font-bold text-slate-200">Efekty dźwiękowe (Audio Feedback)</div>
                  <div className="text-[11px] text-slate-400">
                    Subtelne kliknięcia i dźwięki potwierdzenia przy otwieraniu, kopiowaniu i przełączaniu
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.soundEffects}
                  onChange={(e) => {
                    onUpdateSettings({ soundEffects: e.target.checked });
                    sound.playClick(!settings.soundEffects);
                  }}
                  className="w-4 h-4 rounded text-blue-500 bg-slate-800 border-slate-700 cursor-pointer accent-blue-500"
                />
              </div>

              {/* Speech to Polish Default */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-800/80 border border-slate-700">
                <div>
                  <div className="text-xs font-bold text-slate-200">Automatyczne tłumaczenie mowy na język polski</div>
                  <div className="text-[11px] text-slate-400">
                    Domyślnie tłumacz nagrywany dźwięk na język polski w locie
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.speechTranslateAutoPL !== false}
                  onChange={(e) => {
                    onUpdateSettings({ speechTranslateAutoPL: e.target.checked });
                    sound.playClick(settings.soundEffects);
                  }}
                  className="w-4 h-4 rounded text-blue-500 bg-slate-800 border-slate-700 cursor-pointer accent-blue-500"
                />
              </div>

              {/* Auto copy results */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-800/80 border border-slate-700">
                <div>
                  <div className="text-xs font-bold text-slate-200">Automatyczne kopiowanie wyników do schowka</div>
                  <div className="text-[11px] text-slate-400">
                    Zapisuje rozpoznany tekst mowy i OCR od razu w systemowym schowku (Ctrl+V)
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.autoCopyResults}
                  onChange={(e) => {
                    onUpdateSettings({ autoCopyResults: e.target.checked });
                    sound.playClick(settings.soundEffects);
                  }}
                  className="w-4 h-4 rounded text-blue-500 bg-slate-800 border-slate-700 cursor-pointer accent-blue-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-800 bg-slate-900/80">
          <span className="text-[11px] text-slate-500">
            Wszystkie zmiany są zapisywane natychmiastowo
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg transition-colors cursor-pointer"
          >
            Zatwierdź i Zamknij
          </button>
        </div>
      </motion.div>
    </div>
  );
};
