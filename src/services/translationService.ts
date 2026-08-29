import { TranslationResult } from '../types';

interface LangRule {
  code: string;
  name: string;
  flag: string;
  markers: RegExp[];
  stopWords: string[];
}

const LANGUAGE_PROFILES: LangRule[] = [
  {
    code: 'en',
    name: 'Angielski',
    flag: '🇬🇧',
    markers: [/\b(the|is|are|was|were|have|has|had|with|this|that|from|they|what|which)\b/gi],
    stopWords: ['the', 'and', 'for', 'you', 'with', 'about', 'welcome', 'cancel', 'save', 'submit', 'error', 'settings', 'loading'],
  },
  {
    code: 'de',
    name: 'Niemiecki',
    flag: '🇩🇪',
    markers: [/[äöüß]/gi, /\b(der|die|das|und|ist|nicht|für|mit|ein|eine|einer|haben|werden|von)\b/gi],
    stopWords: ['und', 'der', 'die', 'das', 'nicht', 'bitte', 'abbrechen', 'speichern', 'einstellungen', 'hilfe'],
  },
  {
    code: 'fr',
    name: 'Francuski',
    flag: '🇫🇷',
    markers: [/[éèêëàâùûçîï]/gi, /\b(le|la|les|un|une|des|est|sont|avec|pour|dans|sur|qui|que)\b/gi],
    stopWords: ['et', 'le', 'la', 'les', 'avec', 'pour', 'annuler', 'enregistrer', 'aide', 'bonjour'],
  },
  {
    code: 'es',
    name: 'Hiszpański',
    flag: '🇪🇸',
    markers: [/[áéíóúñ¿¡]/gi, /\b(el|la|los|las|un|una|es|son|con|para|por|como|pero)\b/gi],
    stopWords: ['y', 'el', 'la', 'los', 'con', 'por', 'para', 'cancelar', 'guardar', 'ayuda', 'hola'],
  },
  {
    code: 'it',
    name: 'Włoski',
    flag: '🇮🇹',
    markers: [/[àèéìòù]/gi, /\b(il|lo|la|i|gli|le|un|uno|una|è|sono|con|per|tra|fra)\b/gi],
    stopWords: ['e', 'il', 'la', 'per', 'con', 'annulla', 'salva', 'impostazioni', 'ciao'],
  },
  {
    code: 'uk',
    name: 'Ukraiński',
    flag: '🇺🇦',
    markers: [/[іїєґ]/gi, /[а-яА-ЯёЁіІїЇєЄґҐ]/gi],
    stopWords: ['і', 'та', 'що', 'як', 'це', 'для', 'на', 'з', 'до', 'привіт', 'скасувати', 'зберегти'],
  },
  {
    code: 'ru',
    name: 'Rosyjski',
    flag: '🇷🇺',
    markers: [/[ыэъ]/gi, /[а-яА-ЯёЁ]/gi],
    stopWords: ['и', 'в', 'не', 'на', 'что', 'с', 'по', 'как', 'это', 'для', 'отмена', 'сохранить'],
  },
  {
    code: 'cs',
    name: 'Czeski',
    flag: '🇨🇿',
    markers: [/[řšťčžýáíéúůďťň]/gi, /\b(a|v|se|na|že|to|s|do|je|jsou|pro|jako)\b/gi],
    stopWords: ['a', 'se', 'na', 'že', 'zrušit', 'uložit', 'nastavení', 'ahoj'],
  },
  {
    code: 'pl',
    name: 'Polski (źródłowy)',
    flag: '🇵🇱',
    markers: [/[ąćęłńóśźż]/gi, /\b(i|w|na|z|do|że|się|jest|są|nie|dla|lub|albo)\b/gi],
    stopWords: ['i', 'oraz', 'w', 'na', 'z', 'do', 'nie', 'tak', 'anuluj', 'zapisz', 'pomoc'],
  }
];

