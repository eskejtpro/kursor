export type HUDLayoutMode = 'radial' | 'capsule' | 'grid';

export type ActiveTool = 
  | null 
  | 'speech' 
  | 'translate' 
  | 'ocr' 
  | 'tts' 
  | 'clipboard' 
  | 'text_tools' 
  | 'memo' 
  | 'magnifier'
  | 'ai_chat'
  | 'task_manager'
  | 'windows_export'
  | 'settings';

export interface RunningApp {
  id: string;
  title: string;
  processName: string;
  pid: number;
  iconName: string;
  ramUsageMb: number;
  cpuPercent: number;
  status: 'running' | 'unresponsive' | 'pinned_top';
  isPinnedTop: boolean;
  category: 'browser' | 'editor' | 'media' | 'system' | 'dev';
}

export interface ActionItem {
  id: string;
  tool: ActiveTool;
  label: string;
  description: string;
  iconName: string;
  shortcut: string; // e.g. '1', '2', 'Q', 'W', 'E', 'C', 'S', 'T', 'O', 'M', 'X', 'Z', 'F', 'Space'
  badge?: string;
  color: string;
  enabled?: boolean;
}

export interface ClipboardItem {
  id: string;
  text: string;
  timestamp: number;
  isPinned?: boolean;
  charCount: number;
  wordCount: number;
  category: 'code' | 'url' | 'email' | 'text' | 'long_doc';
  source?: string; // 'Mowa' | 'Tłumacz' | 'OCR' | 'AI Chat' | 'Schowek' | 'Notatka'
}

export interface Coordinates {
  x: number;
  y: number;
}

export interface OCRResult {
  text: string;
  confidence: number;
  language?: string;
  timestamp: number;
  imageUrl?: string;
}

export interface TranslationResult {
  sourceText: string;
  translatedText: string;
  sourceLang: string;
  targetLang: string;
  confidence?: number;
  timestamp: number;
}

export interface SpeechResult {
  transcript: string;
  isFinal: boolean;
  confidence?: number;
  detectedLang?: string;
  translatedPolish?: string;
}

export interface AppSettings {
  hudLayout: HUDLayoutMode;
  primaryHotkey: string; // e.g. 'Alt+Q'
  radiusSize: number; // radius for radial layout
  autoCopyResults: boolean;
  soundEffects: boolean;
  theme: 'dark' | 'midnight' | 'slate' | 'oled';
  triggerOnClickOutside: boolean;
  autoTranslateOCR: boolean;
  ttsVoiceRate: number;
  ttsVoicePitch: number;
  // Extended settings
  clipboardLongTextThreshold: number; // e.g., 120 chars
  autoCaptureClipboard: boolean;
  customActions: ActionItem[];
  speechTranslateAutoPL: boolean;
}

export interface HistoryEntry {
  id: string;
  type: 'speech' | 'translate' | 'ocr' | 'memo' | 'clipboard';
  title: string;
  content: string;
  metadata?: Record<string, any>;
  timestamp: number;
}

