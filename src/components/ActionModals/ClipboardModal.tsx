import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Clipboard,
  X,
  Search,
  Copy,
  Check,
  Pin,
  Trash2,
  Plus,
  ArrowRight,
  ClipboardPaste,
  FileText,
  Code,
  Globe,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Download,
  Filter,
  StickyNote,
  Sliders,
} from 'lucide-react';
import { ClipboardItem } from '../../types';
import { sound } from '../../services/soundService';

interface ClipboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: ClipboardItem[];
  threshold: number; // e.g. 120 chars
  onCopyItem: (text: string) => void;
  onPasteToTarget?: (text: string) => void;
  onAddItem: (text: string, source?: string) => void;
  onTogglePin: (id: string) => void;
  onDeleteItem: (id: string) => void;
  onClearAll: () => void;
  onOpenSettings?: () => void;
  soundEffects: boolean;
}

export const ClipboardModal: React.FC<ClipboardModalProps> = ({
  isOpen,
  onClose,
  items,
  threshold,
  onCopyItem,
  onPasteToTarget,
  onAddItem,
  onTogglePin,
  onDeleteItem,
  onClearAll,
  onOpenSettings,
  soundEffects,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'short' | 'long' | 'pinned'>('all');
  const [newText, setNewText] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [isAddingOpen, setIsAddingOpen] = useState(false);

  if (!isOpen) return null;

  // Toggle expanded state for long items
  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    sound.playPop(soundEffects);
  };

  // Handle single item copy
  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    onCopyItem(text);
    setCopiedId(id);
    sound.playSuccess(soundEffects);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Handle Add Item
  const handleAdd = () => {
    if (!newText.trim()) return;
    onAddItem(newText.trim(), 'Ręczny');
    setNewText('');
    setIsAddingOpen(false);
    sound.playPop(soundEffects);
  };

  // Export clipboard history to txt
  const handleExportTxt = () => {
    if (items.length === 0) return;
    const content = items
      .map((item, index) => `--- [${index + 1}] ${new Date(item.timestamp).toLocaleString('pl-PL')} (${item.charCount} zn.) ---\n${item.text}\n`)
      .join('\n');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Schowek_KursorAssist_${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    sound.playSuccess(soundEffects);
  };

  // Filter and sort items (pinned first, then latest)
  const filteredItems = useMemo(() => {
    return items
      .filter((item) => {
        // Text search
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          if (!item.text.toLowerCase().includes(q)) return false;
        }

        // Category / Type filter
        if (activeFilter === 'short') return item.charCount <= threshold;
        if (activeFilter === 'long') return item.charCount > threshold;
        if (activeFilter === 'pinned') return !!item.isPinned;
        return true;
      })
      .sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return b.timestamp - a.timestamp;
      });
  }, [items, searchQuery, activeFilter, threshold]);

  // Split into short and long for overview badges
  const shortItems = filteredItems.filter((i) => i.charCount <= threshold);
  const longItems = filteredItems.filter((i) => i.charCount > threshold);

  return (
    <div
      id="clipboard-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
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
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center shadow-md">
              <Clipboard className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">Inteligentny Schowek & Podręczny Notes</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  {items.length} pozycji
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Krótkie teksty (≤{threshold} zn.) są od razu na wierzchu, dłuższe mają zwinięty podgląd i tryb notesu
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {onOpenSettings && (
              <button
                onClick={onOpenSettings}
                className="p-2 rounded-xl text-slate-400 hover:text-amber-300 hover:bg-slate-800 transition-colors"
                title="Zmień próg długości tekstu i ustawienia schowka"
              >
                <Sliders className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={handleExportTxt}
              disabled={items.length === 0}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors disabled:opacity-40"
              title="Eksportuj schowek do pliku .txt"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Toolbar: Search, Filters, Add Button */}
        <div className="px-5 py-3 border-b border-slate-800 bg-slate-950/40 flex flex-wrap items-center justify-between gap-2.5">
          {/* Search bar */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Szukaj w schowku (słowo kluczowe, kod, link)..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                activeFilter === 'all'
                  ? 'bg-blue-600 text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Wszystkie ({items.length})
            </button>
            <button
              onClick={() => setActiveFilter('short')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                activeFilter === 'short'
                  ? 'bg-emerald-600 text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Krótkie
            </button>
            <button
              onClick={() => setActiveFilter('long')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                activeFilter === 'long'
                  ? 'bg-indigo-600 text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Długie / Notes
            </button>
            <button
              onClick={() => setActiveFilter('pinned')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                activeFilter === 'pinned'
                  ? 'bg-amber-600 text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              📌 Przypięte
            </button>
          </div>

          {/* New Item Button */}
          <button
            onClick={() => setIsAddingOpen(!isAddingOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/30 text-xs font-bold transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nowy wpis</span>
          </button>
        </div>

        {/* Optional Add Note Panel */}
        <AnimatePresence>
          {isAddingOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="px-5 py-3 border-b border-slate-800 bg-slate-900/90 overflow-hidden"
            >
              <div className="space-y-2">
                <textarea
                  value={newText}
                  onChange={(e) => setNewText(e.target.value)}
                  placeholder="Wpisz lub wklej dowolny tekst/notatkę do schowka..."
                  rows={3}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 font-sans resize-none"
                />
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>
                    Długość: <b className="text-slate-200">{newText.length}</b> znaków (
                    {newText.length > threshold ? (
                      <span className="text-indigo-400 font-semibold">Trafi do sekcji Długie/Notes</span>
                    ) : (
                      <span className="text-emerald-400 font-semibold">Trafi do sekcji Krótkie kafelki</span>
                    )}
                    )
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsAddingOpen(false)}
                      className="px-3 py-1 rounded-lg text-slate-400 hover:text-slate-200 text-xs"
                    >
                      Anuluj
                    </button>
                    <button
                      onClick={handleAdd}
                      disabled={!newText.trim()}
                      className="px-4 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs disabled:opacity-40"
                    >
                      Zapisz w Schowku
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main List Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {filteredItems.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 rounded-2xl border border-dashed border-slate-800 bg-slate-950/40">
              <Clipboard className="w-10 h-10 text-slate-600 mb-2" />
              <h4 className="text-sm font-bold text-slate-300">Schowek jest pusty</h4>
              <p className="text-xs text-slate-500 max-w-sm mt-1">
                Gdy kopiujesz teksty, wykonujesz tłumaczenia, OCR lub dyktujesz mowę, historia zapisze się tutaj automatycznie.
              </p>
            </div>
          ) : (
            <>
              {/* SECTION 1: KRÓTKIE TEKSTY NA WIERZCHU (QUICK CHIPS) */}
              {(activeFilter === 'all' || activeFilter === 'short') && shortItems.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                    <span className="flex items-center gap-1.5 text-emerald-400">
                      <Sparkles className="w-3.5 h-3.5" />
                      Krótkie teksty na wierzchu (Szybkie wklejanie / 1-Klik)
                    </span>
                    <span className="text-[11px] text-slate-500 font-normal">
                      {shortItems.length} pozycji (≤{threshold} zn.)
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {shortItems.map((item) => (
                      <div
                        key={item.id}
                        className={`group relative p-3 rounded-xl border transition-all ${
                          item.isPinned
                            ? 'bg-amber-950/20 border-amber-500/40 shadow-sm'
                            : 'bg-slate-800/80 hover:bg-slate-800 border-slate-700/80 hover:border-slate-600'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <div className="flex items-center gap-1.5">
                            {item.isPinned && (
                              <span className="p-0.5 rounded text-amber-400 text-[10px] flex items-center gap-0.5 font-bold">
                                <Pin className="w-3 h-3 fill-amber-400" />
                              </span>
                            )}
                            <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded">
                              {item.source || 'Tekst'}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">
                              {item.charCount} zn.
                            </span>
                          </div>

                          <div className="flex items-center gap-1 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => onTogglePin(item.id)}
                              className={`p-1 rounded hover:bg-slate-700 ${
                                item.isPinned ? 'text-amber-400' : 'text-slate-400'
                              }`}
                              title={item.isPinned ? 'Odepnij' : 'Przypnij na wierzchu'}
                            >
                              <Pin className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => onDeleteItem(item.id)}
                              className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-700"
                              title="Usuń wpis"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        {/* Full short text */}
                        <div
                          onClick={() => handleCopy(item.id, item.text)}
                          className="text-xs text-slate-200 font-mono bg-slate-950/60 p-2 rounded-lg border border-slate-800/80 break-words cursor-pointer hover:border-blue-500 transition-colors select-text"
                          title="Kliknij, aby skopiować"
                        >
                          {item.text}
                        </div>

                        {/* Actions footer */}
                        <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-700/40 text-[11px]">
                          <span className="text-slate-500">
                            {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <div className="flex items-center gap-1.5">
                            {onPasteToTarget && (
                              <button
                                onClick={() => {
                                  onPasteToTarget(item.text);
                                  sound.playSuccess(soundEffects);
                                }}
                                className="px-2 py-0.5 rounded bg-slate-700 hover:bg-blue-600 text-slate-300 hover:text-white text-[10px] font-medium transition-colors"
                              >
                                Wklej w ekran
                              </button>
                            )}
                            <button
                              onClick={() => handleCopy(item.id, item.text)}
                              className="flex items-center gap-1 px-2 py-0.5 rounded bg-blue-600/30 hover:bg-blue-600 text-blue-300 hover:text-white text-[10px] font-bold transition-all"
                            >
                              {copiedId === item.id ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-400" />
                                  <span>Skopiowano!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  <span>Kopiuj</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SECTION 2: DŁUGIE TEKSTY (ZWINIĘTY PODGLĄD & ALA NOTES) */}
              {(activeFilter === 'all' || activeFilter === 'long') && longItems.length > 0 && (
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                    <span className="flex items-center gap-1.5 text-indigo-400">
                      <FileText className="w-3.5 h-3.5" />
                      Długie teksty i dokumenty (Zwinięty podgląd / Ala Notes)
                    </span>
                    <span className="text-[11px] text-slate-500 font-normal">
                      {longItems.length} pozycji (&gt;{threshold} zn.)
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {longItems.map((item) => {
                      const isExpanded = expandedIds.has(item.id);
                      return (
                        <div
                          key={item.id}
                          className={`p-3.5 rounded-xl border transition-all ${
                            item.isPinned
                              ? 'bg-amber-950/15 border-amber-500/40 shadow-sm'
                              : 'bg-slate-800/70 border-slate-700/80 hover:border-slate-600'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2">
                              {item.isPinned && (
                                <span className="p-0.5 rounded text-amber-400 text-[10px] flex items-center gap-0.5 font-bold">
                                  <Pin className="w-3 h-3 fill-amber-400" />
                                </span>
                              )}
                              <span className="text-[10px] font-mono text-indigo-300 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-800/50 flex items-center gap-1">
                                <StickyNote className="w-3 h-3" />
                                {item.source || 'Długi tekst'}
                              </span>
                              <span className="text-[11px] font-bold text-slate-300">
                                {item.charCount} znaków
                              </span>
                              <span className="text-[11px] text-slate-500">
                                • {item.wordCount} słów
                              </span>
                            </div>

                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => onTogglePin(item.id)}
                                className={`p-1.5 rounded hover:bg-slate-700 text-xs ${
                                  item.isPinned ? 'text-amber-400' : 'text-slate-400'
                                }`}
                                title={item.isPinned ? 'Odepnij' : 'Przypnij'}
                              >
                                <Pin className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => onDeleteItem(item.id)}
                                className="p-1.5 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-700 text-xs"
                                title="Usuń"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Collapsed vs Expanded Content */}
                          <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800 text-xs font-mono text-slate-200">
                            {isExpanded ? (
                              <div className="whitespace-pre-wrap leading-relaxed max-h-64 overflow-y-auto pr-1 select-text">
                                {item.text}
                              </div>
                            ) : (
                              <div className="line-clamp-2 leading-relaxed text-slate-300 opacity-90">
                                {item.text}
                              </div>
                            )}
                          </div>

                          {/* Footer with Toggle & Copy Buttons */}
                          <div className="flex items-center justify-between mt-2.5 pt-1.5 border-t border-slate-700/50 text-xs">
                            <button
                              onClick={() => toggleExpand(item.id)}
                              className="flex items-center gap-1 text-[11px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
                            >
                              {isExpanded ? (
                                <>
                                  <ChevronUp className="w-3.5 h-3.5" />
                                  <span>Zwiń podgląd</span>
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="w-3.5 h-3.5" />
                                  <span>Rozwiń pełny tekst notesu ({item.charCount} zn.)</span>
                                </>
                              )}
                            </button>

                            <div className="flex items-center gap-2">
                              {onPasteToTarget && (
                                <button
                                  onClick={() => {
                                    onPasteToTarget(item.text);
                                    sound.playSuccess(soundEffects);
                                  }}
                                  className="px-2.5 py-1 rounded bg-slate-700 hover:bg-blue-600 text-slate-200 hover:text-white text-xs font-medium transition-colors"
                                >
                                  Wklej w ekran
                                </button>
                              )}
                              <button
                                onClick={() => handleCopy(item.id, item.text)}
                                className="flex items-center gap-1 px-3 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-sm"
                              >
                                {copiedId === item.id ? (
                                  <>
                                    <Check className="w-3 h-3 text-emerald-300" />
                                    <span>Skopiowano!</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3 h-3" />
                                    <span>Kopiuj całość</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-900/80 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span>Łącznie w pamięci: <b className="text-white">{items.length}</b></span>
            <span>•</span>
            <span className="text-emerald-400">Krótkie: {items.filter((i) => i.charCount <= threshold).length}</span>
            <span>•</span>
            <span className="text-indigo-400">Długie: {items.filter((i) => i.charCount > threshold).length}</span>
          </div>

          <div className="flex items-center gap-2">
            {items.length > 0 && (
              <button
                onClick={() => {
                  if (confirm('Czy na pewno chcesz wyczyścić całą historię schowka?')) {
                    onClearAll();
                  }
                }}
                className="px-3 py-1 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 text-xs transition-colors"
              >
                Wyczyść schowek
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors"
            >
              Zamknij
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
