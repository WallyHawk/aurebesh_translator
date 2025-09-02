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
  const [totalHintsUsed, setTotalHintsUsed] = useState(0);
  const [usedHintWords, setUsedHintWords] = useState<Set<string>>(new Set());
  const [flashingCell, setFlashingCell] = useState<[number, number] | null>(null);

  useEffect(() => {
    if (open) {
      initializeGame();
    }
  }, [open]);

  const initializeGame = () => {
    const tier2Words = TIERS[2] as string[];
    const shuffledWords = [...tier2Words].sort(() => Math.random() - 0.5);
    const words = shuffledWords.slice(0, 6); // Take random 6 words from tier 2
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

  const useHint = (word: string) => {
    if (!grid) return;
    
    if (totalHintsUsed >= 3 || usedHintWords.has(word)) return; // Max 3 total hints, 1 per word
    
    // Find the word position in the grid
    const wordPosition = grid.wordPositions.find((pos: any) => pos.word === word);
    if (!wordPosition) return;
    
    // Get the first letter position
    const firstLetterPos: [number, number] = [wordPosition.startX, wordPosition.startY];
    
    // Flash the first letter for 1 second
    setFlashingCell(firstLetterPos);
    setTimeout(() => setFlashingCell(null), 1000);
    
    // Update hints used
    setTotalHintsUsed(prev => prev + 1);
    setUsedHintWords(prev => new Set(Array.from(prev).concat([word])));
    audioManager.play('success');
  };

  if (!grid) {
    return null;
  }

  const isGameComplete = grid.foundWords.length === grid.wordsToFind.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-background border-border max-w-sm max-h-[80vh] game-overlay">
        <div className="h-full flex flex-col p-2">
          {/* Game Header */}
          <div className="flex justify-center items-center mb-3">
            <h2 className="text-lg font-bold text-card-foreground">Word Search</h2>
          </div>

          {/* Instructions */}
          <div className="bg-card p-2 rounded-lg mb-3 border border-border">
            <p className="text-xs text-muted-foreground text-center">
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
              <h3 className="text-xs font-medium text-muted-foreground">Find:</h3>
              <span className="text-xs text-muted-foreground">Hints: {3 - totalHintsUsed}/3</span>
            </div>
            <div className="grid grid-cols-3 gap-1 text-xs">
              {grid.wordsToFind.map((word) => (
                <div key={word} className="flex items-center justify-between">
                  <span
                    className={`text-xs truncate block ${
                      grid.foundWords.includes(word) 
                        ? 'text-green-500 line-through' 
                        : 'text-card-foreground'
                    }`}
                    data-testid={`word-target-${word.toLowerCase()}`}
                    title={word}
                  >
                    {word}
                  </span>
                  {!grid.foundWords.includes(word) && totalHintsUsed < 3 && !usedHintWords.has(word) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => useHint(word)}
                      className="h-4 w-4 px-0 text-xs shrink-0"
                      data-testid={`hint-${word.toLowerCase()}`}
                    >
                      💡
                    </Button>
                  )}
                </div>
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
