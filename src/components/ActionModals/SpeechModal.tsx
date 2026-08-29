import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Mic,
  MicOff,
  Copy,
  Check,
  Languages,
  Volume2,
  Trash2,
  X,
  Sparkles,
  ArrowRight,
  ClipboardPaste,
  Play,
  FileAudio,
  Radio,
  Sliders,
} from 'lucide-react';
import { speechService } from '../../services/speechService';
import { translationService } from '../../services/translationService';
import { sound } from '../../services/soundService';

interface SpeechModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTranslate?: (text: string) => void;
  onPasteToTarget?: (text: string) => void;
  onAddToClipboard?: (text: string, source?: string) => void;
  soundEffects: boolean;
  autoCopy: boolean;
}

const SAMPLE_AUDIO_PHRASES = [
  { lang: 'en-US', label: '🇬🇧 EN: "Hello, please save this report and send it to the manager immediately."', text: 'Hello, please save this report and send it to the manager immediately.' },
  { lang: 'de-DE', label: '🇩🇪 DE: "Guten Tag, das System funktioniert einwandfrei und die Daten sind gespeichert."', text: 'Guten Tag, das System funktioniert einwandfrei und die Daten sind gespeichert.' },
  { lang: 'es-ES', label: '🇪🇸 ES: "Hola, necesito ayuda con la configuración de la cuenta de usuario."', text: 'Hola, necesito ayuda con la configuración de la cuenta de usuario.' },
  { lang: 'uk-UA', label: '🇺🇦 UA: "Доброго дня, надішліть будь ласка документ на електронну пошту."', text: 'Доброго дня, надішліть будь ласка документ на електронну пошту.' },
];

