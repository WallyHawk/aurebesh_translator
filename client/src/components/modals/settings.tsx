import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { useTheme } from '@/components/theme-provider';
import { audioManager } from '@/lib/audio';

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const { theme, fontSize, setTheme, setFontSize, applyTheme } = useTheme();

  const themes = [
    { id: "Rebel", name: "Rebel Alliance", color: "hsl(15, 75%, 58%)" },
    { id: "Imperial", name: "Galactic Empire", color: "hsl(0, 50%, 40%)" },
    { id: "Light Side", name: "Light Side", color: "hsl(205, 100%, 75%)" },
    { id: "Dark Side", name: "Dark Side", color: "hsl(0, 100%, 50%)" },
    { id: "Bounty Hunter", name: "Bounty Hunter", color: "hsl(80, 20%, 50%)" },
  ] as const;

  const handleApply = () => {
    applyTheme();
    onOpenChange(false);
  };

  const handleReset = () => {
    setTheme("Rebel");
    setFontSize(20);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card text-card-foreground border-border max-w-md">
        <DialogHeader>
          <DialogTitle className="text-card-foreground">Settings</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Theme Selection */}
          <div>
            <Label className="block text-sm font-medium mb-3 text-muted-foreground">
              Theme
            </Label>
            <div className="grid grid-cols-1 gap-2">
              {themes.map((themeOption) => (
                <Button
                  key={themeOption.id}
                  variant="ghost"
                  className={`p-3 justify-start border-2 ${
                    theme === themeOption.id 
                      ? 'border-primary bg-accent' 
                      : 'border-border hover:border-primary'
                  }`}
                  onClick={() => {
                    setTheme(themeOption.id as any);
                    audioManager.play('whoosh');
                  }}
                  data-testid={`theme-option-${themeOption.id.toLowerCase().replace(' ', '-')}`}
                >
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: themeOption.color }}
                    />
                    <span>{themeOption.name}</span>
                  </div>
                </Button>
              ))}
            </div>
          </div>

          {/* Font Size */}
          <div>
            <Label className="block text-sm font-medium mb-2 text-muted-foreground">
              Font Size: {fontSize}px
            </Label>
            <Slider
              value={[fontSize]}
              onValueChange={([value]) => setFontSize(value)}
              min={16}
              max={32}
              step={1}
              className="w-full"
              data-testid="slider-font-size"
            />
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-4">
            <Button
              variant="ghost"
              onClick={handleReset}
              className="bg-accent text-accent-foreground hover:opacity-90"
              data-testid="button-reset-defaults"
            >
              Reset Defaults
            </Button>
            <Button
              onClick={handleApply}
              className="bg-primary text-primary-foreground hover:opacity-90"
              data-testid="button-apply-settings"
            >
              Apply
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
