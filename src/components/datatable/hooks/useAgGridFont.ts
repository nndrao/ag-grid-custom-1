import { useCallback, useRef, useEffect } from 'react';
import { SettingsController } from '@/services/settingsController';

export function useAgGridFont(settingsController: SettingsController | null) {
  // Use a ref to store the current font to avoid re-renders
  const currentFontRef = useRef<string>('monospace');

  // Extremely simple font change handler - just set the CSS variable directly
  const handleFontChange = useCallback((font: string) => {
    // Set the font directly on document root
    document.documentElement.style.setProperty("--ag-font-family", font);
    
    // Update the ref
    currentFontRef.current = font;
    
    // Only update settings controller for persisting the font preference
    if (settingsController) {
      settingsController.updateToolbarSettings({ fontFamily: font });
    }
  }, [settingsController]);

  // Listen for settings changes from the settings controller
  useEffect(() => {
    if (!settingsController) return;

    const unsubscribe = settingsController.onToolbarSettingsChange((settings) => {
      if (settings.fontFamily) {
        // Apply font changes coming from settings updates (e.g. profile changes)
        document.documentElement.style.setProperty("--ag-font-family", settings.fontFamily);
        currentFontRef.current = settings.fontFamily;
      }
    });

    return () => {
      unsubscribe();
    };
  }, [settingsController]);

  return {
    currentFontRef,
    handleFontChange
  };
} 