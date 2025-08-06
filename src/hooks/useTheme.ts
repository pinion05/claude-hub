import { useState, useEffect } from 'react';

export type Theme = 'light' | 'dark' | 'system';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>('system');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('dark');

  // Get initial theme from localStorage or default to system
  useEffect(() => {
    const storedTheme = localStorage.getItem('theme') as Theme | null;
    if (storedTheme && ['light', 'dark', 'system'].includes(storedTheme)) {
      setTheme(storedTheme);
    }
  }, []);

  // Update resolved theme based on theme setting
  useEffect(() => {
    const updateResolvedTheme = () => {
      let resolved: 'light' | 'dark';
      
      if (theme === 'system') {
        resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      } else {
        resolved = theme;
      }
      
      setResolvedTheme(resolved);
      
      // Update DOM
      document.documentElement.setAttribute('data-theme', resolved);
      
      // Update meta theme-color for mobile browsers
      const metaThemeColor = document.querySelector('meta[name="theme-color"]');
      if (metaThemeColor) {
        metaThemeColor.setAttribute(
          'content',
          resolved === 'dark' 
            ? getComputedStyle(document.documentElement).getPropertyValue('--color-background').trim() || '#0A0A0B'
            : getComputedStyle(document.documentElement).getPropertyValue('--color-background').trim() || '#FEFEFE'
        );
      }
    };

    updateResolvedTheme();

    // Listen for system theme changes
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => updateResolvedTheme();
      
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
    
    // Return empty cleanup for non-system themes
    return undefined;
  }, [theme]);

  // Save theme to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    const themes: Theme[] = ['light', 'dark', 'system'];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    const nextTheme = themes[nextIndex];
    if (nextTheme) {
      setTheme(nextTheme);
    }
  };

  const setThemeDirectly = (newTheme: Theme) => {
    setTheme(newTheme);
  };

  return {
    theme,
    resolvedTheme,
    toggleTheme,
    setTheme: setThemeDirectly,
    isDark: resolvedTheme === 'dark',
    isLight: resolvedTheme === 'light',
    isSystem: theme === 'system',
  };
}