import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';

interface AboutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AboutModal({ open, onOpenChange }: AboutModalProps) {
  const handleVisitChannel = () => {
    window.open('https://www.youtube.com/@imperialremnantpodcast', '_blank');
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
            <p className="text-muted-foreground mb-2">
              For more content, visit our YouTube channel:
            </p>
            <Button
              variant="ghost"
              onClick={handleVisitChannel}
              className="bg-primary text-primary-foreground hover:bg-accent flex items-center space-x-2"
              data-testid="button-visit-channel"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Imperial Remnant Podcast</span>
            </Button>
          </div>

          <div className="pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground">
              <strong>Disclaimer:</strong> This is a fan-made app created for entertainment purposes only. 
              It is not an official Star Wars product and is not affiliated with Lucasfilm, Disney, or any related entities.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
