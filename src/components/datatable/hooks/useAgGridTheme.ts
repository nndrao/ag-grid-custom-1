import { useMemo, useEffect } from 'react';
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
  fontFamily: "Courier New, mono",
  fontSize: 12,
  headerBackgroundColor: "#EFEFEFD6",
  headerFontFamily: "Courier New, mono",
  headerFontSize: 14,
  headerFontWeight: 600,
  iconButtonBorderRadius: 1,
  iconSize: 12,
  inputBorderRadius: 2,
  oddRowBackgroundColor: "#EEF1F1E8",
  spacing: 4,
  wrapperBorderRadius: 2,
};

const DARK_THEME_PARAMS = {
  accentColor: "#8AAAA7",
  backgroundColor: "#1f2836",
  borderRadius: 2,
  checkboxBorderRadius: 2,
  columnBorder: true,
  fontFamily: "Courier New, mono",
  browserColorScheme: "dark",
  chromeBackgroundColor: {
    ref: "foregroundColor",
    mix: 0.07,
    onto: "backgroundColor",
  },
  fontSize: 12,
  foregroundColor: "#FFF",
  headerFontFamily: "Courier New, mono",
  headerFontSize: 14,
  headerFontWeight: 600,
  iconSize: 12,
  inputBorderRadius: 2,
  oddRowBackgroundColor: "#2A2E35",
  spacing: 4,
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

  return {
    theme: agGridTheme,
    isDarkMode
  };
} 