export const SpeechModal: React.FC<SpeechModalProps> = ({
  isOpen,
  onClose,
  onTranslate,
  onPasteToTarget,
  onAddToClipboard,
  soundEffects,
  autoCopy,
}) => {
  const [mode, setMode] = useState<'dictation' | 'speech_to_polish'>('speech_to_polish');
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [translatedPolish, setTranslatedPolish] = useState('');
  const [detectedLangName, setDetectedLangName] = useState('Automatycznie');
  const [selectedLang, setSelectedLang] = useState('auto');
  const [copiedOriginal, setCopiedOriginal] = useState(false);
  const [copiedPolish, setCopiedPolish] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [volumeLevels, setVolumeLevels] = useState<number[]>([15, 25, 40, 60, 30, 15, 45, 70, 35, 20]);

  // Audio waveform animation when listening
  useEffect(() => {
    let interval: any;
    if (isListening) {
      interval = setInterval(() => {
        setVolumeLevels(
          Array.from({ length: 14 }, () => Math.floor(Math.random() * 65) + 15)
        );
      }, 90);
    }
    return () => clearInterval(interval);
  }, [isListening]);

  // Automatically translate transcript to Polish in real time
  useEffect(() => {
    if (!transcript.trim()) {
      setTranslatedPolish('');
      setDetectedLangName('Automatycznie');
      return;
    }

    let isMounted = true;

    const performTranslation = async () => {
      if (mode === 'speech_to_polish') {
        try {
          const res = await translationService.translateToPolish(transcript);
          if (!isMounted) return;

          setTranslatedPolish(res.translatedText);
          const langProfile = translationService.detectLanguage(transcript);
          setDetectedLangName(langProfile.name);

          if (autoCopy && res.translatedText) {
            navigator.clipboard.writeText(res.translatedText);
          }

          if (onAddToClipboard && res.translatedText) {
            onAddToClipboard(res.translatedText, `Mowa (${langProfile.name} -> PL)`);
          }
        } catch (err) {
          console.error('Audio translate error:', err);
        }
      } else {
        if (autoCopy && transcript) {
          navigator.clipboard.writeText(transcript);
        }
        if (onAddToClipboard && transcript) {
          onAddToClipboard(transcript, 'Mowa (STT)');
        }
      }
    };

    performTranslation();

    return () => {
      isMounted = false;
    };
  }, [transcript, mode]);

  // Start / Stop Microphone
  const toggleListening = () => {
    setErrorMessage(null);
    if (isListening) {
      speechService.stopListening();
      setIsListening(false);
      sound.playClick(soundEffects);
    } else {
      sound.playPop(soundEffects);
      const langToUse = selectedLang === 'auto' ? 'en-US' : selectedLang;
      const success = speechService.startListening(
        {
          onStart: () => setIsListening(true),
          onResult: (text, isFinal) => {
            setTranscript(text);
          },
          onError: (err) => {
            setErrorMessage(err);
            setIsListening(false);
          },
          onEnd: () => setIsListening(false),
        },
        langToUse
      );

      if (!success) {
        setIsListening(false);
      }
    }
  };

  // Test with sample audio text simulation
  const handleSampleSelect = (sample: typeof SAMPLE_AUDIO_PHRASES[0]) => {
    sound.playPop(soundEffects);
    setTranscript(sample.text);
    if (selectedLang !== 'auto') {
      setSelectedLang(sample.lang);
    }
  };

  const handleCopyOriginal = () => {
    if (!transcript) return;
    navigator.clipboard.writeText(transcript);
    setCopiedOriginal(true);
    sound.playSuccess(soundEffects);
    setTimeout(() => setCopiedOriginal(false), 2000);
  };

  const handleCopyPolish = () => {
    if (!translatedPolish) return;
    navigator.clipboard.writeText(translatedPolish);
    setCopiedPolish(true);
    sound.playSuccess(soundEffects);
    setTimeout(() => setCopiedPolish(false), 2000);
  };

  const handleSpeak = (text: string, lang = 'pl-PL') => {
    if (!text) return;
    sound.playClick(soundEffects);
    speechService.speak(text, lang);
  };

  const handleClear = () => {
    setTranscript('');
    setTranslatedPolish('');
    setErrorMessage(null);
    sound.playClick(soundEffects);
  };

  // Close with Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        speechService.stopListening();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      id="speech-modal-container"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-md"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          speechService.stopListening();
          onClose();
        }
      }}
    >
      <motion.div
        initial={{ scale: 0.94, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.94, opacity: 0, y: 10 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl shadow-amber-500/10 text-slate-100 flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30 shadow-md">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">Rozpoznawanie i Tłumaczenie Mowy</h3>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  Offline / Bez API
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Dyktowanie głosem oraz automatyczne tłumaczenie dźwięku na język polski
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              speechService.stopListening();
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Tabs (Tłumacz Mowę na PL vs Zwykłe Dyktowanie) */}
        <div className="px-5 pt-3 pb-1 border-b border-slate-800 bg-slate-950/40 flex items-center gap-2 text-xs">
          <button
            onClick={() => {
              setMode('speech_to_polish');
              sound.playPop(soundEffects);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              mode === 'speech_to_polish'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Languages className="w-3.5 h-3.5" />
            <span>Tłumacz Mowę na Polski (Auto-PL)</span>
          </button>

          <button
            onClick={() => {
              setMode('dictation');
              sound.playPop(soundEffects);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              mode === 'dictation'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            <span>Zwykłe Dyktowanie (STT)</span>
          </button>
        </div>

        {/* Main Body */}
        <div className="p-5 space-y-4">
          {/* Controls Bar: Source Lang & Status */}
          <div className="flex items-center justify-between text-xs flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Język wejściowy:</span>
              <select
                value={selectedLang}
                onChange={(e) => setSelectedLang(e.target.value)}
                disabled={isListening}
                className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-200 text-xs focus:outline-none focus:border-amber-500"
              >
                <option value="auto">✨ Auto-Wykrywanie (Wszystkie)</option>
                <option value="pl-PL">🇵🇱 Polski (pl-PL)</option>
                <option value="en-US">🇺🇸 Angielski (en-US)</option>
                <option value="de-DE">🇩🇪 Niemiecki (de-DE)</option>
                <option value="fr-FR">🇫🇷 Francuski (fr-FR)</option>
                <option value="es-ES">🇪🇸 Hiszpański (es-ES)</option>
                <option value="uk-UA">🇺🇦 Ukraiński (uk-UA)</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <div
                className={`w-2 h-2 rounded-full ${
                  isListening ? 'bg-amber-400 animate-ping' : 'bg-slate-600'
                }`}
              />
              <span className="text-slate-300 font-medium">
                {isListening ? 'Nasłuchiwanie aktywne...' : 'Mikrofon w gotowości'}
              </span>
            </div>
          </div>

          {/* Results Boxes */}
          {mode === 'speech_to_polish' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Box 1: Original Spoken Voice */}
              <div className="flex flex-col p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1 font-semibold text-amber-400">
                    <Mic className="w-3 h-3" />
                    Rozpoznana Mowa ({detectedLangName})
                  </span>
                  {transcript && (
                    <button
                      onClick={handleCopyOriginal}
                      className="hover:text-white flex items-center gap-1 text-[10px]"
                    >
                      {copiedOriginal ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedOriginal ? 'Skopiowano' : 'Kopiuj'}</span>
                    </button>
                  )}
                </div>

                <div className="min-h-[100px] max-h-[140px] overflow-y-auto text-xs text-slate-200 leading-relaxed font-sans select-text">
                  {transcript || (
                    <span className="text-slate-500 italic">
                      Mów do mikrofonu lub wybierz próbkę poniżej...
                    </span>
                  )}
                </div>
              </div>

              {/* Box 2: Auto-Translated Polish Result */}
              <div className="flex flex-col p-3 rounded-xl bg-blue-950/20 border border-blue-500/30 space-y-2">
                <div className="flex items-center justify-between text-[11px] text-blue-300 font-semibold">
                  <span className="flex items-center gap-1">
                    <Languages className="w-3 h-3 text-cyan-400" />
                    Przetłumaczono na Język Polski
                  </span>
                  {translatedPolish && (
                    <button
                      onClick={handleCopyPolish}
                      className="hover:text-white flex items-center gap-1 text-[10px] text-blue-300"
                    >
                      {copiedPolish ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedPolish ? 'Skopiowano' : 'Kopiuj'}</span>
                    </button>
                  )}
                </div>

                <div className="min-h-[100px] max-h-[140px] overflow-y-auto text-xs text-blue-100 font-semibold leading-relaxed font-sans select-text">
                  {translatedPolish || (
                    <span className="text-slate-500 italic">
                      Automatyczne tłumaczenie na język polski pojawi się tutaj natychmiast...
                    </span>
                  )}
                </div>

                {translatedPolish && (
                  <div className="flex items-center justify-end gap-1.5 pt-1 border-t border-blue-500/20">
                    <button
                      onClick={() => handleSpeak(translatedPolish, 'pl-PL')}
                      className="p-1 rounded text-slate-400 hover:text-white"
                      title="Odsłuchaj po polsku"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                    {onPasteToTarget && (
                      <button
                        onClick={() => {
                          onPasteToTarget(translatedPolish);
                          sound.playSuccess(soundEffects);
                        }}
                        className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold transition-all shadow-sm"
                      >
                        Wklej w aktywny kursor
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Single Large Box for Normal Dictation */
            <div className="relative min-h-[130px] max-h-[200px] overflow-y-auto p-4 rounded-xl bg-slate-950/80 border border-slate-800 focus-within:border-amber-500/50 transition-colors">
              {transcript ? (
                <p className="text-slate-100 text-sm leading-relaxed whitespace-pre-wrap select-text">
                  {transcript}
                </p>
              ) : (
                <div className="flex flex-col items-center justify-center h-24 text-center text-slate-500">
                  <Mic className="w-8 h-8 mb-1.5 opacity-30" />
                  <p className="text-xs">
                    Kliknij przycisk mikrofonu poniżej i zacznij dyktować...
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Audio Visualizer Waveform */}
          {isListening && (
            <div className="flex items-center justify-center gap-1 h-8 px-4 bg-slate-950/40 rounded-xl border border-amber-500/20">
              {volumeLevels.map((lvl, i) => (
                <motion.div
                  key={i}
                  animate={{ height: `${lvl}%` }}
                  transition={{ duration: 0.1 }}
                  className="w-1.5 bg-gradient-to-t from-amber-500 to-yellow-300 rounded-full"
                />
              ))}
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              {errorMessage}
            </div>
          )}

          {/* Quick Audio / Text Samples */}
          <div className="space-y-1.5 pt-1">
            <div className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
              <FileAudio className="w-3.5 h-3.5 text-blue-400" />
              Szybkie próbki mowy do przetestowania (kliknij, aby zasymulować mowę):
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {SAMPLE_AUDIO_PHRASES.map((sample, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSampleSelect(sample)}
                  className="text-left px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 text-[11px] text-slate-300 hover:text-white truncate transition-all cursor-pointer"
                >
                  {sample.label}
                </button>
              ))}
            </div>
          </div>

          {/* Control Action Buttons */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-800">
            <button
              onClick={handleClear}
              disabled={!transcript}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800 text-xs transition-colors disabled:opacity-40"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Wyczyść
            </button>

            {/* Main Microphone Record Button */}
            <button
              onClick={toggleListening}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs shadow-lg transition-all cursor-pointer ${
                isListening
                  ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30 animate-pulse'
                  : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-extrabold shadow-amber-500/20'
              }`}
            >
              {isListening ? (
                <>
                  <MicOff className="w-4 h-4" />
                  Zatrzymaj mikrofon
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4" />
                  Rozpocznij nagrywanie
                </>
              )}
            </button>

            {/* Copy / Insert Button */}
            <div className="flex items-center gap-1.5">
              {mode === 'dictation' && onPasteToTarget && transcript && (
                <button
                  onClick={() => {
                    onPasteToTarget(transcript);
                    sound.playSuccess(soundEffects);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold"
                >
                  Wklej
                </button>
              )}
              <button
                onClick={mode === 'speech_to_polish' ? handleCopyPolish : handleCopyOriginal}
                disabled={!transcript}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold disabled:opacity-40"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Kopiuj</span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
