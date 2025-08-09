import { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

export const useCapacitor = () => {
  const [isNative, setIsNative] = useState(false);

  useEffect(() => {
    const setupCapacitor = async () => {
      const native = Capacitor.isNativePlatform();
      setIsNative(native);

      if (native) {
        // Hide splash screen after app loads
        await SplashScreen.hide();

        // Set status bar style
        await StatusBar.setStyle({ style: Style.Dark });
      }
    };

    setupCapacitor();
  }, []);

  const hapticFeedback = async (style: ImpactStyle = ImpactStyle.Medium) => {
    if (isNative) {
      await Haptics.impact({ style });
    }
  };

  const setStatusBarStyle = async (style: Style) => {
    if (isNative) {
      await StatusBar.setStyle({ style });
    }
  };

  return {
    isNative,
    hapticFeedback,
    setStatusBarStyle
  };
};