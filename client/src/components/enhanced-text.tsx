import { ReactElement } from 'react';
import { LearningTooltip } from '@/components/ui/learning-tooltip';
import { useLearningMode } from '@/hooks/use-learning-mode';
import { vocabularyData, ligatureData } from '@/lib/language-data';

interface EnhancedTextProps {
  children: string;
  className?: string;
  isAurebesh?: boolean;
}

// Common Star Wars words that should have tooltips
const STAR_WARS_WORDS = Object.keys(vocabularyData);

// Common ligatures to detect
const LIGATURES = Object.keys(ligatureData);

export function EnhancedText({ children, className = "", isAurebesh = false }: EnhancedTextProps) {
  const { settings, isLearningModeEnabled } = useLearningMode();

  if (!isLearningModeEnabled) {
    return <span className={className}>{children}</span>;
  }

  const processText = (text: string): ReactElement[] => {
    const elements: ReactElement[] = [];
    let currentIndex = 0;

    // If it's Aurebesh text, add character tooltips
    if (isAurebesh && settings.characterTooltips) {
      return text.split('').map((char, index) => {
        if (/[A-Za-z]/.test(char)) {
          return (
            <LearningTooltip key={index} text={char.toUpperCase()} type="character">
              {char}
            </LearningTooltip>
          );
        }
        return <span key={index}>{char}</span>;
      });
    }

    // For English text, look for vocabulary words and ligatures
    const words = text.split(/(\s+|[^\w\s]+)/);
    
    return words.map((segment, index) => {
      const cleanWord = segment.toLowerCase().replace(/[^\w]/g, '');
      
      // Check for vocabulary words
      if (settings.vocabularyTooltips && STAR_WARS_WORDS.includes(cleanWord)) {
        return (
          <LearningTooltip key={index} text={cleanWord} type="vocabulary">
            {segment}
          </LearningTooltip>
        );
      }
      
      // Check for ligatures within the word
      if (settings.ligatureTooltips) {
        let processedSegment = segment;
        let hasLigature = false;
        
        for (const ligature of LIGATURES) {
          if (cleanWord.includes(ligature)) {
            hasLigature = true;
            break;
          }
        }
        
        if (hasLigature) {
          return (
            <LearningTooltip key={index} text={cleanWord} type="ligature">
              {segment}
            </LearningTooltip>
          );
        }
      }
      
      return <span key={index}>{segment}</span>;
    });
  };

  const processedElements = processText(children);

  return <span className={className}>{processedElements}</span>;
}