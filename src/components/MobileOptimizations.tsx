import React, { useEffect } from 'react';
import { useCapacitor } from '../hooks/useCapacitor';
import { useTheme } from '../contexts/ThemeContext';
import { Style } from '@capacitor/status-bar';

export const MobileOptimizations: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isNative, setStatusBarStyle } = useCapacitor();
  const { isDark } = useTheme();

  useEffect(() => {
    if (isNative) {
      // Update status bar based on theme
      setStatusBarStyle(isDark ? Style.Dark : Style.Light);
    }
  }, [isDark, isNative, setStatusBarStyle]);

  useEffect(() => {
    if (isNative) {
      // Prevent zoom on mobile
      const viewport = document.querySelector('meta[name=viewport]');
      if (viewport) {
        viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
      }

      // Add mobile-specific styles
      document.body.style.webkitTouchCallout = 'none';
      document.body.style.webkitUserSelect = 'none';
      document.body.style.userSelect = 'none';
    }
  }, [isNative]);

  return <>{children}</>;
};