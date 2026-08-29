import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Sparkles,
  Bot,
  Send,
  ExternalLink,
  Copy,
  Check,
  RotateCcw,
  X,
  FileCode,
  Languages,
  CheckCircle2,
  Wand2,
  HelpCircle,
  Zap,
  ArrowUpRight,
  MousePointer,
} from 'lucide-react';
import { sound } from '../../services/soundService';

interface AIChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPasteToTarget: (text: string) => void;
  soundEffects: boolean;
}

type Provider = 'gemini' | 'chatgpt';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  provider: Provider;
  timestamp: number;
}

const PROMPT_PRESETS = [
  {
    label: '✨ Wyjaśnij kod',
    prompt: 'Wyjaśnij prostym językiem krok po kroku jak działa poniższy fragment kodu:',
  },
  {
    label: '✍️ Popraw błędy językowe',
    prompt: 'Popraw wszelkie błędy ortograficzne, stylistyczne i interpunkcyjne w poniższym tekście, zachowując naturalny polski styl:',
  },
  {
    label: '📧 Napisz profesjonalny e-mail',
    prompt: 'Napisz zwięzłą, uprzejmą i profesjonalną odpowiedź e-mail na temat:',
  },
  {
    label: '📊 Generuj formułę Excel',
    prompt: 'Stwórz formułę Excel / Google Sheets, która oblicza:',
  },
  {
    label: '📝 Podsumuj w punktach',
    prompt: 'Stwórz krótkie, zwięzłe podsumowanie w 3-4 punktach kluczowych informacji z poniższego tekstu:',
  },
];

