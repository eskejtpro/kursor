import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Languages,
  ArrowRightLeft,
  Copy,
  Check,
  Volume2,
  Trash2,
  X,
  Sparkles,
  Clipboard,
  CheckCheck,
} from 'lucide-react';
import { translationService } from '../../services/translationService';
import { speechService } from '../../services/speechService';
import { sound } from '../../services/soundService';

interface TranslateModalProps {
  isOpen: boolean;
  initialText?: string;
  onClose: () => void;
  soundEffects: boolean;
  autoCopy: boolean;
  onPasteToTarget?: (text: string) => void;
  onAddToClipboard?: (text: string, source?: string) => void;
}

const SAMPLE_TEXTS = [
  'Welcome to the system. Click here to confirm your email address and start.',
  'Sehr geehrter Kunde, bitte überprüfen Sie Ihre Rechnung im Anhang.',
  'Bonjour le monde! Nous espérons que vous passez une excellente journée.',
  'Hola, muchas gracias por su ayuda. Todo funciona perfectamente.',
  'Доброго дня! Будь ласка, перевірте налаштування вашого акаунту.',
];

export const TranslateModal: React.FC<TranslateModalProps> = ({
  isOpen,
  initialText = '',
  onClose,
  soundEffects,
  autoCopy,
  onPasteToTarget,
  onAddToClipboard,
}) => {
  const [sourceText, setSourceText] = useState(initialText);
  const [translatedText, setTranslatedText] = useState('');
  const [detectedLang, setDetectedLang] = useState<{
    code: string;
    name: string;
    flag: string;
    confidence: number;
  }>({ code: 'auto', name: 'Auto-detekcja', flag: '🌐', confidence: 0 });
  const [isTranslating, setIsTranslating] = useState(false);
  const [copied, setCopied] = useState(false);

  // Sync initialText when modal opens
  useEffect(() => {
    if (initialText) {
      setSourceText(initialText);
      handleTranslate(initialText);
    }
  }, [initialText, isOpen]);

  // Handle live translation when typing (with debounce)
  useEffect(() => {
    if (!sourceText.trim()) {
      setTranslatedText('');
      setDetectedLang({ code: 'auto', name: 'Wykrywanie...', flag: '🌐', confidence: 0 });
      return;
    }

    const detected = translationService.detectLanguage(sourceText);
    setDetectedLang(detected);

    const timer = setTimeout(() => {
      handleTranslate(sourceText);
    }, 280);

    return () => clearTimeout(timer);
  }, [sourceText]);

  const handleTranslate = async (text: string) => {
    if (!text.trim()) return;
    setIsTranslating(true);
    try {
      const res = await translationService.translateToPolish(text);
      setTranslatedText(res.translatedText);
      if (autoCopy && res.translatedText) {
        navigator.clipboard.writeText(res.translatedText);
      }
      if (onAddToClipboard && res.translatedText) {
        onAddToClipboard(res.translatedText, `Tłumacz (${detectedLang.name} -> PL)`);
      }
    } catch (err) {
      console.error('Translation error:', err);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleCopy = () => {
    if (!translatedText) return;
    navigator.clipboard.writeText(translatedText);
    if (onAddToClipboard) {
      onAddToClipboard(translatedText, 'Tłumacz PL');
    }
    setCopied(true);
    sound.playSuccess(soundEffects);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePasteFromClipboard = async () => {
    try {
      const clip = await navigator.clipboard.readText();
      if (clip) {
        setSourceText(clip);
        sound.playPop(soundEffects);
      }
    } catch {
      // Ignore
    }
  };

  const handleSpeakPolish = () => {
    if (!translatedText) return;
    sound.playClick(soundEffects);
    speechService.speak(translatedText, 'pl-PL');
  };

  const handleClear = () => {
    setSourceText('');
    setTranslatedText('');
    sound.playClick(soundEffects);
  };

  // Close with Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      id="translate-modal-container"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 10 }}
        transition={{ type: 'spring', damping: 24, stiffness: 350 }}
        className="w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl shadow-blue-500/10 overflow-hidden text-slate-100"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <Languages className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                Automatyczny Tłumacz na Język Polski
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/30">
                  Auto-Detect + Offline AI
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Wykrywa dowolny język obcy i natychmiast tłumaczy na polski
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Dual Translator Layout */}
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Left: Source Text */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 font-semibold text-slate-300">
                  <span>{detectedLang.flag}</span>
                  <span>{detectedLang.name}</span>
                  {detectedLang.confidence > 0 && (
                    <span className="text-[10px] text-slate-500 font-mono">
                      ({detectedLang.confidence}%)
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={handlePasteFromClipboard}
                    className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 text-[11px] flex items-center gap-1 transition-colors"
                    title="Wklej ze schowka"
                  >
                    <Clipboard className="w-3 h-3" />
                    Wklej
                  </button>
                  {sourceText && (
                    <button
                      onClick={handleClear}
                      className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800 text-[11px] transition-colors"
                      title="Wyczyść"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              <textarea
                value={sourceText}
                onChange={(e) => setSourceText(e.target.value)}
                placeholder="Wpisz, wklej lub zaznacz tekst w dowolnym języku (angielski, niemiecki, francuski, hiszpański itp.)..."
                rows={5}
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder:text-slate-600 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 resize-none font-sans"
              />
            </div>

            {/* Right: Polish Output */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 font-semibold text-blue-400">
                  <span>🇵🇱</span>
                  <span>Język polski</span>
                  <span className="text-[10px] text-blue-300/70 font-mono bg-blue-500/10 px-1 rounded">
                    Wynik
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={handleSpeakPolish}
                    disabled={!translatedText}
                    className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 text-[11px] flex items-center gap-1 transition-colors disabled:opacity-30"
                    title="Czytaj na głos po polsku"
                  >
                    <Volume2 className="w-3 h-3 text-blue-400" />
                    Czytaj
                  </button>
                  <button
                    onClick={handleCopy}
                    disabled={!translatedText}
                    className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 text-[11px] flex items-center gap-1 transition-colors disabled:opacity-30"
                    title="Kopiuj przetłumaczony tekst"
                  >
                    {copied ? (
                      <CheckCheck className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                    {copied ? 'Skopiowano' : 'Kopiuj'}
                  </button>
                </div>
              </div>

              <div className="relative w-full h-[128px] p-3 rounded-xl bg-slate-950/80 border border-slate-800 overflow-y-auto text-sm text-slate-200">
                {isTranslating ? (
                  <div className="flex items-center gap-2 text-blue-400 text-xs mt-2">
                    <Sparkles className="w-4 h-4 animate-spin" />
                    <span>Tłumaczenie na język polski...</span>
                  </div>
                ) : translatedText ? (
                  <p className="whitespace-pre-wrap leading-relaxed">
                    {translatedText}
                  </p>
                ) : (
                  <p className="text-slate-600 text-xs italic">
                    Tłumaczenie na polski pojawi się tutaj automatycznie...
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Sample quick prompts */}
          <div className="space-y-1 pt-1">
            <span className="text-[11px] text-slate-500 font-medium">
              Przykładowe teksty do testu jednym kliknięciem:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {SAMPLE_TEXTS.map((sample, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSourceText(sample);
                    sound.playPop(soundEffects);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] border border-slate-700/60 truncate max-w-[280px] transition-colors cursor-pointer"
                >
                  {sample}
                </button>
              ))}
            </div>
          </div>

          {/* Bottom Toolbar */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-800">
            <span className="text-xs text-slate-400">
              💡 Zaznacz dowolny tekst na pulpicie i wciśnij <span className="font-mono text-blue-400">Alt+Q → 2</span>
            </span>

            <div className="flex items-center gap-2">
              {onPasteToTarget && (
                <button
                  onClick={() => {
                    if (translatedText) {
                      onPasteToTarget(translatedText);
                      sound.playSuccess(soundEffects);
                      onClose();
                    }
                  }}
                  disabled={!translatedText}
                  className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-xs font-bold transition-all cursor-pointer"
                >
                  Wklej w kursor
                </button>
              )}
              <button
                onClick={handleCopy}
                disabled={!translatedText}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400 disabled:opacity-40 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-blue-500/20 cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Skopiowano!' : 'Kopiuj przetłumaczony tekst'}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
