import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ExternalLink, Coffee } from 'lucide-react';

interface AboutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AboutModal({ open, onOpenChange }: AboutModalProps) {
  const handleVisitChannel = () => {
    window.open('https://www.youtube.com/@imperialremnantpodcast', '_blank');
  };

  const handleBuyMeCoffee = () => {
    window.open('https://ko-fi.com/imperialremnant', '_blank');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card text-card-foreground border-border max-w-md max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>About</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 text-sm">
          <div>
            <h3 className="font-semibold mb-2">Imperial Remnant Podcast © 2025</h3>
            <p className="text-muted-foreground">All rights reserved.</p>
          </div>

          <div>
            <p className="text-muted-foreground">
              This app translates English to Aurebesh for personal use only. 
              No warranty is provided.
            </p>
          </div>

          <div>
            <p className="text-muted-foreground">
              Assets used in this app (fonts, icons, etc.) are either open source 
              or licensed for personal use only.
            </p>
          </div>

          <div>
            <p className="text-muted-foreground mb-3">
              For more content, visit our YouTube channel:
            </p>
            <div className="space-y-2">
              <Button
                variant="ghost"
                onClick={handleVisitChannel}
                className="bg-primary text-primary-foreground hover:bg-accent flex items-center space-x-2 w-full"
                data-testid="button-visit-channel"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Imperial Remnant Podcast</span>
              </Button>
              <Button
                variant="ghost"
                onClick={handleBuyMeCoffee}
                className="bg-orange-500 text-white hover:bg-orange-600 flex items-center space-x-2 w-full"
                data-testid="button-buy-me-coffee"
              >
                <Coffee className="w-4 h-4" />
                <span>Buy Me A Coffee</span>
              </Button>
            </div>
          </div>

          <div className="pt-4 border-t border-border space-y-2">
            <p className="text-xs text-muted-foreground">
              <strong>Legal Disclaimer:</strong> This is a fan-made application created for entertainment and educational purposes only. 
              It is not an official Star Wars product and is not affiliated with, endorsed by, or sponsored by Lucasfilm Ltd., 
              The Walt Disney Company, or any related entities.
            </p>
            <p className="text-xs text-muted-foreground">
              <strong>Trademarks:</strong> Star Wars, Aurebesh, and all related characters, names, marks, and logos are 
              trademarks of Lucasfilm Ltd. All rights reserved. This application is made available under fair use for 
              educational and entertainment purposes.
            </p>
            <p className="text-xs text-muted-foreground">
              <strong>Privacy:</strong> This app processes data locally in your browser. No personal information is 
              collected or transmitted to external servers.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
