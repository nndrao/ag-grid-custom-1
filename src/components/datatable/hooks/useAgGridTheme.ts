import { useMemo, useEffect, useState } from 'react';
import { themeQuartz } from 'ag-grid-community';
import { useTheme } from '@/components/theme-provider';
import { 
  DEFAULT_FONT_FAMILY, 
  DEFAULT_FONT_SIZE, 
  DEFAULT_SPACING, 
  MIN_FONT_SIZE,
  SettingsController 
} from '@/services/settingsController';

// Function to set dark mode on document body for AG Grid
function setDarkMode(enabled: boolean) {
  document.body.dataset.agThemeMode = enabled ? "dark" : "light";
}

// Ensure font size is always a valid number and at least MIN_FONT_SIZE
function validateFontSize(fontSize: number | string | undefined | null): number {
  // Convert to number if it's a string (possibly with 'px')
  if (typeof fontSize === 'string') {
    fontSize = parseInt(fontSize.replace('px', ''), 10);
  }
  
  // Ensure it's a valid number
  if (typeof fontSize !== 'number' || isNaN(fontSize) || fontSize < MIN_FONT_SIZE) {
    return DEFAULT_FONT_SIZE;
  }
  
  return fontSize;
}

// Define base theme parameters for light and dark modes
const getBaseThemeParams = (
  fontFamily = DEFAULT_FONT_FAMILY, 
  fontSize = DEFAULT_FONT_SIZE, 
  spacing = DEFAULT_SPACING
) => {
  // Validate and ensure fontSize is a number
  const validatedFontSize = validateFontSize(fontSize);
  
  const baseThemeParams = {
    // Light theme params
    light: {
      accentColor: "#8AAAA7",
      backgroundColor: "#F7F7F7",
      borderColor: "#23202029",
      browserColorScheme: "light",
      buttonBorderRadius: 2,
      cellTextColor: "#000000",
      checkboxBorderRadius: 2,
      columnBorder: true,
      fontFamily,
      fontSize: validatedFontSize,
      headerBackgroundColor: "#EFEFEFD6",
      headerFontFamily: fontFamily,
      headerFontSize: validatedFontSize + 2, // Header is 2px larger
      headerFontWeight: 600,
      iconButtonBorderRadius: 1,
      iconSize: 12,
      inputBorderRadius: 2,
      oddRowBackgroundColor: "#EEF1F1E8",
      spacing,
      wrapperBorderRadius: 2,
    },
    // Dark theme params
    dark: {
      accentColor: "#8AAAA7",
      backgroundColor: "#1f2836",
      borderRadius: 2,
      checkboxBorderRadius: 2,
      columnBorder: true,
      fontFamily,
      browserColorScheme: "dark",
      chromeBackgroundColor: {
        ref: "foregroundColor",
        mix: 0.07,
        onto: "backgroundColor",
      },
      fontSize: validatedFontSize,
      foregroundColor: "#FFF",
      headerFontFamily: fontFamily,
      headerFontSize: validatedFontSize + 2, // Header is 2px larger
      headerFontWeight: 600,
      iconSize: 12,
      inputBorderRadius: 2,
      oddRowBackgroundColor: "#2A2E35",
      spacing,
      wrapperBorderRadius: 2,
    }
  };

  return baseThemeParams;
};

export type ThemeParams = ReturnType<typeof getBaseThemeParams>['light'];

export function useAgGridTheme(settingsController?: SettingsController | null) {
  const { theme: currentTheme } = useTheme();
  const isDarkMode = currentTheme === 'dark';
  const [themeParams, setThemeParams] = useState(getBaseThemeParams());

  // Update AG Grid theme when app theme changes
  useEffect(() => {
    setDarkMode(isDarkMode);
  }, [isDarkMode]);

  // Update theme parameters when toolbar settings change
  useEffect(() => {
    if (!settingsController) return;
    
    // Initial setup
    const updateThemeFromSettings = () => {
      const settings = settingsController.getCurrentToolbarSettings();
      const fontFamily = settings.fontFamily || DEFAULT_FONT_FAMILY;
      const fontSize = validateFontSize(settings.fontSize) || DEFAULT_FONT_SIZE;
      const spacing = settings.spacing || DEFAULT_SPACING;
      
      setThemeParams(getBaseThemeParams(fontFamily, fontSize, spacing));
    };
    
    // Update theme now
    updateThemeFromSettings();
    
    // Subscribe to future changes
    const unsubscribe = settingsController.onToolbarSettingsChange(() => {
      updateThemeFromSettings();
    });
    
    return unsubscribe;
  }, [settingsController]);

  // Create theme with parameters
  const agGridTheme = useMemo(() => {
    return themeQuartz
      .withParams(themeParams.light, "light")
      .withParams(themeParams.dark, "dark");
  }, [themeParams]);

  return {
    theme: agGridTheme,
    isDarkMode
  };
} 