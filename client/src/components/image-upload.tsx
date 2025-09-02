import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Camera, Upload, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ocrService } from '@/lib/ocr';

interface ImageUploadProps {
  onTextExtracted: (text: string) => void;
}

export function ImageUpload({ onTextExtracted }: ImageUploadProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const processImage = async (file: File) => {
    setIsProcessing(true);
    setProgress(0);

    try {
      // Initialize OCR service if needed
      await ocrService.initialize();
      
      // Simulate progress while processing
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 15, 85));
      }, 300);

      // Process the image with OCR
      const result = await ocrService.processImage(file);
      
      clearInterval(progressInterval);
      setProgress(100);

      if (result.translation && result.translation.trim()) {
        // Use the translation result
        onTextExtracted(result.translation);
        toast({ 
          title: "Text extracted successfully!", 
          description: `Confidence: ${Math.round(result.confidence)}%`
        });
      } else if (result.text && result.text.trim()) {
        // Fallback to raw OCR text if no translation
        onTextExtracted(result.text);
        toast({ 
          title: "Text extracted", 
          description: "Some characters may not have been recognized perfectly."
        });
      } else {
        toast({ 
          title: "No text found", 
          description: "Could not detect any text in the image. Try a clearer image with better lighting.",
          variant: "destructive" 
        });
      }
    } catch (error) {
      console.error('OCR Error:', error);
      toast({ 
        title: "Processing failed", 
        description: "Could not extract text from image. Please try again.",
        variant: "destructive" 
      });
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processImage(file);
    }
  };

  const handleCameraCapture = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processImage(file);
    }
  };

  return (
    <div className="bg-card rounded-lg p-4 border border-border">
      <h3 className="text-sm font-medium mb-3 text-muted-foreground">Image Translation</h3>
      
      {isProcessing ? (
        <div className="space-y-3">
          <p className="text-sm text-card-foreground">Processing image...</p>
          <Progress value={progress} className="w-full" />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="ghost"
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center justify-center p-4 bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground h-auto"
            data-testid="button-upload-image"
          >
            <Upload className="w-5 h-5 mb-1" />
            <span className="text-xs">Upload</span>
          </Button>
          <Button
            variant="ghost"
            onClick={() => cameraInputRef.current?.click()}
            className="flex flex-col items-center justify-center p-4 bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground h-auto"
            data-testid="button-camera"
          >
            <Camera className="w-5 h-5 mb-1" />
            <span className="text-xs">Camera</span>
          </Button>
        </div>
      )}

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
        data-testid="input-file-upload"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleCameraCapture}
        className="hidden"
        data-testid="input-camera-capture"
      />
    </div>
  );
}
