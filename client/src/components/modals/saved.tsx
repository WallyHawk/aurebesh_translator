import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSavedPhrases, useAddSavedPhrase, useDeleteSavedPhrase } from '@/hooks/use-storage';
import { Copy, Trash2, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SavedModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentPhrase?: string;
}

export function SavedModal({ open, onOpenChange, currentPhrase }: SavedModalProps) {
  const { data: savedPhrases = [], isLoading } = useSavedPhrases();
  const addSavedPhrase = useAddSavedPhrase();
  const deleteSavedPhrase = useDeleteSavedPhrase();
  const { toast } = useToast();

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({ title: "Copied to clipboard!" });
    } catch (error) {
      toast({ title: "Failed to copy", variant: "destructive" });
    }
  };

  const handleSave = () => {
    if (currentPhrase?.trim()) {
      const isAlreadySaved = savedPhrases.some(p => p.phrase === currentPhrase.trim());
      if (isAlreadySaved) {
        toast({ title: "Phrase already saved!" });
        return;
      }

      addSavedPhrase.mutate({
        phrase: currentPhrase.trim(),
        timestamp: new Date().toISOString(),
      });
      toast({ title: "Phrase saved!" });
    }
  };

  const deletePhrase = (id: string) => {
    deleteSavedPhrase.mutate(id);
  };

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="bg-card text-card-foreground border-border max-w-md">
          <DialogHeader>
            <DialogTitle>Saved Phrases</DialogTitle>
          </DialogHeader>
          <div className="p-4 text-center text-muted-foreground">Loading...</div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card text-card-foreground border-border max-w-md max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Saved Phrases
            {currentPhrase?.trim() && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSave}
                className="h-8 w-8"
                data-testid="button-save-current"
              >
                <Plus className="h-4 w-4" />
              </Button>
            )}
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="h-[400px] w-full">
          {savedPhrases.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              No saved phrases yet
            </div>
          ) : (
            <div className="space-y-2 p-2">
              {savedPhrases.map((phrase, index) => (
                <div
                  key={phrase.id}
                  className={`p-3 rounded-lg border border-border ${
                    index % 2 === 0 ? 'bg-card' : 'bg-muted'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-card-foreground">
                        {phrase.phrase}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(phrase.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex space-x-2 ml-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleCopy(phrase.phrase)}
                        className="h-8 w-8"
                        data-testid={`button-copy-saved-${index}`}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deletePhrase(phrase.id)}
                        className="h-8 w-8 text-destructive"
                        data-testid={`button-delete-saved-${index}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
