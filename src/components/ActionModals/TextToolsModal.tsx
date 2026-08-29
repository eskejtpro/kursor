import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Wand2,
  Copy,
  Check,
  Trash2,
  X,
  Mail,
  Phone,
  Link,
  Hash,
  Sparkles,
} from 'lucide-react';
import { textToolsService } from '../../services/textToolsService';
import { sound } from '../../services/soundService';

interface TextToolsModalProps {
  isOpen: boolean;
  initialText?: string;
  onClose: () => void;
  soundEffects: boolean;
  onPasteToTarget?: (text: string) => void;
}

export const TextToolsModal: React.FC<TextToolsModalProps> = ({
  isOpen,
  initialText = '',
  onClose,
  soundEffects,
  onPasteToTarget,
}) => {
  const [text, setText] = useState(initialText || 'Przykładowy tekst ze znakami: ą, ę, ś, ć. Kontakt: biuro@firma.pl lub tel: +48 500 600 700. Zobacz https://example.com');
  const [copied, setCopied] = useState(false);

  const extracted = textToolsService.extractData(text);
  const stats = textToolsService.getStats(text);

  const handleCopy = (strToCopy = text) => {
    navigator.clipboard.writeText(strToCopy);
    setCopied(true);
    sound.playSuccess(soundEffects);
    setTimeout(() => setCopied(false), 2000);
  };

  const applyTransform = (transformFn: (t: string) => string) => {
    setText((prev) => transformFn(prev));
    sound.playPop(soundEffects);
  };

  if (!isOpen) return null;

  return (
    <div
      id="text-tools-modal-container"
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
        className="w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl overflow-hidden text-slate-100"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center border border-pink-500/30">
              <Wand2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                Narzędzia i Korekta Tekstu
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-pink-500/15 text-pink-300 border border-pink-500/30">
                  Lokalnie
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Szybka zmiana wielkości liter, oczyszczanie spacji i ekstrakcja danych
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

        <div className="p-5 space-y-4">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={4}
            placeholder="Wpisz lub wklej tekst..."
            className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder:text-slate-600 text-sm focus:outline-none focus:border-pink-500 resize-none font-sans"
          />

          {/* Transform Buttons */}
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-slate-400">Szybkie przekształcenia:</span>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => applyTransform(textToolsService.cleanWhitespace)}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 border border-slate-700 transition-colors"
              >
                Usuń zbędne spacje
              </button>
              <button
                onClick={() => applyTransform(textToolsService.toUpperCase)}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 border border-slate-700 transition-colors font-mono"
              >
                WIELKIE LITERY
              </button>
              <button
                onClick={() => applyTransform(textToolsService.toLowerCase)}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 border border-slate-700 transition-colors font-mono"
              >
                małe litery
              </button>
              <button
                onClick={() => applyTransform(textToolsService.toSentenceCase)}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 border border-slate-700 transition-colors"
              >
                Jak w zdaniu
              </button>
              <button
                onClick={() => applyTransform(textToolsService.toTitleCase)}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 border border-slate-700 transition-colors"
              >
                Każde Słowo Wielką
              </button>
              <button
                onClick={() => applyTransform(textToolsService.removePolishDiacritics)}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 border border-slate-700 transition-colors"
              >
                Usuń ogonki (bez PL)
              </button>
            </div>
          </div>

          {/* Extracted Entities */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800">
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                <Mail className="w-3.5 h-3.5 text-blue-400" />
                <span>E-maile ({extracted.emails.length})</span>
              </div>
              <div className="text-[11px] text-slate-200 truncate">
                {extracted.emails.length > 0 ? (
                  extracted.emails.map((e, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleCopy(e)}
                      className="cursor-pointer hover:text-blue-400 truncate"
                      title="Kliknij aby skopiować"
                    >
                      {e}
                    </div>
                  ))
                ) : (
                  <span className="text-slate-600">Brak</span>
                )}
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span>Telefony ({extracted.phones.length})</span>
              </div>
              <div className="text-[11px] text-slate-200 truncate">
                {extracted.phones.length > 0 ? (
                  extracted.phones.map((p, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleCopy(p)}
                      className="cursor-pointer hover:text-emerald-400 truncate"
                      title="Kliknij aby skopiować"
                    >
                      {p}
                    </div>
                  ))
                ) : (
                  <span className="text-slate-600">Brak</span>
                )}
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                <Link className="w-3.5 h-3.5 text-indigo-400" />
                <span>Linki ({extracted.urls.length})</span>
              </div>
              <div className="text-[11px] text-slate-200 truncate">
                {extracted.urls.length > 0 ? (
                  extracted.urls.map((u, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleCopy(u)}
                      className="cursor-pointer hover:text-indigo-400 truncate"
                      title="Kliknij aby skopiować"
                    >
                      {u}
                    </div>
                  ))
                ) : (
                  <span className="text-slate-600">Brak</span>
                )}
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                <Hash className="w-3.5 h-3.5 text-amber-400" />
                <span>Statystyki</span>
              </div>
              <div className="text-[11px] text-slate-300 space-y-0.5">
                <div>Znaków: <b>{stats.characters}</b></div>
                <div>Słów: <b>{stats.words}</b></div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-800">
            <button
              onClick={() => setText('')}
              className="text-xs text-slate-500 hover:text-slate-300 flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" /> Wyczyść
            </button>
            <div className="flex items-center gap-2">
              {onPasteToTarget && (
                <button
                  onClick={() => {
                    onPasteToTarget(text);
                    sound.playSuccess(soundEffects);
                    onClose();
                  }}
                  className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
                >
                  Wklej w kursor
                </button>
              )}
              <button
                onClick={() => handleCopy(text)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-pink-500/20"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Skopiowano!' : 'Kopiuj gotowy tekst'}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
