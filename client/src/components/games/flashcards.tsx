import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useGameProgress, useUpdateGameProgress } from '@/hooks/use-storage';
import { TIERS, englishToAurebesh } from '@/lib/aurebesh';
import { audioManager } from '@/lib/audio';
import { X, RotateCcw, ArrowRight } from 'lucide-react';

interface FlashcardsGameProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FlashcardsGame({ open, onOpenChange }: FlashcardsGameProps) {
  const { data: gameProgress } = useGameProgress();
  const updateGameProgress = useUpdateGameProgress();

  const [currentTier, setCurrentTier] = useState(1);
  const [currentCard, setCurrentCard] = useState(0);
  const [score, setScore] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [gameCards, setGameCards] = useState<string[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [currentOptions, setCurrentOptions] = useState<string[]>([]);

  useEffect(() => {
    if (open && gameProgress) {
      // Initialize game with tier 1 or highest unlocked tier
      const maxTier = Math.max(...gameProgress.unlockedTiers);
      setCurrentTier(maxTier);
      startNewGame(maxTier);
    }
  }, [open, gameProgress]);

  const startNewGame = (tier: number) => {
    const tierData = TIERS[tier as keyof typeof TIERS] || TIERS[1];
    const shuffled = [...tierData].sort(() => Math.random() - 0.5).slice(0, 25);
    setGameCards(shuffled);
    setCurrentCard(0);
    setScore(0);
    setShowAnswer(false);
    setSelectedAnswer(null);
    setCurrentOptions([]);
  };

  const generateAnswerOptions = (correctAnswer: string) => {
    const tierData = TIERS[currentTier as keyof typeof TIERS] || TIERS[1];
    const otherOptions = tierData.filter(item => item !== correctAnswer);
    const wrongAnswers = otherOptions.sort(() => Math.random() - 0.5).slice(0, 3);
    const allOptions = [correctAnswer, ...wrongAnswers].sort(() => Math.random() - 0.5);
    return allOptions;
  };

  // Generate options when card changes
  useEffect(() => {
    if (gameCards[currentCard]) {
      setCurrentOptions(generateAnswerOptions(gameCards[currentCard]));
    }
  }, [currentCard, gameCards]);

  const handleAnswer = (answer: string) => {
    setSelectedAnswer(answer);
    setShowAnswer(true);
    
    const correct = answer === gameCards[currentCard];
    if (correct) {
      setScore(score + 1);
      audioManager.play('success');
    } else {
      audioManager.play('error');
    }

    setTimeout(() => {
      if (currentCard < gameCards.length - 1) {
        setCurrentCard(currentCard + 1);
        setShowAnswer(false);
        setSelectedAnswer(null);
      } else {
        // Game finished
        const finalScore = correct ? score + 1 : score;
        const requiredScore = Math.ceil(gameCards.length * 0.65); // 65% correct needed
        if (finalScore >= requiredScore && gameProgress) {
          // Unlock next tier
          const newUnlockedTiers = [...gameProgress.unlockedTiers];
          if (!newUnlockedTiers.includes(currentTier + 1) && currentTier < 3) {
            newUnlockedTiers.push(currentTier + 1);
            updateGameProgress.mutate({ unlockedTiers: newUnlockedTiers });
          }
        }
      }
    }, 1500);
  };

  const nextTier = () => {
    if (gameProgress?.unlockedTiers.includes(currentTier + 1)) {
      const newTier = currentTier + 1;
      setCurrentTier(newTier);
      startNewGame(newTier);
    }
  };

  const restart = () => {
    startNewGame(currentTier);
  };

  if (!gameProgress || gameCards.length === 0) {
    return null;
  }

  const currentPrompt = gameCards[currentCard];
  const progress = ((currentCard + (showAnswer ? 1 : 0)) / gameCards.length) * 100;
  const isGameComplete = currentCard >= gameCards.length - 1 && showAnswer;

  const tierNames = {
    1: 'Letters & Ligatures',
    2: 'Star Wars Vocabulary',
    3: 'Famous Quotes'
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-background border-border max-w-md max-h-[90vh] game-overlay">
        <div className="h-full flex flex-col p-4">
          {/* Game Header */}
          <div className="flex justify-center items-center mb-4">
            <div className="text-card-foreground text-center">
              <div className="text-sm opacity-75">
                Tier {currentTier} - {tierNames[currentTier as keyof typeof tierNames]}
              </div>
              <div className="text-lg font-bold">Score: {score}/{gameCards.length}</div>
              <div className="text-sm opacity-75">
                Card {currentCard + 1}/{gameCards.length}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <Progress value={progress} className="w-full mb-6" />

          {/* Flashcard */}
          <div className="flashcard rounded-xl p-8 mb-6 flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl font-aurebesh mb-4 text-card-foreground" data-testid="text-flashcard-prompt">
                {currentPrompt ? englishToAurebesh(currentPrompt) : ''}
              </div>
              <div className="text-muted-foreground">What does this translate to?</div>
            </div>
          </div>

          {isGameComplete ? (
            /* Game Complete */
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-xl font-bold text-card-foreground mb-2">Game Complete!</h3>
                <p className="text-muted-foreground">Final Score: {score}/{gameCards.length}</p>
                {score >= 25 && currentTier < 3 && gameProgress.unlockedTiers.includes(currentTier + 1) && (
                  <p className="text-accent mt-2">Next tier unlocked!</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="ghost"
                  onClick={restart}
                  className="bg-accent text-accent-foreground hover:opacity-90 flex items-center space-x-2"
                  data-testid="button-restart-game"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Restart</span>
                </Button>
                <Button
                  onClick={nextTier}
                  disabled={!gameProgress.unlockedTiers.includes(currentTier + 1) || currentTier >= 3}
                  className="bg-primary text-primary-foreground hover:opacity-90 flex items-center space-x-2"
                  data-testid="button-next-tier"
                >
                  <ArrowRight className="w-4 h-4" />
                  <span>Next Tier</span>
                </Button>
              </div>
            </div>
          ) : (
            /* Answer Options */
            <>
              <div className="grid grid-cols-2 gap-3 mb-4">
                {currentOptions.map((option, index) => (
                  <Button
                    key={option}
                    variant="ghost"
                    onClick={() => handleAnswer(option)}
                    disabled={showAnswer}
                    className={`bg-card text-card-foreground p-4 rounded-lg border border-border hover:bg-accent hover:text-accent-foreground transition-colors ${
                      showAnswer && option === gameCards[currentCard] 
                        ? 'bg-green-500 text-white' 
                        : showAnswer && option === selectedAnswer && option !== gameCards[currentCard]
                        ? 'bg-red-500 text-white'
                        : ''
                    }`}
                    data-testid={`button-answer-${index}`}
                  >
                    {option}
                  </Button>
                ))}
              </div>

            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