// Offline translation dictionary (phrases & vocabulary)
const OFFLINE_DICTIONARY: Record<string, string> = {
  // English UI & common phrases
  'hello': 'cześć',
  'hello world': 'witaj świecie',
  'welcome': 'witamy',
  'good morning': 'dzień dobry',
  'good evening': 'dobry wieczór',
  'good night': 'dobranoc',
  'thank you': 'dziękuję',
  'thanks': 'dzięki',
  'please': 'proszę',
  'yes': 'tak',
  'no': 'nie',
  'cancel': 'anuluj',
  'ok': 'ok',
  'save': 'zapisz',
  'delete': 'usuń',
  'edit': 'edytuj',
  'copy': 'kopiuj',
  'paste': 'wklej',
  'cut': 'wytnij',
  'settings': 'ustawienia',
  'search': 'szukaj',
  'download': 'pobierz',
  'upload': 'prześlij',
  'select all': 'zaznacz wszystko',
  'file': 'plik',
  'open': 'otwórz',
  'close': 'zamknij',
  'help': 'pomoc',
  'error': 'błąd',
  'warning': 'ostrzeżenie',
  'success': 'sukces',
  'loading': 'ładowanie...',
  'refresh': 'odśwież',
  'next': 'dalej',
  'back': 'wstecz',
  'finish': 'zakończ',
  'done': 'gotowe',
  'sign in': 'zaloguj się',
  'sign out': 'wyloguj się',
  'log in': 'zaloguj',
  'logout': 'wyloguj',
  'password': 'hasło',
  'username': 'nazwa użytkownika',
  'email': 'e-mail',
  'user': 'użytkownik',
  'invoice': 'faktura',
  'total': 'suma / razem',
  'amount': 'kwota',
  'price': 'cena',
  'date': 'data',
  'description': 'opis',
  'quantity': 'ilość',
  'subtotal': 'suma częściowa',
  'tax': 'podatek',
  'due date': 'termin płatności',
  'paid': 'opłacone',
  'status': 'status',
  'active': 'aktywny',
  'inactive': 'nieaktywny',
  'pending': 'oczekujący',
  'speech to text': 'mowa na tekst',
  'text to speech': 'tekst na mowę',
  'translate': 'przetłumacz',
  'quick access': 'szybki dostęp',
  'press shortcut': 'naciśnij skrót',
  'how are you': 'jak się masz?',
  'where is': 'gdzie jest',
  'what is this': 'co to jest?',
  'i need help': 'potrzebuję pomocy',
  'can you help me': 'czy możesz mi pomóc?',
  'i don\'t understand': 'nie rozumiem',
  'press any key': 'naciśnij dowolny klawisz',
  'click here': 'kliknij tutaj',
  'learn more': 'dowiedz się więcej',
  'view details': 'zobacz szczegóły',
  'share': 'udostępnij',
  'terms of service': 'regulamin usługi',
  'privacy policy': 'polityka prywatności',
  'contact us': 'skontaktuj się z nami',

  // German
  'hallo': 'cześć',
  'guten morgen': 'dzień dobry',
  'guten tag': 'dzień dobry',
  'gute nacht': 'dobranoc',
  'danke': 'dziękuję',
  'bitte': 'proszę',
  'ja': 'tak',
  'nein': 'nie',
  'abbrechen': 'anuluj',
  'speichern': 'zapisz',
  'löschen': 'usuń',
  'bearbeiten': 'edytuj',
  'einstellungen': 'ustawienia',
  'suche': 'szukaj',
  'rechnung': 'faktura',
  'gesamt': 'suma',
  'betrag': 'kwota',
  'datum': 'data',

  // French
  'bonjour': 'dzień dobry / cześć',
  'merci': 'dziękuję',
  's\'il vous plaît': 'proszę',
  'oui': 'tak',
  'non': 'nie',
  'annuler': 'anuluj',
  'enregistrer': 'zapisz',
  'supprimer': 'usuń',
  'paramètres': 'ustawienia',
  'facture': 'faktura',

  // Spanish
  'hola': 'cześć',
  'buenos días': 'dzień dobry',
  'gracias': 'dziękuję',
  'por favor': 'proszę',
  'sí': 'tak',
  'cancelar': 'anuluj',
  'guardar': 'zapisz',
  'eliminar': 'usuń',
  'configuración': 'ustawienia',
  'factura': 'faktura',

  // Ukrainian
  'привіт': 'cześć',
  'доброго ранку': 'dzień dobry',
  'дякую': 'dziękuję',
  'будь ласка': 'proszę',
  'так': 'tak',
  'ні': 'nie',
  'скасувати': 'anuluj',
  'зберегти': 'zapisz',
  'видалити': 'usuń',
  'налаштування': 'ustawienia',
  'рахунок': 'faktura',
};

