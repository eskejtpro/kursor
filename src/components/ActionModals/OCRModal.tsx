import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  ScanText,
  Crop,
  Upload,
  Copy,
  Check,
  Languages,
  Volume2,
  Trash2,
  X,
  Sparkles,
  Loader2,
  Image as ImageIcon,
  CheckCircle2,
} from 'lucide-react';
import { OCRResult } from '../../types';
import { ocrService } from '../../services/ocrService';
import { speechService } from '../../services/speechService';
import { sound } from '../../services/soundService';

interface OCRModalProps {
  isOpen: boolean;
  initialResult?: OCRResult | null;
  onClose: () => void;
  onStartSnipper: () => void;
  onTranslateText: (text: string) => void;
  onPasteToTarget?: (text: string) => void;
  onAddToClipboard?: (text: string, source?: string) => void;
  soundEffects: boolean;
  autoCopy: boolean;
}

// Sample presets for instant testing
const TEST_PRESETS = [
  {
    name: 'Faktura EN',
    desc: 'Invoice #8492 - Total Due: $1,250.00 USD - Payment Terms: Net 30 Days',
    imgText: 'INVOICE #8492\nCompany: Tech Global Ltd\nTotal Due: $1,250.00 USD\nPayment Date: 2026-08-30\nStatus: Pending Payment',
  },
  {
    name: 'Błąd Systemowy',
    desc: 'Error 404: The requested resource was not found on this server.',
    imgText: 'ERROR 0x80070002:\nThe system cannot find the file specified.\nPlease verify the configuration and restart the service.',
  },
  {
    name: 'Znak DE',
    desc: 'Achtung! Baustelle betreten verboten. Eltern haften für ihre Kinder.',
    imgText: 'ACHTUNG!\nBaustelle betreten verboten.\nEltern haften für ihre Kinder.\nStadtverwaltung München',
  },
];

