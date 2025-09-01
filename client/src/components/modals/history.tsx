import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useHistory, useUpdateHistoryEntry, useDeleteHistoryEntry } from '@/hooks/use-storage';
import { Copy, Star, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface HistoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function HistoryModal({ open, onOpenChange }: HistoryModalProps) {
  const { data: history = [], isLoading } = useHistory();
  const updateHistoryEntry = useUpdateHistoryEntry();
  const deleteHistoryEntry = useDeleteHistoryEntry();
  const { toast } = useToast();

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({ title: "Copied to clipboard!" });
    } catch (error) {
      toast({ title: "Failed to copy", variant: "destructive" });
    }
  };

  const toggleFavorite = (id: string, currentFavorite: boolean) => {
    updateHistoryEntry.mutate({
      id,
      updates: { favorite: !currentFavorite }
    });
  };

  const deleteEntry = (id: string) => {
    deleteHistoryEntry.mutate(id);
  };

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="bg-card text-card-foreground border-border max-w-md">
          <DialogHeader>
            <DialogTitle>Translation History</DialogTitle>
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
          <DialogTitle>Translation History</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="h-[400px] w-full">
          {history.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              No translation history yet
            </div>
          ) : (
            <div className="space-y-2 p-2">
              {history.map((entry, index) => (
                <div
                  key={entry.id}
                  className={`p-3 rounded-lg border border-border ${
                    index % 2 === 0 ? 'bg-card' : 'bg-muted'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-card-foreground truncate">
                        {entry.english}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(entry.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex space-x-2 ml-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleCopy(entry.english)}
                        className="h-8 w-8"
                        data-testid={`button-copy-history-${index}`}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleFavorite(entry.id, entry.favorite)}
                        className={`h-8 w-8 ${entry.favorite ? 'text-yellow-500' : 'text-muted-foreground'}`}
                        data-testid={`button-favorite-history-${index}`}
                      >
                        <Star className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteEntry(entry.id)}
                        className="h-8 w-8 text-destructive"
                        data-testid={`button-delete-history-${index}`}
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
