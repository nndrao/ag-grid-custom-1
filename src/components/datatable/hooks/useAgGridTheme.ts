import { useMemo } from 'react';
import { themeQuartz } from 'ag-grid-community';
import { useTheme } from '@/components/theme-provider';
import { useEffect } from 'react';

// Function to set dark mode on document body for AG Grid
function setDarkMode(enabled: boolean) {
  document.body.dataset.agThemeMode = enabled ? "dark" : "light";
}

export function useAgGridTheme() {
  const { theme: currentTheme } = useTheme();
  const isDarkMode = currentTheme === 'dark';

  // Update AG Grid theme when app theme changes
  useEffect(() => {
    setDarkMode(isDarkMode);
  }, [isDarkMode]);

  // Create theme with base parameters but handle fonts separately via CSS
  const agGridTheme = useMemo(() => {
    const baseTheme = themeQuartz.withParams(
      {
        accentColor: "#8AAAA7",
        backgroundColor: "#F7F7F7",
        borderColor: "#23202029",
        browserColorScheme: "light",
        buttonBorderRadius: 2,
        cellTextColor: "#000000",
        checkboxBorderRadius: 2,
        columnBorder: true,
        // Don't include fontFamily in theme to avoid re-rendering
        fontSize: 14,
        headerBackgroundColor: "#EFEFEFD6",
        // Don't include headerFontFamily in theme to avoid re-rendering
        headerFontSize: 14,
        headerFontWeight: 500,
        iconButtonBorderRadius: 1,
        iconSize: 12,
        inputBorderRadius: 2,
        oddRowBackgroundColor: "#EEF1F1E8",
        spacing: 6,
        wrapperBorderRadius: 2,
      },
      "light"
    )
    .withParams(
      {
        accentColor: "#8AAAA7",
        backgroundColor: "#1f2836",
        borderRadius: 2,
        checkboxBorderRadius: 2,
        columnBorder: true,
        // Don't include fontFamily in theme to avoid re-rendering
        browserColorScheme: "dark",
        chromeBackgroundColor: {
          ref: "foregroundColor",
          mix: 0.07,
          onto: "backgroundColor",
        },
        fontSize: 14,
        foregroundColor: "#FFF",
        // Don't include headerFontFamily in theme to avoid re-rendering
        headerFontSize: 14,
        iconSize: 12,
        inputBorderRadius: 2,
        oddRowBackgroundColor: "#2A2E35",
        spacing: 6,
        wrapperBorderRadius: 2,
      },
      "dark"
    );

    return baseTheme;
  }, []); // No dependencies means theme won't regenerate when font changes

  return {
    theme: agGridTheme,
    isDarkMode
  };
} 