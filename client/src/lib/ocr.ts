export interface OCRResult {
  text: string;
  confidence: number;
  translation?: string;
}

class OCRService {
  async processImage(imageFile: File): Promise<OCRResult> {
    try {
      // Create FormData to send the image to the server
      const formData = new FormData();
      formData.append('image', imageFile);

      // Send image to AI-powered OCR endpoint
      const response = await fetch('/api/ocr', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const result = await response.json();
      
      return {
        text: result.text || '',
        confidence: result.confidence || 0,
        translation: result.translation || result.text || ''
      };
      
    } catch (error) {
      throw new Error(`AI OCR processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // No longer needed with server-side processing
  async initialize() {
    // No-op for compatibility
  }

  async terminate() {
    // No-op for compatibility
  }
}

export const ocrService = new OCRService();