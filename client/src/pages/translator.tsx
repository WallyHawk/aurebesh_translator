import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useAurebesh } from '@/hooks/use-aurebesh';
import { useAddHistoryEntry, useAddSavedPhrase } from '@/hooks/use-storage';
import { useTheme } from '@/components/theme-provider';
import { AurebeshKeyboard } from '@/components/aurebesh-keyboard';
import { SettingsModal } from '@/components/modals/settings';
import { HistoryModal } from '@/components/modals/history';
import { SavedModal } from '@/components/modals/saved';
import { GamesMenuModal } from '@/components/modals/games-menu';
import { AboutModal } from '@/components/modals/about';
import { FlashcardsGame } from '@/components/games/flashcards';
import { WordSearchGame } from '@/components/games/word-search';
import { audioManager } from '@/lib/audio';
import { Copy, Clipboard, Trash2, Star, History, Bookmark, Gamepad2, Settings, Dices } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function TranslatorPage() {
  const { englishText, aurebeshText, updateEnglish, updateAurebesh, clear } = useAurebesh();
  const { fontSize } = useTheme();
  const { toast } = useToast();
  const addHistoryEntry = useAddHistoryEntry();
  const addSavedPhrase = useAddSavedPhrase();

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [savedOpen, setSavedOpen] = useState(false);
  const [gamesOpen, setGamesOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [flashcardsOpen, setFlashcardsOpen] = useState(false);
  const [wordSearchOpen, setWordSearchOpen] = useState(false);

  // Auto-save to history when translation changes (prevent duplicates)
  const [lastSavedText, setLastSavedText] = useState('');
  useEffect(() => {
    if (englishText.trim() && aurebeshText.trim()) {
      const currentText = `${englishText.trim()}|${aurebeshText.trim()}`;
      if (currentText !== lastSavedText) {
        const timeoutId = setTimeout(() => {
          addHistoryEntry.mutate({
            english: englishText,
            aurebesh: aurebeshText,
            timestamp: new Date().toISOString(),
          });
          setLastSavedText(currentText);
        }, 2000);

        return () => clearTimeout(timeoutId);
      }
    }
  }, [englishText, aurebeshText, addHistoryEntry, lastSavedText]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(aurebeshText);
      audioManager.play('success');
      toast({ title: "Copied to clipboard!" });
    } catch (error) {
      toast({ title: "Failed to copy", variant: "destructive" });
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      updateEnglish(text);
      audioManager.play('success');
    } catch (error) {
      toast({ title: "Failed to paste", variant: "destructive" });
    }
  };

  const handleClear = () => {
    clear();
    audioManager.play('success');
  };

  const handleSave = async () => {
    if (englishText.trim() && aurebeshText.trim()) {
      try {
        await addSavedPhrase.mutateAsync({
          phrase: `${englishText.trim()} = ${aurebeshText.trim()}`,
          timestamp: new Date().toISOString()
        });
        audioManager.play('success');
        toast({ title: "Phrase saved successfully!" });
      } catch (error) {
        audioManager.play('error');
        toast({ title: "Failed to save phrase", variant: "destructive" });
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="flex justify-between items-center p-4 bg-card border-b border-border">
        <div className="flex items-center space-x-2">
          <h1 className="text-xl font-bold text-card-foreground">Aurebesh Translator</h1>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setGamesOpen(true)}
            className="w-12 h-12 bg-primary text-primary-foreground hover:bg-accent"
            data-testid="button-games"
          >
            <Gamepad2 className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSettingsOpen(true)}
            className="w-12 h-12 bg-primary text-primary-foreground hover:bg-accent"
            data-testid="button-settings"
          >
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Main Translation Interface */}
      <main className="flex-1 p-4 space-y-4">
        {/* English Input */}
        <div className="translation-panel">
          <Label className="block text-sm font-medium mb-2 text-muted-foreground">
            English Input
          </Label>
          <Textarea
            value={englishText}
            onChange={(e) => updateEnglish(e.target.value)}
            className="w-full bg-transparent text-card-foreground resize-none outline-none border-none focus:ring-0"
            placeholder="Type your English text here..."
            rows={3}
            style={{ fontSize: `${fontSize}px`, padding: '10px' }}
            data-testid="input-english"
          />
        </div>

        {/* Aurebesh Output */}
        <div className="translation-panel">
          <Label className="block text-sm font-medium mb-2 text-muted-foreground">
            Aurebesh Translation
          </Label>
          <Textarea
            value={aurebeshText}
            onChange={(e) => updateAurebesh(e.target.value)}
            className="w-full bg-transparent text-card-foreground resize-none outline-none border-none focus:ring-0 font-aurebesh"
            placeholder="Aurebesh translation appears here..."
            rows={3}
            style={{ fontSize: `${fontSize * 1.2}px`, padding: '10px' }}
            data-testid="input-aurebesh"
          />
        </div>


        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-3">
          <Button
            variant="ghost"
            onClick={handleCopy}
            className="flex flex-col items-center justify-center p-3 bg-card text-card-foreground hover:bg-accent hover:text-accent-foreground h-auto"
            data-testid="button-copy"
          >
            <Copy className="w-5 h-5 mb-1" />
            <span className="text-xs">Copy</span>
          </Button>
          <Button
            variant="ghost"
            onClick={handlePaste}
            className="flex flex-col items-center justify-center p-3 bg-card text-card-foreground hover:bg-accent hover:text-accent-foreground h-auto"
            data-testid="button-paste"
          >
            <Clipboard className="w-5 h-5 mb-1" />
            <span className="text-xs">Paste</span>
          </Button>
          <Button
            variant="ghost"
            onClick={handleClear}
            className="flex flex-col items-center justify-center p-3 bg-card text-card-foreground hover:bg-accent hover:text-accent-foreground h-auto"
            data-testid="button-clear"
          >
            <Trash2 className="w-5 h-5 mb-1" />
            <span className="text-xs">Clear</span>
          </Button>
          <Button
            variant="ghost"
            onClick={handleSave}
            className="flex flex-col items-center justify-center p-3 bg-card text-card-foreground hover:bg-accent hover:text-accent-foreground h-auto"
            data-testid="button-save"
          >
            <Star className="w-5 h-5 mb-1" />
            <span className="text-xs">Save</span>
          </Button>
          <Button
            variant="ghost"
            onClick={() => setHistoryOpen(true)}
            className="flex flex-col items-center justify-center p-3 bg-card text-card-foreground hover:bg-accent hover:text-accent-foreground h-auto"
            data-testid="button-history"
          >
            <History className="w-5 h-5 mb-1" />
            <span className="text-xs">History</span>
          </Button>
          <Button
            variant="ghost"
            onClick={() => setSavedOpen(true)}
            className="flex flex-col items-center justify-center p-3 bg-card text-card-foreground hover:bg-accent hover:text-accent-foreground h-auto"
            data-testid="button-saved"
          >
            <Bookmark className="w-5 h-5 mb-1" />
            <span className="text-xs">Saved</span>
          </Button>
        </div>

        {/* Virtual Aurebesh Keyboard */}
        <AurebeshKeyboard 
          onKeyPress={(key) => {
            if (key === 'SPACE') {
              updateAurebesh(aurebeshText + ' ');
            } else if (key === 'BACK') {
              updateAurebesh(aurebeshText.slice(0, -1));
            } else {
              updateAurebesh(aurebeshText + key);
            }
          }}
        />
      </main>

      {/* Modals */}
      <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
      <HistoryModal open={historyOpen} onOpenChange={setHistoryOpen} />
      <SavedModal 
        open={savedOpen} 
        onOpenChange={setSavedOpen}
        currentPhrase={englishText}
      />
      <GamesMenuModal 
        open={gamesOpen} 
        onOpenChange={setGamesOpen}
        onFlashcards={() => {
          setGamesOpen(false);
          setFlashcardsOpen(true);
        }}
        onWordSearch={() => {
          setGamesOpen(false);
          setWordSearchOpen(true);
        }}
      />
      <AboutModal open={aboutOpen} onOpenChange={setAboutOpen} />

      {/* Games */}
      <FlashcardsGame open={flashcardsOpen} onOpenChange={setFlashcardsOpen} />
      <WordSearchGame open={wordSearchOpen} onOpenChange={setWordSearchOpen} />
    </div>
  );
}
