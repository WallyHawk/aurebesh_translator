import { ReactNode } from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { characterData, ligatureData, vocabularyData, type CharacterInfo, type LigatureInfo, type VocabularyInfo } from '@/lib/language-data';

interface LearningTooltipProps {
  children: ReactNode;
  text: string;
  type: 'character' | 'ligature' | 'vocabulary' | 'custom';
  customContent?: {
    title: string;
    description: string;
    examples?: string[];
    pronunciation?: string;
  };
  className?: string;
}

export function LearningTooltip({ 
  children, 
  text, 
  type, 
  customContent,
  className = ""
}: LearningTooltipProps) {
  const renderCharacterTooltip = (info: CharacterInfo) => (
    <div className="space-y-2 max-w-sm">
      <div className="flex items-center space-x-2">
        <span className="text-lg font-aurebesh">{info.aurebesh}</span>
        <div>
          <div className="font-semibold">{info.character}</div>
          <div className="text-xs text-muted-foreground">/{info.pronunciation}/</div>
        </div>
      </div>
      <p className="text-sm">{info.description}</p>
      {info.examples.length > 0 && (
        <div>
          <div className="text-xs font-medium text-muted-foreground mb-1">Examples:</div>
          <div className="text-xs space-y-1">
            {info.examples.slice(0, 2).map((example, idx) => (
              <div key={idx} className="text-muted-foreground">• {example}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderLigatureTooltip = (info: LigatureInfo) => (
    <div className="space-y-2 max-w-sm">
      <div className="flex items-center space-x-2">
        <span className="text-lg font-aurebesh">{info.aurebesh}</span>
        <div>
          <div className="font-semibold">{info.ligature.toUpperCase()}</div>
          <div className="text-xs text-muted-foreground">/{info.pronunciation}/</div>
        </div>
      </div>
      <p className="text-sm">{info.description}</p>
      <p className="text-xs text-muted-foreground">{info.usage}</p>
      {info.examples.length > 0 && (
        <div>
          <div className="text-xs font-medium text-muted-foreground mb-1">Examples:</div>
          <div className="text-xs space-y-1">
            {info.examples.slice(0, 3).map((example, idx) => (
              <div key={idx} className="text-muted-foreground">• {example}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderVocabularyTooltip = (info: VocabularyInfo) => (
    <div className="space-y-2 max-w-sm">
      <div>
        <div className="font-semibold">{info.word}</div>
        <div className="text-xs text-muted-foreground">/{info.pronunciation}/ • {info.category}</div>
      </div>
      <p className="text-sm">{info.definition}</p>
      <p className="text-xs text-muted-foreground italic">{info.context}</p>
      {info.examples.length > 0 && (
        <div>
          <div className="text-xs font-medium text-muted-foreground mb-1">Usage:</div>
          <div className="text-xs space-y-1">
            {info.examples.slice(0, 2).map((example, idx) => (
              <div key={idx} className="text-muted-foreground">• {example}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderCustomTooltip = (content: NonNullable<typeof customContent>) => (
    <div className="space-y-2 max-w-sm">
      <div>
        <div className="font-semibold">{content.title}</div>
        {content.pronunciation && (
          <div className="text-xs text-muted-foreground">/{content.pronunciation}/</div>
        )}
      </div>
      <p className="text-sm">{content.description}</p>
      {content.examples && content.examples.length > 0 && (
        <div>
          <div className="text-xs font-medium text-muted-foreground mb-1">Examples:</div>
          <div className="text-xs space-y-1">
            {content.examples.slice(0, 3).map((example, idx) => (
              <div key={idx} className="text-muted-foreground">• {example}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const getTooltipContent = () => {
    const key = text.toLowerCase();
    
    switch (type) {
      case 'character':
        const charInfo = characterData[text.toUpperCase()];
        return charInfo ? renderCharacterTooltip(charInfo) : null;
      
      case 'ligature':
        const ligInfo = ligatureData[key];
        return ligInfo ? renderLigatureTooltip(ligInfo) : null;
      
      case 'vocabulary':
        const vocabInfo = vocabularyData[key];
        return vocabInfo ? renderVocabularyTooltip(vocabInfo) : null;
      
      case 'custom':
        return customContent ? renderCustomTooltip(customContent) : null;
      
      default:
        return null;
    }
  };

  const tooltipContent = getTooltipContent();
  
  // If no tooltip content available, return children without tooltip
  if (!tooltipContent) {
    return <>{children}</>;
  }

  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild className={className}>
          <span className="cursor-help border-b border-dotted border-current hover:border-solid transition-colors">
            {children}
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" className="bg-card border-border text-card-foreground max-w-sm">
          {tooltipContent}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}