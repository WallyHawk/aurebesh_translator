import { useState, useCallback } from 'react';
import { englishToAurebesh, aurebeshToEnglish } from '@/lib/aurebesh';

export function useAurebesh() {
  const [englishText, setEnglishText] = useState('');
  const [aurebeshText, setAurebeshText] = useState('');

  const updateEnglish = useCallback((text: string) => {
    setEnglishText(text);
    setAurebeshText(englishToAurebesh(text));
  }, []);

  const updateAurebesh = useCallback((text: string) => {
    setAurebeshText(text);
    setEnglishText(aurebeshToEnglish(text));
  }, []);

  const clear = useCallback(() => {
    setEnglishText('');
    setAurebeshText('');
  }, []);

  return {
    englishText,
    aurebeshText,
    updateEnglish,
    updateAurebesh,
    clear,
  };
}
