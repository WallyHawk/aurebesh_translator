import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { generateWordSearch, checkWordFound, type WordSearchGrid } from '@/lib/word-search';
import { TIERS } from '@/lib/aurebesh';
import { audioManager } from '@/lib/audio';
import { RotateCcw, Volume2, VolumeX } from 'lucide-react';

interface WordSearchGameProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WordSearchGame({ open, onOpenChange }: WordSearchGameProps) {
  const [grid, setGrid] = useState<WordSearchGrid | null>(null);
  const [selectedCells, setSelectedCells] = useState<Array<[number, number]>>([]);
  const [isSelecting, setIsSelecting] = useState(false);
  const [totalHintsUsed, setTotalHintsUsed] = useState(0);
  const [usedHintWords, setUsedHintWords] = useState<Set<string>>(new Set());
  const [flashingCell, setFlashingCell] = useState<[number, number] | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    if (open) {
      initializeGame();
    }
  }, [open]);

  const initializeGame = () => {
    const tier2Words = TIERS[2] as string[];
    const validWords = tier2Words.filter(word => word.length <= 8);
    const shuffledWords = [...validWords].sort(() => Math.random() - 0.5);
    const words = shuffledWords.slice(0, 6);
    const newGrid = generateWordSearch(words, 8);
    setGrid(newGrid);
    setSelectedCells([]);
    setIsSelecting(false);
    setTotalHintsUsed(0);
    setUsedHintWords(new Set());
    setFlashingCell(null);
  };

  const handleCellClick = (x: number, y: number) => {
    if (!grid) return;

    if (!isSelecting) {
      setSelectedCells([[x, y]]);
      setIsSelecting(true);
    } else {
      const startPos = selectedCells[0];
      const endPos: [number, number] = [x, y];
      
      const foundWord = checkWordFound(grid, startPos, endPos);
      
      if (foundWord) {
        if (soundEnabled) audioManager.play('success');
        const newFoundWords = [...grid.foundWords, foundWord];
        setGrid({ ...grid, foundWords: newFoundWords });
        markCellsAsFound(startPos, endPos);
      } else {
        if (soundEnabled) audioManager.play('error');
      }
      
      setSelectedCells([]);
      setIsSelecting(false);
    }
  };

  const markCellsAsFound = (startPos: [number, number], endPos: [number, number]) => {
    if (!grid) return;

    const [startX, startY] = startPos;
    const [endX, endY] = endPos;
    
    const dirX = endX === startX ? 0 : (endX > startX ? 1 : -1);
    const dirY = endY === startY ? 0 : (endY > startY ? 1 : -1);
    
    const newCells = grid.cells.map(row => [...row]);
    
    let x = startX;
    let y = startY;
    
    while (true) {
      if (x >= 0 && x < grid.size && y >= 0 && y < grid.size) {
        newCells[y][x] = { ...newCells[y][x], isFound: true };
      }
      if (x === endX && y === endY) break;
      x += dirX;
      y += dirY;
    }
    
    setGrid(currentGrid => ({ ...currentGrid!, cells: newCells }));
  };

  const clearSelection = () => {
    setSelectedCells([]);
    setIsSelecting(false);
  };

  const restart = () => {
    initializeGame();
  };

  const useHint = (word: string) => {
    if (!grid) return;
    if (totalHintsUsed >= 3 || usedHintWords.has(word)) return;
    
    const wordPosition = grid.wordPositions.find((pos: any) => pos.word === word);
    if (!wordPosition) return;
    
    const firstLetterPos: [number, number] = [wordPosition.startX, wordPosition.startY];
    setFlashingCell(firstLetterPos);
    setTimeout(() => setFlashingCell(null), 1000);
    
    setTotalHintsUsed(prev => prev + 1);
    setUsedHintWords(prev => new Set(Array.from(prev).concat([word])));
    if (soundEnabled) audioManager.play('success');
  };

  if (!grid) {
    return null;
  }

  const isGameComplete = grid.foundWords.length === grid.wordsToFind.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-background border-border max-w-sm max-h-[90vh] w-[95vw] sm:w-auto game-overlay">
        <div className="h-full flex flex-col p-3 overflow-hidden">
          {/* Game Header */}
          <div className="flex justify-between items-center mb-3">
            <div className="flex-1" />
            <h2 className="text-2xl font-bold text-foreground">Word Search</h2>
            <div className="flex-1 flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="p-2 text-foreground hover:text-foreground hover:bg-accent"
                data-testid="button-toggle-sound-wordsearch"
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-card p-2 rounded-lg mb-3 border border-border">
            <p className="text-base font-medium text-foreground text-center opacity-80">
              Find the hidden English words. Tap first and last letter.
            </p>
          </div>

          {/* Word Search Grid */}
          <div className="flex items-center justify-center mb-2">
            <div className="grid grid-cols-8 gap-px p-2 bg-card rounded-lg border border-border">
              {grid.cells.flat().map((cell, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  className={`w-7 h-7 text-xs font-aurebesh border border-border rounded transition-colors ${
                    cell.isFound 
                      ? 'bg-green-500 text-white' 
                      : selectedCells.some(([x, y]) => x === cell.x && y === cell.y)
                      ? 'bg-accent text-accent-foreground'
                      : flashingCell && flashingCell[0] === cell.x && flashingCell[1] === cell.y
                      ? 'bg-yellow-400 text-black animate-pulse'
                      : 'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  }`}
                  onClick={() => handleCellClick(cell.x, cell.y)}
                  data-testid={`grid-cell-${cell.x}-${cell.y}`}
                >
                  {cell.letter}
                </Button>
              ))}
            </div>
          </div>

          {/* Words to Find */}
          <div className="bg-card p-2 rounded-lg mb-2 border border-border">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-base font-semibold text-foreground">Find:</h3>
              <span className="text-sm font-medium text-foreground opacity-80">Hints: {3 - totalHintsUsed}/3</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 text-xs">
              {grid.wordsToFind.map((word) => (
                <div key={word} className="flex items-center">
                  {!grid.foundWords.includes(word) && totalHintsUsed < 3 && !usedHintWords.has(word) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => useHint(word)}
                      className="h-5 w-5 px-0 text-xs shrink-0 mr-1 min-w-5"
                      data-testid={`hint-${word.toLowerCase()}`}
                    >
                      💡
                    </Button>
                  )}
                  <span
                    className={`text-sm font-medium truncate block ${
                      grid.foundWords.includes(word) 
                        ? 'text-green-500 line-through' 
                        : 'text-foreground'
                    }`}
                    data-testid={`word-target-${word.toLowerCase()}`}
                    title={word}
                  >
                    {word}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {isGameComplete ? (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-xl font-bold text-card-foreground mb-2">Congratulations!</h3>
                <p className="text-muted-foreground">You found all the words!</p>
              </div>
              <Button
                onClick={restart}
                className="bg-primary text-primary-foreground hover:opacity-90 w-full flex items-center space-x-2"
                data-testid="button-restart-word-search"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Play Again</span>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="ghost"
                onClick={clearSelection}
                className="bg-accent text-accent-foreground hover:opacity-90"
                data-testid="button-clear-selection"
              >
                Clear
              </Button>
              <Button
                onClick={restart}
                className="bg-primary text-primary-foreground hover:opacity-90 flex items-center justify-center space-x-1"
                data-testid="button-new-game-word-search"
              >
                <RotateCcw className="w-3 h-3" />
                <span>New</span>
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
