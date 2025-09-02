import { useState, useEffect } from 'react';

export interface LearningModeSettings {
  characterTooltips: boolean;
  ligatureTooltips: boolean;
  vocabularyTooltips: boolean;
  autoDetectWords: boolean;
  tooltipDelay: number;
}

const DEFAULT_SETTINGS: LearningModeSettings = {
  characterTooltips: true,
  ligatureTooltips: true,
  vocabularyTooltips: true,
  autoDetectWords: true,
  tooltipDelay: 300
};

export function useLearningMode() {
  const [settings, setSettings] = useState<LearningModeSettings>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('learning-mode-settings');
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    }
    return DEFAULT_SETTINGS;
  });

  const [isLearningModeEnabled, setIsLearningModeEnabled] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('learning-mode-enabled') === 'true';
    }
    return false;
  });

  useEffect(() => {
    localStorage.setItem('learning-mode-settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('learning-mode-enabled', isLearningModeEnabled.toString());
  }, [isLearningModeEnabled]);

  const updateSetting = <K extends keyof LearningModeSettings>(
    key: K,
    value: LearningModeSettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const toggleLearningMode = () => {
    setIsLearningModeEnabled(prev => !prev);
  };

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
  };

  return {
    settings,
    isLearningModeEnabled,
    updateSetting,
    toggleLearningMode,
    resetSettings
  };
}