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
  // Initialize from localStorage if available, fallback to defaults
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('aurebesh-theme');
      return (saved as Theme) || "Rebel";
    }
    return "Rebel";
  });
  
  const [fontSize, setFontSizeState] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('aurebesh-fontSize');
      return saved ? parseInt(saved, 10) : 20;
    }
    return 20;
  });

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

  // Apply theme immediately from localStorage on mount
  useEffect(() => {
    applyThemeToDOM(theme);
  }, []);

  // Sync with server settings when they load
  useEffect(() => {
    if (settings) {
      // Only update if server settings differ from local
      if (settings.theme !== theme) {
        setThemeState(settings.theme);
        localStorage.setItem('aurebesh-theme', settings.theme);
        applyThemeToDOM(settings.theme);
      }
      if (settings.fontSize !== fontSize) {
        setFontSizeState(settings.fontSize);
        localStorage.setItem('aurebesh-fontSize', settings.fontSize.toString());
      }
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
    localStorage.setItem('aurebesh-theme', newTheme);
    applyThemeToDOM(newTheme);
  };

  const setFontSize = (size: number) => {
    setFontSizeState(size);
    localStorage.setItem('aurebesh-fontSize', size.toString());
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
