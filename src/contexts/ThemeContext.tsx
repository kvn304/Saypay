import React, { createContext, useContext, useState, useEffect } from 'react';

export type ColorTheme = 'purple' | 'blue' | 'green' | 'pink' | 'orange';

interface ThemeContextType {
  isDark: boolean;
  colorTheme: ColorTheme;
  toggleTheme: () => void;
  setColorTheme: (theme: ColorTheme) => void;
  getThemeColors: () => {
    primary: string;
    primaryHover: string;
    primaryLight: string;
    primaryDark: string;
  };
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

const colorThemes = {
  purple: {
    primary: 'bg-purple-500',
    primaryHover: 'hover:bg-purple-600',
    primaryLight: 'bg-purple-100 dark:bg-purple-900/20',
    primaryDark: 'bg-purple-600',
    text: 'text-purple-600 dark:text-purple-400',
    gradient: 'from-purple-500 to-pink-500 dark:from-purple-600 dark:to-pink-600'
  },
  blue: {
    primary: 'bg-blue-500',
    primaryHover: 'hover:bg-blue-600',
    primaryLight: 'bg-blue-100 dark:bg-blue-900/20',
    primaryDark: 'bg-blue-600',
    text: 'text-blue-600 dark:text-blue-400',
    gradient: 'from-blue-500 to-indigo-500 dark:from-blue-600 dark:to-indigo-600'
  },
  green: {
    primary: 'bg-green-500',
    primaryHover: 'hover:bg-green-600',
    primaryLight: 'bg-green-100 dark:bg-green-900/20',
    primaryDark: 'bg-green-600',
    text: 'text-green-600 dark:text-green-400',
    gradient: 'from-green-500 to-emerald-500 dark:from-green-600 dark:to-emerald-600'
  },
  pink: {
    primary: 'bg-pink-500',
    primaryHover: 'hover:bg-pink-600',
    primaryLight: 'bg-pink-100 dark:bg-pink-900/20',
    primaryDark: 'bg-pink-600',
    text: 'text-pink-600 dark:text-pink-400',
    gradient: 'from-pink-500 to-rose-500 dark:from-pink-600 dark:to-rose-600'
  },
  orange: {
    primary: 'bg-orange-500',
    primaryHover: 'hover:bg-orange-600',
    primaryLight: 'bg-orange-100 dark:bg-orange-900/20',
    primaryDark: 'bg-orange-600',
    text: 'text-orange-600 dark:text-orange-400',
    gradient: 'from-orange-500 to-amber-500 dark:from-orange-600 dark:to-amber-600'
  }
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) {
        return savedTheme === 'dark';
      }
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  const [colorTheme, setColorThemeState] = useState<ColorTheme>(() => {
    if (typeof window !== 'undefined') {
      const savedColorTheme = localStorage.getItem('color-theme') as ColorTheme;
      return savedColorTheme || 'purple';
    }
    return 'purple';
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  useEffect(() => {
    localStorage.setItem('color-theme', colorTheme);
    // Add color theme class to document
    document.documentElement.setAttribute('data-theme', colorTheme);
  }, [colorTheme]);

  const toggleTheme = () => {
    setIsDark(prev => !prev);
  };

  const setColorTheme = (theme: ColorTheme) => {
    setColorThemeState(theme);
  };

  const getThemeColors = () => {
    const theme = colorThemes[colorTheme];
    return {
      primary: theme.primary,
      primaryHover: theme.primaryHover,
      primaryLight: theme.primaryLight,
      primaryDark: theme.primaryDark,
    };
  };

  return (
    <ThemeContext.Provider value={{ 
      isDark, 
      colorTheme, 
      toggleTheme, 
      setColorTheme, 
      getThemeColors 
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export { colorThemes };