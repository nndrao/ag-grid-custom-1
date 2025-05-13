import { useCallback, useRef, useEffect } from 'react';
import { SettingsController } from '@/services/settingsController';
import { useAgGridTheme } from './useAgGridTheme';
import { GridApi } from 'ag-grid-community';

export function useAgGridFont(settingsController: SettingsController | null, gridApi: GridApi | null) {
  // Use a ref to store the current font to avoid re-renders
  const currentFontRef = useRef<string>('Inter');
  
  // Get theme helpers from the useAgGridTheme hook
  const { updateThemeParams } = useAgGridTheme();

  // Function to handle font changes
  const handleFontChange = useCallback((font: string) => {
    // Update the ref
    currentFontRef.current = font;
    
    // Only update settings controller for persisting the font preference
    if (settingsController) {
      settingsController.updateToolbarSettings({ fontFamily: font });
    }
    
    // Apply font to grid theme if grid is available
    if (gridApi) {
      // Create font family param for AG Grid theme
      const fontFamilyParam = {
        fontFamily: {
          googleFont: font
        },
        headerFontFamily: {
          googleFont: font
        }
      };
      
      // Update both light and dark mode with the new font
      const updatedTheme = updateThemeParams(fontFamilyParam, 'both');
      
      // Apply the updated theme to the grid
      gridApi.setGridOption('theme', updatedTheme);
    }
  }, [settingsController, gridApi, updateThemeParams]);

  // Listen for settings changes from the settings controller
  useEffect(() => {
    if (!settingsController) return;

    const unsubscribe = settingsController.onToolbarSettingsChange((settings) => {
      if (settings.fontFamily && settings.fontFamily !== currentFontRef.current) {
        // Update the ref when settings change
        currentFontRef.current = settings.fontFamily;
        
        // Apply to grid if available
        if (gridApi) {
          const fontFamilyParam = {
            fontFamily: {
              googleFont: settings.fontFamily
            },
            headerFontFamily: {
              googleFont: settings.fontFamily
            }
          };
          
          const updatedTheme = updateThemeParams(fontFamilyParam, 'both');
          gridApi.setGridOption('theme', updatedTheme);
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, [settingsController, gridApi, updateThemeParams]);

  return {
    currentFontRef,
    handleFontChange
  };
} 