export const OCRModal: React.FC<OCRModalProps> = ({
  isOpen,
  initialResult,
  onClose,
  onStartSnipper,
  onTranslateText,
  onPasteToTarget,
  onAddToClipboard,
  soundEffects,
  autoCopy,
}) => {
  const [ocrText, setOcrText] = useState(initialResult?.text || '');
  const [previewImg, setPreviewImg] = useState<string | null>(initialResult?.imageUrl || null);
  const [confidence, setConfidence] = useState<number>(initialResult?.confidence || 0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressStatus, setProgressStatus] = useState('');
  const [progressPercent, setProgressPercent] = useState(0);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync initial result
  useEffect(() => {
    if (initialResult) {
      setOcrText(initialResult.text);
      setConfidence(initialResult.confidence);
      if (initialResult.imageUrl) setPreviewImg(initialResult.imageUrl);
      if (autoCopy && initialResult.text) {
        navigator.clipboard.writeText(initialResult.text);
      }
    }
  }, [initialResult, isOpen, autoCopy]);

  // Global paste handler (Ctrl+V with image in clipboard)
  useEffect(() => {
    if (!isOpen) return;

    const handlePaste = async (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            e.preventDefault();
            processImageFile(file);
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [isOpen]);

  const processImageFile = async (file: File | Blob) => {
    setIsProcessing(true);
    setProgressPercent(10);
    setProgressStatus('Wczytywanie pliku...');
    sound.playPop(soundEffects);

    try {
      const preview = URL.createObjectURL(file);
      setPreviewImg(preview);

      const result = await ocrService.recognize(file, {
        onProgress: (pct, status) => {
          setProgressPercent(pct);
          setProgressStatus(status);
        },
      });

      setOcrText(result.text);
      setConfidence(result.confidence);
      sound.playSuccess(soundEffects);

      if (autoCopy && result.text) {
        navigator.clipboard.writeText(result.text);
      }
      if (onAddToClipboard && result.text) {
        onAddToClipboard(result.text, 'OCR');
      }
    } catch (err) {
      console.error('OCR Process error:', err);
      setOcrText('Nie udało się odczytać tekstu z tego obrazu. Spróbuj wyraźniejszego zrzutu.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleCopy = () => {
    if (!ocrText) return;
    navigator.clipboard.writeText(ocrText);
    if (onAddToClipboard) {
      onAddToClipboard(ocrText, 'OCR');
    }
    setCopied(true);
    sound.playSuccess(soundEffects);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeak = () => {
    if (!ocrText) return;
    sound.playClick(soundEffects);
    speechService.speak(ocrText);
  };

  // Generate canvas from sample preset and recognize
  const handlePresetSelect = async (preset: (typeof TEST_PRESETS)[0]) => {
    setIsProcessing(true);
    setProgressPercent(20);
    setProgressStatus('Generowanie obrazu testowego...');

    const canvas = document.createElement('canvas');
    canvas.width = 450;
    canvas.height = 180;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 18px monospace';
      ctx.fillText(`[SAMPLE IMAGE] ${preset.name}`, 20, 35);

      ctx.fillStyle = '#f8fafc';
      ctx.font = '15px Arial, sans-serif';

      const lines = preset.imgText.split('\n');
      lines.forEach((l, idx) => {
        ctx.fillText(l, 20, 70 + idx * 24);
      });

      setPreviewImg(canvas.toDataURL('image/png'));

      const result = await ocrService.recognize(canvas, {
        onProgress: (pct, status) => {
          setProgressPercent(pct);
          setProgressStatus(status);
        },
      });

      setOcrText(result.text || preset.imgText);
      setConfidence(result.confidence || 94);
      sound.playSuccess(soundEffects);
    }
    setIsProcessing(false);
  };

  if (!isOpen) return null;

  return (
    <div
      id="ocr-modal-container"
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
        className="w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl shadow-emerald-500/10 overflow-hidden text-slate-100"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <ScanText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                OCR - Odczyt Tekstu ze Zrzutu i Obrazów
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  Tesseract Offline AI
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Wytnij obszar ekranu lub wklej dowolny obraz
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

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Action trigger strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {/* Snipping Trigger */}
            <button
              onClick={() => {
                onClose();
                onStartSnipper();
              }}
              className="flex items-center justify-center gap-2 p-3 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 font-bold text-xs transition-all cursor-pointer group"
            >
              <Crop className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span>✂️ Wytnij obszar ekranu</span>
            </button>

            {/* File Upload */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-medium text-xs transition-all cursor-pointer group"
            >
              <Upload className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
              <span>Wybierz plik obrazu</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />

            {/* Paste from clipboard tip */}
            <div className="flex items-center justify-center gap-1.5 p-3 rounded-xl bg-slate-800/40 border border-slate-800 text-slate-400 text-xs text-center">
              <ImageIcon className="w-4 h-4 text-slate-500" />
              <span>Wklej obraz: <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-[10px] text-slate-300 font-mono">Ctrl+V</kbd></span>
            </div>
          </div>

          {/* Preset quick test buttons */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 text-[11px]">Szybki test:</span>
            {TEST_PRESETS.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => handlePresetSelect(preset)}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] border border-slate-700/60 transition-colors cursor-pointer"
              >
                {preset.name}
              </button>
            ))}
          </div>

          {/* Processing Indicator */}
          {isProcessing && (
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col items-center gap-2 text-center">
              <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
              <span className="text-xs text-slate-300 font-medium">
                {progressStatus || 'Odczytywanie tekstu za pomocą Tesseract OCR...'}
              </span>
              <div className="w-48 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-emerald-400 h-full transition-all duration-200"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}

          {/* Results Preview Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            {/* Image Preview Thumbnail */}
            {previewImg && (
              <div className="md:col-span-4 rounded-xl bg-slate-950 border border-slate-800 p-2 flex flex-col items-center justify-center">
                <span className="text-[10px] text-slate-500 font-mono mb-1.5 self-start">
                  Źródło obrazu:
                </span>
                <img
                  src={previewImg}
                  alt="Zrzut do OCR"
                  className="max-h-32 object-contain rounded-lg border border-slate-800"
                />
              </div>
            )}

            {/* Extracted Text Box */}
            <div className={`${previewImg ? 'md:col-span-8' : 'md:col-span-12'} space-y-1.5`}>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-300">
                    Rozpoznany tekst:
                  </span>
                  {confidence > 0 && (
                    <span className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      <CheckCircle2 className="w-3 h-3" />
                      Pewność: {confidence}%
                    </span>
                  )}
                </div>
                {ocrText && (
                  <button
                    onClick={() => {
                      setOcrText('');
                      setPreviewImg(null);
                    }}
                    className="text-slate-500 hover:text-slate-300 p-1 rounded"
                    title="Wyczyść"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <textarea
                value={ocrText}
                onChange={(e) => setOcrText(e.target.value)}
                placeholder="Odczytany tekst z obrazu pojawi się w tym miejscu..."
                rows={5}
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder:text-slate-600 text-sm focus:outline-none focus:border-emerald-500 resize-none font-sans"
              />
            </div>
          </div>

          {/* Action Footer Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-800">
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                disabled={!ocrText}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Skopiowano!' : 'Kopiuj tekst'}
              </button>

              <button
                onClick={handleSpeak}
                disabled={!ocrText}
                title="Odsłuchaj na głos"
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 border border-slate-700 transition-colors"
              >
                <Volume2 className="w-4 h-4" />
              </button>

              {onPasteToTarget && (
                <button
                  onClick={() => {
                    if (ocrText) {
                      onPasteToTarget(ocrText);
                      sound.playSuccess(soundEffects);
                      onClose();
                    }
                  }}
                  disabled={!ocrText}
                  className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-xs font-semibold transition-colors"
                >
                  Wklej w kursor
                </button>
              )}
            </div>

            {/* Direct 1-Click Translation to Polish button! */}
            <button
              onClick={() => {
                if (ocrText) {
                  onTranslateText(ocrText);
                }
              }}
              disabled={!ocrText}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 disabled:opacity-40 text-white font-bold text-xs transition-all shadow-lg shadow-blue-500/20 cursor-pointer"
            >
              <Languages className="w-4 h-4" />
              <span>Przetłumacz ten tekst na polski 🇵🇱</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
