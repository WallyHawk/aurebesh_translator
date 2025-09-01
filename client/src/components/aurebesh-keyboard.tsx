import { Button } from '@/components/ui/button';
import { ligatures } from '@/lib/aurebesh';

interface AurebeshKeyboardProps {
  onKeyPress: (key: string) => void;
}

export function AurebeshKeyboard({ onKeyPress }: AurebeshKeyboardProps) {
  const topRow = ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'];
  const middleRow = ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'];
  const bottomRow = ['Z', 'X', 'C', 'V', 'B', 'N', 'M'];
  const ligatureKeys = Object.keys(ligatures).map(k => k.toUpperCase());

  return (
    <div className="bg-card rounded-lg p-4 border border-border">
      <h3 className="text-sm font-medium mb-3 text-muted-foreground">Aurebesh Keyboard</h3>
      <div className="space-y-2">
        {/* Letter Rows */}
        <div className="grid grid-cols-10 gap-1">
          {topRow.map(letter => (
            <Button
              key={letter}
              variant="ghost"
              className="virtual-keyboard-key"
              onClick={() => onKeyPress(letter)}
              data-testid={`key-${letter.toLowerCase()}`}
            >
              {letter}
            </Button>
          ))}
        </div>
        <div className="grid grid-cols-9 gap-1 px-5">
          {middleRow.map(letter => (
            <Button
              key={letter}
              variant="ghost"
              className="virtual-keyboard-key"
              onClick={() => onKeyPress(letter)}
              data-testid={`key-${letter.toLowerCase()}`}
            >
              {letter}
            </Button>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1 px-10">
          {bottomRow.map(letter => (
            <Button
              key={letter}
              variant="ghost"
              className="virtual-keyboard-key"
              onClick={() => onKeyPress(letter)}
              data-testid={`key-${letter.toLowerCase()}`}
            >
              {letter}
            </Button>
          ))}
        </div>
        
        {/* Function Keys */}
        <div className="grid grid-cols-3 gap-2">
          <Button
            variant="ghost"
            className="virtual-keyboard-key col-span-2"
            onClick={() => onKeyPress('SPACE')}
            data-testid="key-space"
          >
            Space
          </Button>
          <Button
            variant="ghost"
            className="virtual-keyboard-key"
            onClick={() => onKeyPress('BACK')}
            data-testid="key-backspace"
          >
            ⌫
          </Button>
        </div>
        
        {/* Ligature Keys */}
        <div className="grid grid-cols-4 gap-1">
          {ligatureKeys.map(ligature => (
            <Button
              key={ligature}
              variant="ghost"
              className="virtual-keyboard-key text-sm"
              onClick={() => onKeyPress(ligature)}
              data-testid={`key-ligature-${ligature.toLowerCase()}`}
            >
              {ligature}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
