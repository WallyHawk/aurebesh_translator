import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { generateWordSearch, checkWordFound, type WordSearchGrid } from '@/lib/word-search';
import { TIERS } from '@/lib/aurebesh';
import { audioManager } from '@/lib/audio';
import { X, RotateCcw } from 'lucide-react';

interface WordSearchGameProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WordSearchGame({ open, onOpenChange }: WordSearchGameProps) {
  const [grid, setGrid] = useState<WordSearchGrid | null>(null);
  const [selectedCells, setSelectedCells] = useState<Array<[number, number]>>([]);
  const [isSelecting, setIsSelecting] = useState(false);

  useEffect(() => {
    if (open) {
      initializeGame();
    }
  }, [open]);

  const initializeGame = () => {
    const words = (TIERS[2] as string[]).slice(0, 6); // Take first 6 words from tier 2
    const newGrid = generateWordSearch(words, 8);
    setGrid(newGrid);
    setSelectedCells([]);
    setIsSelecting(false);
  };

  const handleCellClick = (x: number, y: number) => {
    if (!grid) return;

    if (!isSelecting) {
      // Start selection
      setSelectedCells([[x, y]]);
      setIsSelecting(true);
    } else {
      // End selection
      const startPos = selectedCells[0];
      const endPos: [number, number] = [x, y];
      
      const foundWord = checkWordFound(grid, startPos, endPos);
      
      if (foundWord) {
        // Word found!
        audioManager.play('success');
        const newFoundWords = [...grid.foundWords, foundWord];
        setGrid({
          ...grid,
          foundWords: newFoundWords
        });
        
        // Mark cells as found
        markCellsAsFound(startPos, endPos);
      } else {
        audioManager.play('error');
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
    
    setGrid({ ...grid, cells: newCells });
  };

  const clearSelection = () => {
    setSelectedCells([]);
    setIsSelecting(false);
  };

  const restart = () => {
    initializeGame();
  };

  if (!grid) {
    return null;
  }

  const isGameComplete = grid.foundWords.length === grid.wordsToFind.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-background border-border max-w-md max-h-[90vh] game-overlay">
        <div className="h-full flex flex-col p-4">
          {/* Game Header */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-card-foreground">Word Search</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="w-8 h-8 bg-primary text-primary-foreground rounded-full"
              data-testid="button-close-word-search"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Instructions */}
          <div className="bg-card p-3 rounded-lg mb-4 border border-border">
            <p className="text-sm text-muted-foreground">
              Find the hidden English words in the Aurebesh grid. Tap the first and last letter of each word.
            </p>
          </div>

          {/* Word Search Grid */}
          <div className="flex-1 flex items-center justify-center mb-4">
            <div className="grid grid-cols-8 gap-1 p-4 bg-card rounded-lg border border-border">
              {grid.cells.flat().map((cell, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  className={`w-8 h-8 text-sm font-aurebesh border border-border rounded transition-colors ${
                    cell.isFound 
                      ? 'bg-green-500 text-white' 
                      : selectedCells.some(([x, y]) => x === cell.x && y === cell.y)
                      ? 'bg-accent text-accent-foreground'
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
          <div className="bg-card p-3 rounded-lg mb-4 border border-border">
            <h3 className="text-sm font-medium mb-2 text-muted-foreground">Find these words:</h3>
            <div className="grid grid-cols-3 gap-2 text-sm">
              {grid.wordsToFind.map((word) => (
                <span
                  key={word}
                  className={`${
                    grid.foundWords.includes(word) 
                      ? 'text-green-500 line-through' 
                      : 'text-card-foreground'
                  }`}
                  data-testid={`word-target-${word.toLowerCase()}`}
                >
                  {word}
                </span>
              ))}
            </div>
          </div>

          {isGameComplete ? (
            /* Game Complete */
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
            /* Game Controls */
            <Button
              variant="ghost"
              onClick={clearSelection}
              className="bg-accent text-accent-foreground hover:opacity-90 w-full"
              data-testid="button-clear-selection"
            >
              Clear Selection
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
