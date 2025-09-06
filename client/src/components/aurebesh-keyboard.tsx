import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ligatures, aurebeshCharacters } from '@/lib/aurebesh';
import { useState } from 'react';

interface AurebeshKeyboardProps {
  onKeyPress: (key: string) => void;
}

export function AurebeshKeyboard({ onKeyPress }: AurebeshKeyboardProps) {
  const [showAurebesh, setShowAurebesh] = useState(false);
  const numberRow = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
  const topRow = ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'];
  const middleRow = ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'];
  const bottomRow = ['Z', 'X', 'C', 'V', 'B', 'N', 'M'];
  const ligatureKeys = Object.keys(ligatures);
  
  const getCharacterDisplay = (letter: string) => {
    if (showAurebesh && aurebeshCharacters[letter as keyof typeof aurebeshCharacters]) {
      return aurebeshCharacters[letter as keyof typeof aurebeshCharacters];
    }
    return letter;
  };

  return (
    <div className="bg-card rounded-lg p-4 border border-border">
      <div className="flex items-center justify-end mb-3">
        <div className="flex items-center space-x-2">
          <Label htmlFor="aurebesh-toggle" className="text-xs text-muted-foreground">Latin</Label>
          <Switch 
            id="aurebesh-toggle"
            checked={showAurebesh} 
            onCheckedChange={setShowAurebesh}
            data-testid="keyboard-toggle"
          />
          <Label htmlFor="aurebesh-toggle" className="text-xs text-muted-foreground font-aurebesh">Aurebesh</Label>
        </div>
      </div>
      <div className="space-y-2">
        {/* Number Row */}
        <div className="grid grid-cols-10 gap-1">
          {numberRow.map(number => (
            <Button
              key={number}
              variant="ghost"
              className="virtual-keyboard-key"
              onClick={() => onKeyPress(number)}
              data-testid={`key-${number}`}
            >
              {number}
            </Button>
          ))}
        </div>
        
        {/* Letter Rows */}
        <div className="grid grid-cols-10 gap-1">
          {topRow.map(letter => (
            <Button
              key={letter}
              variant="ghost"
              className={`virtual-keyboard-key ${showAurebesh ? 'font-aurebesh' : ''}`}
              onClick={() => onKeyPress(letter)}
              data-testid={`key-${letter.toLowerCase()}`}
            >
              {getCharacterDisplay(letter)}
            </Button>
          ))}
        </div>
        <div className="grid grid-cols-9 gap-1 px-5">
          {middleRow.map(letter => (
            <Button
              key={letter}
              variant="ghost"
              className={`virtual-keyboard-key ${showAurebesh ? 'font-aurebesh' : ''}`}
              onClick={() => onKeyPress(letter)}
              data-testid={`key-${letter.toLowerCase()}`}
            >
              {getCharacterDisplay(letter)}
            </Button>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1 px-10">
          {bottomRow.map(letter => (
            <Button
              key={letter}
              variant="ghost"
              className={`virtual-keyboard-key ${showAurebesh ? 'font-aurebesh' : ''}`}
              onClick={() => onKeyPress(letter)}
              data-testid={`key-${letter.toLowerCase()}`}
            >
              {getCharacterDisplay(letter)}
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
              className={`virtual-keyboard-key text-sm ${showAurebesh ? 'font-aurebesh' : ''}`}
              onClick={() => onKeyPress(showAurebesh ? ligatures[ligature as keyof typeof ligatures] : ligature.toUpperCase())}
              data-testid={`key-ligature-${ligature.toLowerCase()}`}
            >
              {showAurebesh ? ligatures[ligature as keyof typeof ligatures] : ligature.toUpperCase()}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
