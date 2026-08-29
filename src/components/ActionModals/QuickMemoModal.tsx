import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { StickyNote, Copy, Check, Trash2, X, Plus, Pin } from 'lucide-react';
import { sound } from '../../services/soundService';

interface QuickMemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  soundEffects: boolean;
}

export const QuickMemoModal: React.FC<QuickMemoModalProps> = ({
  isOpen,
  onClose,
  soundEffects,
}) => {
  const [memos, setMemos] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('kursor_assist_memos');
      return saved ? JSON.parse(saved) : ['📌 Kupić chleb i mleko\n📌 Skrót Alt+Q otwiera menu\n📌 Przetłumaczyć fakturę'];
    } catch {
      return ['Notatka podręczna...'];
    }
  });
  const [activeIdx, setActiveIdx] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('kursor_assist_memos', JSON.stringify(memos));
    } catch {
      // Ignore
    }
  }, [memos]);

  const handleUpdate = (val: string) => {
    setMemos((prev) => {
      const next = [...prev];
      next[activeIdx] = val;
      return next;
    });
  };

  const handleAddNew = () => {
    setMemos((prev) => [...prev, 'Nowa notatka...']);
    setActiveIdx(memos.length);
    sound.playPop(soundEffects);
  };

  const handleDelete = (index: number) => {
    if (memos.length <= 1) {
      setMemos(['']);
      return;
    }
    setMemos((prev) => prev.filter((_, i) => i !== index));
    setActiveIdx((prev) => Math.max(0, prev - 1));
    sound.playClick(soundEffects);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(memos[activeIdx] || '');
    setCopied(true);
    sound.playSuccess(soundEffects);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div
      id="quick-memo-modal-container"
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
        className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl overflow-hidden text-slate-100"
      >
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <StickyNote className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Podręczny Notes (Memo)</h3>
              <p className="text-[11px] text-slate-400">Autozapis w pamięci lokalnej</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-3">
          {/* Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {memos.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveIdx(i)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  activeIdx === i
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                <Pin className="w-3 h-3" />
                <span>Karta {i + 1}</span>
              </button>
            ))}
            <button
              onClick={handleAddNew}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1 transition-colors"
              title="Dodaj nową kartę"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <textarea
            value={memos[activeIdx] || ''}
            onChange={(e) => handleUpdate(e.target.value)}
            rows={7}
            placeholder="Zanotuj coś na szybko..."
            className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder:text-slate-600 text-sm focus:outline-none focus:border-amber-500 resize-none font-sans leading-relaxed"
          />

          <div className="flex items-center justify-between pt-2 border-t border-slate-800">
            <button
              onClick={() => handleDelete(activeIdx)}
              className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" /> Usuń tę kartę
            </button>

            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors shadow-lg shadow-amber-500/20"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Skopiowano!' : 'Kopiuj notatkę'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
