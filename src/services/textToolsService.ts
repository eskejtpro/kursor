/**
 * Text processing and assistive utilities (100% offline)
 */
export class TextToolsService {
  cleanWhitespace(text: string): string {
    return text.replace(/\s+/g, ' ').trim();
  }

  toUpperCase(text: string): string {
    return text.toUpperCase();
  }

  toLowerCase(text: string): string {
    return text.toLowerCase();
  }

  toTitleCase(text: string): string {
    return text.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase());
  }

  toSentenceCase(text: string): string {
    return text
      .toLowerCase()
      .replace(/(^\s*\w|[.!?]\s*\w)/g, (c) => c.toUpperCase());
  }

  removePolishDiacritics(text: string): string {
    const map: Record<string, string> = {
      'ą': 'a', 'ć': 'c', 'ę': 'e', 'ł': 'l', 'ń': 'n', 'ó': 'o', 'ś': 's', 'ź': 'z', 'ż': 'z',
      'Ą': 'A', 'Ć': 'C', 'Ę': 'E', 'Ł': 'L', 'Ń': 'N', 'Ó': 'O', 'Ś': 'S', 'Ź': 'Z', 'Ż': 'Z'
    };
    return text.replace(/[ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/g, (m) => map[m] || m);
  }

  extractData(text: string) {
    const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi;
    const urlRegex = /(https?:\/\/[^\s]+)/gi;
    const phoneRegex = /(\+?[0-9]{2,3}[ -]?)?([0-9]{3}[ -]?[0-9]{3}[ -]?[0-9]{3})/gi;
    const numberRegex = /\b\d+(?:[.,]\d+)?\b/g;

    const emails = Array.from(new Set(text.match(emailRegex) || []));
    const urls = Array.from(new Set(text.match(urlRegex) || []));
    const phones = Array.from(new Set(text.match(phoneRegex) || []));
    const numbers = Array.from(new Set(text.match(numberRegex) || []));

    return { emails, urls, phones, numbers };
  }

  getStats(text: string) {
    const characters = text.length;
    const charactersNoSpaces = text.replace(/\s/g, '').length;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const lines = text.trim() ? text.split(/\r\n|\r|\n/).length : 0;
    const readingTimeSec = Math.ceil(words / 3.3); // ~200 words/min

    return {
      characters,
      charactersNoSpaces,
      words,
      lines,
      readingTimeSec,
    };
  }
}

export const textToolsService = new TextToolsService();