class TranslationService {
  /**
   * Automatically detect language of the given text
   */
  detectLanguage(text: string): { code: string; name: string; flag: string; confidence: number } {
    const clean = text.trim().toLowerCase();
    if (!clean) {
      return { code: 'auto', name: 'Wykrywanie...', flag: '🌐', confidence: 0 };
    }

    let highestScore = 0;
    let detected = LANGUAGE_PROFILES[0]; // fallback to English

    for (const profile of LANGUAGE_PROFILES) {
      let score = 0;
      for (const marker of profile.markers) {
        const matches = clean.match(marker);
        if (matches) score += matches.length * 3;
      }
      for (const sw of profile.stopWords) {
        const regex = new RegExp(`\\b${sw}\\b`, 'gi');
        const matches = clean.match(regex);
        if (matches) score += matches.length * 5;
      }
      if (score > highestScore) {
        highestScore = score;
        detected = profile;
      }
    }

    const confidence = Math.min(99, Math.max(30, highestScore * 10));
    return {
      code: detected.code,
      name: detected.name,
      flag: detected.flag,
      confidence,
    };
  }

  /**
   * Offline Local Polish Translator Engine
   */
  translateOffline(text: string, sourceLang = 'auto'): string {
    const trimmed = text.trim();
    if (!trimmed) return '';

    const lower = trimmed.toLowerCase();

    // 1. Direct dictionary match
    if (OFFLINE_DICTIONARY[lower]) {
      return this.matchCasing(trimmed, OFFLINE_DICTIONARY[lower]);
    }

    // 2. Tokenized word-by-word and phrase-by-phrase replacement with dictionary
    let result = trimmed;
    const sortedKeys = Object.keys(OFFLINE_DICTIONARY).sort((a, b) => b.length - a.length);

    for (const key of sortedKeys) {
      const regex = new RegExp(`\\b${this.escapeRegex(key)}\\b`, 'gi');
      if (regex.test(result)) {
        result = result.replace(regex, (match) => {
          return this.matchCasing(match, OFFLINE_DICTIONARY[key]);
        });
      }
    }

    return result;
  }

  /**
   * Smart Translate: Tries fast offline engine + online public free translator fallback
   */
  async translateToPolish(text: string, sourceLang = 'auto'): Promise<TranslationResult> {
    const detected = this.detectLanguage(text);
    const sourceCode = sourceLang === 'auto' ? detected.code : sourceLang;
    const trimmed = text.trim();

    if (!trimmed) {
      return {
        sourceText: '',
        translatedText: '',
        sourceLang: detected.name,
        targetLang: 'Polski',
        timestamp: Date.now(),
      };
    }

    // If text is already in Polish, return it directly
    if (sourceCode === 'pl' && detected.confidence > 70) {
      return {
        sourceText: trimmed,
        translatedText: trimmed,
        sourceLang: 'Polski',
        targetLang: 'Polski',
        confidence: 98,
        timestamp: Date.now(),
      };
    }

    // Try online free API if network is available (without requiring any user API key!)
    if (typeof navigator !== 'undefined' && navigator.onLine) {
      try {
        const langPair = sourceCode === 'auto' ? `autodetect|pl` : `${sourceCode}|pl`;
        const res = await fetch(
          `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
            trimmed.slice(0, 500)
          )}&langpair=${langPair}`
        );
        if (res.ok) {
          const data = await res.json();
          if (data?.responseData?.translatedText) {
            const apiResult = data.responseData.translatedText;
            // Clean up any html entities if returned
            const decoded = this.decodeHTMLEntities(apiResult);
            return {
              sourceText: trimmed,
              translatedText: decoded,
              sourceLang: detected.name,
              targetLang: 'Polski',
              confidence: Math.round((data.responseData.match || 0.85) * 100),
              timestamp: Date.now(),
            };
          }
        }
      } catch {
        // Fallback gracefully to offline engine
      }
    }

    // Offline translation
    const offlineResult = this.translateOffline(trimmed, sourceCode);
    return {
      sourceText: trimmed,
      translatedText: offlineResult,
      sourceLang: detected.name,
      targetLang: 'Polski',
      confidence: detected.confidence,
      timestamp: Date.now(),
    };
  }

  private matchCasing(source: string, target: string): string {
    if (!source || !target) return target;
    if (source === source.toUpperCase() && source.length > 1) {
      return target.toUpperCase();
    }
    if (source[0] === source[0].toUpperCase()) {
      return target.charAt(0).toUpperCase() + target.slice(1);
    }
    return target;
  }

  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  private decodeHTMLEntities(text: string): string {
    const entities: Record<string, string> = {
      '&quot;': '"',
      '&apos;': "'",
      '&amp;': '&',
      '&lt;': '<',
      '&gt;': '>',
      '&#39;': "'",
    };
    return text.replace(/&quot;|&apos;|&amp;|&lt;|&gt;|&#39;/g, (match) => entities[match] || match);
  }
}

export const translationService = new TranslationService();
