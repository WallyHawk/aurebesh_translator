import { createContext, useContext, useEffect, useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import type { Settings } from '@shared/schema';

type Theme = "Rebel" | "Imperial" | "Light Side" | "Dark Side" | "Bounty Hunter";

interface ThemeContextType {
  theme: Theme;
  fontSize: number;
  setTheme: (theme: Theme) => void;
  setFontSize: (size: number) => void;
  applyTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("Rebel");
  const [fontSize, setFontSizeState] = useState(20);

  const { data: settings } = useQuery<Settings>({
    queryKey: ['/api/settings'],
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (updates: Partial<Settings>) => {
      const response = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
    },
  });

  useEffect(() => {
    if (settings) {
      setThemeState(settings.theme);
      setFontSizeState(settings.fontSize);
      applyThemeToDOM(settings.theme);
    }
  }, [settings]);

  const applyThemeToDOM = (themeName: Theme) => {
    // Remove all theme classes
    document.body.classList.remove('theme-imperial', 'theme-light', 'theme-dark', 'theme-bounty');
    
    // Apply new theme class
    const themeMap = {
      "Rebel": '',
      "Imperial": 'theme-imperial',
      "Light Side": 'theme-light',
      "Dark Side": 'theme-dark',
      "Bounty Hunter": 'theme-bounty'
    };
    
    if (themeMap[themeName]) {
      document.body.classList.add(themeMap[themeName]);
    }
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    applyThemeToDOM(newTheme);
  };

  const setFontSize = (size: number) => {
    setFontSizeState(size);
  };

  const applyTheme = () => {
    updateSettingsMutation.mutate({
      theme,
      fontSize,
    });
  };

  return (
    <ThemeContext.Provider value={{
      theme,
      fontSize,
      setTheme,
      setFontSize,
      applyTheme,
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
