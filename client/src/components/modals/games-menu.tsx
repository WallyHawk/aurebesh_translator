import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Brain, Search } from 'lucide-react';

interface GamesMenuModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFlashcards: () => void;
  onWordSearch: () => void;
}

export function GamesMenuModal({ open, onOpenChange, onFlashcards, onWordSearch }: GamesMenuModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card text-card-foreground border-border max-w-md">
        <DialogHeader>
          <DialogTitle>Training Games</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-3">
          <Button
            variant="ghost"
            className="w-full p-4 bg-primary text-primary-foreground hover:bg-accent flex items-center space-x-3 justify-start h-auto"
            onClick={onFlashcards}
            data-testid="button-flashcards"
          >
            <Brain className="w-6 h-6" />
            <div className="text-left">
              <div className="font-medium">Flashcards</div>
              <div className="text-sm opacity-90">Test your Aurebesh knowledge</div>
            </div>
          </Button>
          <Button
            variant="ghost"
            className="w-full p-4 bg-primary text-primary-foreground hover:bg-accent flex items-center space-x-3 justify-start h-auto"
            onClick={onWordSearch}
            data-testid="button-word-search"
          >
            <Search className="w-6 h-6" />
            <div className="text-left">
              <div className="font-medium">Word Search</div>
              <div className="text-sm opacity-90">Find hidden Star Wars terms</div>
            </div>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
