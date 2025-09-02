import { createWorker } from 'tesseract.js';
import { aurebeshToEnglish } from './aurebesh';

export interface OCRResult {
  text: string;
  confidence: number;
  translation?: string;
}

class OCRService {
  private worker: any = null;

  async initialize() {
    if (this.worker) return;
    
    this.worker = await createWorker();
    await this.worker.loadLanguage('eng');
    await this.worker.initialize('eng');
    
    // Configure for better Aurebesh recognition
    await this.worker.setParameters({
      tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz ',
      tessedit_pageseg_mode: '6', // Uniform block of text
    });
  }

  async processImage(imageFile: File): Promise<OCRResult> {
    if (!this.worker) {
      await this.initialize();
    }

    try {
      const { data } = await this.worker.recognize(imageFile);
      
      // Clean up the recognized text
      let recognizedText = data.text
        .replace(/[^A-Za-z\s]/g, '') // Remove non-letter characters
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim()
        .toUpperCase();

      // Try to translate if we detected text
      let translation = '';
      if (recognizedText) {
        // Since Tesseract might not perfectly recognize Aurebesh,
        // we'll try our best to translate what we got
        translation = aurebeshToEnglish(recognizedText);
      }

      return {
        text: recognizedText,
        confidence: data.confidence,
        translation: translation || recognizedText
      };
    } catch (error) {
      throw new Error(`OCR processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async terminate() {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
    }
  }
}

export const ocrService = new OCRService();