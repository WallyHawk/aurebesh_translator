import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Download, Smartphone, Share } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  // Detect if app is already installed
  const checkIfInstalled = () => {
    // Check for standalone mode (iOS/Android)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    // Check for iOS standalone
    const isIOSStandalone = (window.navigator as any).standalone === true;
    return isStandalone || isIOSStandalone;
  };

  // Detect iOS devices
  const isIOS = () => {
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
  };

  useEffect(() => {
    // Check if already installed
    const installed = checkIfInstalled();
    setIsInstalled(installed);

    // Listen for beforeinstallprompt event (Android/Chrome)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // For iOS, show install option if not already installed
    if (isIOS() && !installed) {
      setIsInstallable(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt && typeof deferredPrompt.prompt === 'function') {
      // Show Chrome/Android install prompt
      try {
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        
        if (outcome === 'accepted') {
          setIsInstalled(true);
          setIsInstallable(false);
        }
        
        setDeferredPrompt(null);
      } catch (error) {
        console.error('Install prompt failed:', error);
        setShowIOSInstructions(true);
      }
    } else if (isIOS()) {
      // Show iOS instructions
      setShowIOSInstructions(true);
    } else {
      // Show browser-specific help for non-iOS platforms
      alert('To install: Look for the install icon in your browser address bar, or go to Chrome menu → Install Aurebesh Translator');
    }
  };

  // Only show button if actually installable or on iOS
  if (isInstalled || (!isInstallable && !isIOS())) {
    return null;
  }
  
  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleInstallClick}
        className="w-12 h-12 bg-green-600 text-white hover:bg-green-700 animate-pulse"
        data-testid="button-install"
        title="Install Aurebesh Translator"
      >
        <Download className="h-5 w-5" />
      </Button>

      {/* iOS Installation Instructions Modal */}
      <Dialog open={showIOSInstructions} onOpenChange={setShowIOSInstructions}>
        <DialogContent className="bg-card text-card-foreground border-border max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Smartphone className="h-5 w-5" />
              <span>Install Aurebesh Translator</span>
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 text-sm">
            <p>To install this app on your iPhone/iPad:</p>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                  1
                </div>
                <div>
                  <div className="font-medium">Tap the Share button</div>
                  <div className="text-muted-foreground flex items-center">
                    <Share className="h-4 w-4 mr-1" />
                    <span>At the bottom of Safari</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                  2
                </div>
                <div>
                  <div className="font-medium">Select "Add to Home Screen"</div>
                  <div className="text-muted-foreground">Scroll down if needed</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                  3
                </div>
                <div>
                  <div className="font-medium">Tap "Add"</div>
                  <div className="text-muted-foreground">The app icon will appear on your home screen</div>
                </div>
              </div>
            </div>
            
            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <p className="text-green-800 dark:text-green-200 text-xs">
                <strong>Note:</strong> Once installed, the app works offline and opens like a native app!
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
