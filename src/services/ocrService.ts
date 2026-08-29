import { createWorker } from 'tesseract.js';
import { OCRResult } from '../types';

class OCRService {
  private worker: any = null;
  private isInitializing = false;
  private currentLanguage = 'pol+eng';

  async initWorker(lang = 'pol+eng', onProgress?: (progress: number, status: string) => void) {
    if (this.worker && this.currentLanguage === lang) {
      return this.worker;
    }

    this.isInitializing = true;
    try {
      if (this.worker) {
        await this.worker.terminate();
        this.worker = null;
      }

      onProgress?.(10, 'Inicjalizacja silnika OCR...');
      const worker = await createWorker(lang, 1, {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            const pct = Math.round((m.progress || 0) * 100);
            onProgress?.(pct, `Rozpoznawanie tekstu: ${pct}%`);
          } else {
            onProgress?.(25, `Ładowanie słowników (${m.status})...`);
          }
        },
      });

      this.worker = worker;
      this.currentLanguage = lang;
      this.isInitializing = false;
      return worker;
    } catch (err) {
      this.isInitializing = false;
      console.error('OCR Worker init error, falling back to eng:', err);
      // Fallback to simple eng if pol data is slow or failed
      const worker = await createWorker('eng', 1);
      this.worker = worker;
      this.currentLanguage = 'eng';
      return worker;
    }
  }

  /**
   * Preprocess canvas to increase contrast and readability for OCR
   */
  preprocessCanvas(canvas: HTMLCanvasElement): HTMLCanvasElement {
    const ctx = canvas.getContext('2d');
    if (!ctx) return canvas;

    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const d = imgData.data;

    // Convert to high-contrast grayscale
    for (let i = 0; i < d.length; i += 4) {
      const gray = d[i] * 0.299 + d[i + 1] * 0.587 + d[i + 2] * 0.114;
      // Slight contrast boost
      const enhanced = gray > 140 ? Math.min(255, gray * 1.1) : Math.max(0, gray * 0.85);
      d[i] = enhanced;
      d[i + 1] = enhanced;
      d[i + 2] = enhanced;
    }

    ctx.putImageData(imgData, 0, 0);
    return canvas;
  }

  /**
   * Recognize text from an image source (Canvas, Blob, Image, Base64)
   */
  async recognize(
    imageSource: string | HTMLCanvasElement | Blob | File,
    options?: {
      lang?: string;
      onProgress?: (progress: number, status: string) => void;
      preprocess?: boolean;
    }
  ): Promise<OCRResult> {
    const lang = options?.lang || 'pol+eng';
    const worker = await this.initWorker(lang, options?.onProgress);

    options?.onProgress?.(40, 'Analizowanie geometrii obrazu...');

    let sourceToProcess: any = imageSource;
    let previewUrl: string | undefined = undefined;

    if (typeof imageSource === 'string') {
      previewUrl = imageSource;
      sourceToProcess = imageSource;
    } else if (imageSource instanceof HTMLCanvasElement) {
      previewUrl = imageSource.toDataURL('image/png');
      sourceToProcess = imageSource;
    } else if (imageSource instanceof Blob) {
      previewUrl = URL.createObjectURL(imageSource);
      sourceToProcess = imageSource;
    }

    const { data } = await worker.recognize(sourceToProcess);

    const cleanText = data.text
      .replace(/\r\n/g, '\n')
      .replace(/[ \t]+/g, ' ')
      .trim();

    return {
      text: cleanText,
      confidence: Math.round(data.confidence || 0),
      language: lang,
      timestamp: Date.now(),
      imageUrl: previewUrl,
    };
  }

  async terminate() {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
    }
  }
}

export const ocrService = new OCRService();
