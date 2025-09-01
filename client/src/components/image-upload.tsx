import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Camera, Upload, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
      const formData = new FormData();
      formData.append('image', file);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const response = await fetch('/api/ocr', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (!response.ok) {
        throw new Error('OCR processing failed');
      }

      const result = await response.json();
      
      if (result.text && result.text !== "OCR functionality not yet implemented") {
        onTextExtracted(result.text);
        toast({ title: "Text extracted successfully!" });
      } else {
        toast({ 
          title: "OCR Feature Coming Soon", 
          description: "Image translation will be available in a future update.",
          variant: "destructive" 
        });
      }
    } catch (error) {
      console.error('OCR Error:', error);
      toast({ 
        title: "Processing failed", 
        description: "Could not extract text from image.",
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
