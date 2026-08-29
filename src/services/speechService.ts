/**
 * Speech-To-Text and Text-To-Speech Service (100% Client-Side / Offline Web Speech API)
 */
export interface SpeechRecognitionListener {
  onResult: (text: string, isFinal: boolean) => void;
  onError: (error: string) => void;
  onEnd: () => void;
  onStart: () => void;
}

class SpeechService {
  private recognition: any = null;
  private isListening = false;
  private currentLanguage = 'pl-PL';

  constructor() {
    this.initRecognition();
  }

  private initRecognition() {
    if (typeof window === 'undefined') return;
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = this.currentLanguage;
      } catch (err) {
        console.warn('SpeechRecognition initialization error:', err);
      }
    }
  }

  isSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return !!(
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition
    );
  }

  startListening(
    listener: SpeechRecognitionListener,
    lang = 'pl-PL'
  ): boolean {
    this.currentLanguage = lang;
    if (!this.recognition) {
      this.initRecognition();
    }

    if (!this.recognition) {
      listener.onError(
        'Przeglądarka nie obsługuje SpeechRecognition. Użyj Chrome/Edge lub wypróbuj skrypt Pythona.'
      );
      return false;
    }

    try {
      this.recognition.lang = lang;
      this.recognition.onstart = () => {
        this.isListening = true;
        listener.onStart();
      };

      this.recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        const combined = finalTranscript || interimTranscript;
        const isFinal = Boolean(finalTranscript && !interimTranscript);
        listener.onResult(combined, isFinal);
      };

      this.recognition.onerror = (event: any) => {
        console.warn('Speech error:', event.error);
        if (event.error === 'not-allowed') {
          listener.onError('Brak dostępu do mikrofonu. Zezwól na mikrofon w przeglądarce.');
        } else if (event.error === 'no-speech') {
          // Normal timeout if user was silent
        } else {
          listener.onError(`Błąd rozpoznawania: ${event.error}`);
        }
      };

      this.recognition.onend = () => {
        this.isListening = false;
        listener.onEnd();
      };

      this.recognition.start();
      return true;
    } catch (err) {
      console.warn('Failed to start speech recognition:', err);
      listener.onError('Nie udało się uruchomić mikrofonu.');
      return false;
    }
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (err) {
        console.warn('Error stopping recognition', err);
      }
    }
    this.isListening = false;
  }

  getListeningState(): boolean {
    return this.isListening;
  }

  /**
   * Text-To-Speech (Synteza mowy w języku polskim / wybranym)
   */
  speak(text: string, lang = 'pl-PL', rate = 1.0, pitch = 1.0): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.speechSynthesis) {
        reject(new Error('Synteza mowy nie jest dostępna w tej przeglądarce.'));
        return;
      }

      window.speechSynthesis.cancel(); // Stop any ongoing speech

      if (!text.trim()) {
        resolve();
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = rate;
      utterance.pitch = pitch;

      // Find best available voice
      const voices = window.speechSynthesis.getVoices();
      const polishVoice = voices.find(
        (v) => v.lang.startsWith('pl') || v.lang.includes('Polish')
      );
      if (polishVoice && lang.startsWith('pl')) {
        utterance.voice = polishVoice;
      }

      utterance.onend = () => resolve();
      utterance.onerror = (e) => reject(e);

      window.speechSynthesis.speak(utterance);
    });
  }

  stopSpeaking() {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }

  isSpeaking(): boolean {
    if (typeof window === 'undefined' || !window.speechSynthesis) return false;
    return window.speechSynthesis.speaking;
  }
}

export const speechService = new SpeechService();