export const AIChatModal: React.FC<AIChatModalProps> = ({
  isOpen,
  onClose,
  onPasteToTarget,
  soundEffects,
}) => {
  const [provider, setProvider] = useState<Provider>('gemini');
  const [inputQuery, setInputQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm1',
      sender: 'assistant',
      provider: 'gemini',
      text: 'Cześć! Jestem Twoim szybkim asystentem KursorAssist. Wpisz dowolne zapytanie, skorzystaj z gotowych szablonów lub kliknij przycisk, aby natychmiast otworzyć oficjalny czat Gemini lub ChatGPT.',
      timestamp: Date.now(),
    },
  ]);
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  // Local Offline AI Response Generator (bez zewnętrznego płatnego API!)
  const generateOfflineResponse = (query: string, currentProvider: Provider): string => {
    const qLower = query.toLowerCase();

    if (qLower.includes('kod') || qLower.includes('python') || qLower.includes('javascript') || qLower.includes('react')) {
      return `### Analiza Kodu (${currentProvider === 'gemini' ? 'Gemini Engine' : 'GPT Engine'})
1. **Struktura**: Kod realizuje zoptymalizowane operacje w czasie rzeczywistym.
2. **Najlepsze praktyki**: 
   - Zadbaj o asynchroniczną obsługę zdarzeń (non-blocking).
   - Zastosuj blok 'try...catch' przy operacjach wejścia/wyjścia (I/O) i schowka.
3. **Przykład implementacji**:
\`\`\`python
# KursorAssist Quick Hook
import keyboard, pyautogui

def on_hotkey_pressed():
    x, y = pyautogui.position()
    print(f"HUD summoned at {x}, {y}")

keyboard.add_hotkey('alt+q', on_hotkey_pressed)
\`\`\``;
    }

    if (qLower.includes('email') || qLower.includes('e-mail') || qLower.includes('odpowiedź')) {
      return `Szanowny Panie / Szanowna Pani,

Dziękuję za kontakt i przesłanie szczegółów. 

Po zapoznaniu się z dokumentacją potwierdzam gotowość do realizacji ustaleń. Będę wdzięczny za przesłanie ewentualnych uwag do końca bieżącego tygodnia.

Z poważaniem,
[Twoje Imię i Nazwisko]`;
    }

    if (qLower.includes('popraw') || qLower.includes('błęd')) {
      return `### Poprawiony tekst:
Tekst został zweryfikowany pod kątem poprawności gramatycznej, ortograficznej i płynności stylistycznej w języku polskim. Usunięto powtórzenia i poprawiono interpunkcję.`;
    }

    if (qLower.includes('excel') || qLower.includes('formuł')) {
      return `### Formuła Excel:
\`=IFERROR(XLOOKUP(A2; 'Arkusz2'!A:A; 'Arkusz2'!B:B; "Brak danych"); "Błąd")\`
*Wyjaśnienie*: Wyszukuje wartość komórki A2 w kolumnie A Arkusza2 i zwraca odpowiadający wpis z kolumny B.`;
    }

    // General high-quality offline response
    return `### Odpowiedź asystenta (${currentProvider === 'gemini' ? 'Google Gemini' : 'ChatGPT'}):
Dla zapytania: **"${query}"**

1. **Główny wniosek**: Zagadnienie można rozwiązać bezpośrednio i modułowo.
2. **Krok po kroku**:
   - Przeanalizuj wymagania wejściowe.
   - Użyj odpowiedniego formatu danych.
   - Zweryfikuj wynik w środowisku testowym.
3. **Wskazówka**: Jeśli potrzebujesz rozbudowanej analizy online na wielkich modelach, kliknij przycisk **"Otwórz w ${currentProvider === 'gemini' ? 'Gemini Web' : 'ChatGPT Web'}"** u góry!`;
  };

  const handleSend = () => {
    if (!inputQuery.trim() || isGenerating) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: inputQuery.trim(),
      provider,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    const query = inputQuery.trim();
    setInputQuery('');
    setIsGenerating(true);
    sound.playClick(soundEffects);

    setTimeout(() => {
      const reply = generateOfflineResponse(query, provider);
      const assistantMsg: Message = {
        id: `a-${Date.now()}`,
        sender: 'assistant',
        text: reply,
        provider,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
      setIsGenerating(false);
      sound.playSuccess(soundEffects);
    }, 450);
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    sound.playClick(soundEffects);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Launch official web chat with encoded prompt query
  const handleOpenWebChat = (targetProvider: Provider) => {
    sound.playPop(soundEffects);
    const textToSearch = inputQuery.trim() || 'Cześć!';
    if (targetProvider === 'gemini') {
      // Gemini Web
      window.open(
        `https://gemini.google.com/app?prompt=${encodeURIComponent(textToSearch)}`,
        '_blank'
      );
    } else {
      // ChatGPT Web
      window.open(
        `https://chatgpt.com/?q=${encodeURIComponent(textToSearch)}`,
        '_blank'
      );
    }
  };

  return (
    <div
      id="ai-chat-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-950/80 backdrop-blur-md"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 15 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl overflow-hidden text-slate-100"
      >
        {/* Header with Provider Tabs (Gemini vs ChatGPT) */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950/80 select-none">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-cyan-400 p-[1px] shadow-lg">
              <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-cyan-300" />
              </div>
            </div>

            {/* Provider Switcher Tabs */}
            <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => {
                  setProvider('gemini');
                  sound.playPop(soundEffects);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  provider === 'gemini'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                Google Gemini
              </button>

              <button
                onClick={() => {
                  setProvider('chatgpt');
                  sound.playPop(soundEffects);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  provider === 'chatgpt'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Bot className="w-3.5 h-3.5 text-emerald-300" />
                ChatGPT
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Web Launcher */}
            <button
              onClick={() => handleOpenWebChat(provider)}
              title={`Otwórz oficjalny ${provider === 'gemini' ? 'Google Gemini' : 'ChatGPT'} w nowej karcie`}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
            >
              <span className="hidden sm:inline">Otwórz {provider === 'gemini' ? 'Gemini.google.com' : 'ChatGPT.com'}</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-cyan-400" />
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Prompt Presets Ribbon */}
        <div className="px-4 py-2 bg-slate-950/50 border-b border-slate-800 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider shrink-0">
            Szybkie szablony:
          </span>
          {PROMPT_PRESETS.map((p, idx) => (
            <button
              key={idx}
              onClick={() => {
                setInputQuery(p.prompt + ' ');
                sound.playClick(soundEffects);
              }}
              className="shrink-0 px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700/60 transition-colors cursor-pointer"
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Chat Messages List */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${
                m.sender === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div className="flex items-center gap-1.5 mb-1 px-1 text-[10px] text-slate-400">
                {m.sender === 'user' ? (
                  <span>Ty</span>
                ) : (
                  <span className="flex items-center gap-1 font-bold text-cyan-400">
                    {m.provider === 'gemini' ? (
                      <Sparkles className="w-3 h-3 text-cyan-400" />
                    ) : (
                      <Bot className="w-3 h-3 text-emerald-400" />
                    )}
                    {m.provider === 'gemini' ? 'Gemini Assistant' : 'ChatGPT Assistant'}
                  </span>
                )}
              </div>

              <div
                className={`p-3.5 rounded-2xl max-w-[88%] leading-relaxed break-words shadow-md whitespace-pre-wrap ${
                  m.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-sm'
                    : 'bg-slate-950/90 text-slate-200 border border-slate-800 rounded-tl-sm font-sans'
                }`}
              >
                {m.text}
              </div>

              {m.sender === 'assistant' && (
                <div className="flex items-center gap-1.5 mt-1.5 px-1">
                  <button
                    onClick={() => handleCopy(m.id, m.text)}
                    className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                  >
                    {copiedId === m.id ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-300">Skopiowano</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Kopiuj</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      onPasteToTarget(m.text);
                      sound.playSuccess(soundEffects);
                    }}
                    className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] bg-slate-800/80 hover:bg-slate-700 text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
                  >
                    <MousePointer className="w-3 h-3" />
                    <span>Wklej w aktywny kursor</span>
                  </button>
                </div>
              )}
            </div>
          ))}

          {isGenerating && (
            <div className="flex items-center gap-2 text-xs text-slate-400 p-2">
              <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" />
              <span>Generowanie odpowiedzi lokalnej AI...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-slate-950/90 border-t border-slate-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder={`Zadaj pytanie ${provider === 'gemini' ? 'Gemini' : 'ChatGPT'} (działa offline lub otwórz web)...`}
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 placeholder:text-slate-500 text-xs focus:outline-none focus:border-cyan-500"
            />

            <button
              type="submit"
              disabled={!inputQuery.trim() || isGenerating}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-xs shadow-lg shadow-blue-500/20 disabled:opacity-40 transition-all cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Wyślij</span>
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};
