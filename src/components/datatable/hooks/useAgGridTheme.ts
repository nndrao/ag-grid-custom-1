import { useMemo, useEffect, useCallback } from 'react';
import { themeQuartz } from 'ag-grid-community';
import { useTheme } from '@/components/theme-provider';

// Function to set dark mode on document body for AG Grid
function setDarkMode(enabled: boolean) {
  document.body.dataset.agThemeMode = enabled ? "dark" : "light";
}

// Define default theme parameters for light and dark modes
const LIGHT_THEME_PARAMS = {
  accentColor: "#8AAAA7",
  backgroundColor: "#F7F7F7",
  borderColor: "#23202029",
  browserColorScheme: "light",
  buttonBorderRadius: 2,
  cellTextColor: "#000000",
  checkboxBorderRadius: 2,
  columnBorder: true,
  fontFamily: {
    googleFont: "Inter",
  },
  fontSize: 14,
  headerBackgroundColor: "#EFEFEFD6",
  headerFontFamily: {
    googleFont: "Inter",
  },
  headerFontSize: 14,
  headerFontWeight: 500,
  iconButtonBorderRadius: 1,
  iconSize: 12,
  inputBorderRadius: 2,
  oddRowBackgroundColor: "#EEF1F1E8",
  spacing: 6,
  wrapperBorderRadius: 2,
};

const DARK_THEME_PARAMS = {
  accentColor: "#8AAAA7",
  backgroundColor: "#1f2836",
  borderRadius: 2,
  checkboxBorderRadius: 2,
  columnBorder: true,
  fontFamily: {
    googleFont: "Inter",
  },
  browserColorScheme: "dark",
  chromeBackgroundColor: {
    ref: "foregroundColor",
    mix: 0.07,
    onto: "backgroundColor",
  },
  fontSize: 14,
  foregroundColor: "#FFF",
  headerFontFamily: {
    googleFont: "Inter",
  },
  headerFontSize: 14,
  iconSize: 12,
  inputBorderRadius: 2,
  oddRowBackgroundColor: "#2A2E35",
  spacing: 6,
  wrapperBorderRadius: 2,
};

export type ThemeParams = typeof LIGHT_THEME_PARAMS;

export function useAgGridTheme() {
  const { theme: currentTheme } = useTheme();
  const isDarkMode = currentTheme === 'dark';

  // Update AG Grid theme when app theme changes
  useEffect(() => {
    setDarkMode(isDarkMode);
  }, [isDarkMode]);

  // Create theme with parameters
  const agGridTheme = useMemo(() => {
    return themeQuartz
      .withParams(LIGHT_THEME_PARAMS, "light")
      .withParams(DARK_THEME_PARAMS, "dark");
  }, []);

  // Function to update theme parameters dynamically
  const updateThemeParams = useCallback((params: Partial<ThemeParams>, mode: 'light' | 'dark' | 'both' = 'both') => {
    // First create a copy of the base theme
    let updatedTheme = themeQuartz;
    
    // Apply light params if updating light or both
    if (mode === 'light' || mode === 'both') {
      const lightParams = {
        ...LIGHT_THEME_PARAMS,
        ...params,
      };
      updatedTheme = updatedTheme.withParams(lightParams, "light");
    } else {
      // Keep original light params
      updatedTheme = updatedTheme.withParams(LIGHT_THEME_PARAMS, "light");
    }
    
    // Apply dark params if updating dark or both
    if (mode === 'dark' || mode === 'both') {
      const darkParams = {
        ...DARK_THEME_PARAMS,
        ...params,
      };
      updatedTheme = updatedTheme.withParams(darkParams, "dark");
    } else {
      // Keep original dark params
      updatedTheme = updatedTheme.withParams(DARK_THEME_PARAMS, "dark");
    }
    
    return updatedTheme;
  }, []);

  return {
    theme: agGridTheme,
    isDarkMode,
    updateThemeParams,
    lightThemeParams: LIGHT_THEME_PARAMS,
    darkThemeParams: DARK_THEME_PARAMS
  };
} 