import { useMemo, useEffect } from 'react';
import { themeQuartz } from 'ag-grid-community';
import { useTheme } from '@/components/theme-provider';

// Function to set dark mode on document body for AG Grid
function setDarkMode(enabled: boolean) {
  document.body.dataset.agThemeMode = enabled ? "dark" : "light";
}

// Define colors for reuse - 5% darker light mode
const LIGHT_BG_COLOR = "#EAEAEA"; // Darker than previous #F7F7F7
const LIGHT_ODD_ROW_COLOR = "#E2E6E6"; // Darker than previous #EEF1F1
const LIGHT_HEADER_BG = "#E6E6E6D6"; // Darker than previous #EFEFEFD6
const DARK_ODD_ROW_COLOR = "#2A2E35";
const DARK_BG_COLOR = "#1f2836";

export function useAgGridTheme() {
  const { theme: currentTheme } = useTheme();
  const isDarkMode = currentTheme === 'dark';

  // Update AG Grid theme when app theme changes
  useEffect(() => {
    setDarkMode(isDarkMode);
    
    // Ensure default CSS variables are set (in case they're not set elsewhere)
    // These will be overridden by the sliders if changed
    const spacingStyle = document.documentElement.style.getPropertyValue('--ag-spacing');
    const fontSizeStyle = document.documentElement.style.getPropertyValue('--ag-font-size');
    
    if (!spacingStyle) {
      document.documentElement.style.setProperty('--ag-spacing', '6px');
    }
    
    if (!fontSizeStyle) {
      document.documentElement.style.setProperty('--ag-font-size', '14px');
    }

    // Set the odd row background color based on current theme
    document.documentElement.style.setProperty(
      '--ag-odd-row-background-color', 
      isDarkMode ? DARK_ODD_ROW_COLOR : LIGHT_ODD_ROW_COLOR
    );
    
    // Also set the background color
    document.documentElement.style.setProperty(
      '--ag-background-color', 
      isDarkMode ? DARK_BG_COLOR : LIGHT_BG_COLOR
    );
    
    // Set header background color
    document.documentElement.style.setProperty(
      '--ag-header-background-color', 
      isDarkMode ? "rgba(255, 255, 255, 0.07)" : LIGHT_HEADER_BG
    );
  }, [isDarkMode]);

  // Create theme with base parameters but handle fonts separately via CSS
  const agGridTheme = useMemo(() => {
    const baseTheme = themeQuartz.withParams(
      {
        accentColor: "#8AAAA7",
        backgroundColor: LIGHT_BG_COLOR,
        borderColor: "#23202029",
        browserColorScheme: "light",
        buttonBorderRadius: 2,
        cellTextColor: "#000000",
        checkboxBorderRadius: 2,
        columnBorder: true,
        // Don't include fontFamily in theme to avoid re-rendering
        // Don't include fontSize as we're controlling it via CSS variable
        headerBackgroundColor: LIGHT_HEADER_BG,
        // Don't include headerFontFamily in theme to avoid re-rendering
        headerFontSize: 14,
        headerFontWeight: 500,
        iconButtonBorderRadius: 1,
        iconSize: 12,
        inputBorderRadius: 2,
        oddRowBackgroundColor: LIGHT_ODD_ROW_COLOR,
        // Don't include spacing as we're controlling it via CSS variable
        wrapperBorderRadius: 2,
      },
      "light"
    )
    .withParams(
      {
        accentColor: "#8AAAA7",
        backgroundColor: DARK_BG_COLOR,
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
        // Don't include fontSize as we're controlling it via CSS variable
        foregroundColor: "#FFF",
        // Don't include headerFontFamily in theme to avoid re-rendering
        headerFontSize: 14,
        iconSize: 12,
        inputBorderRadius: 2,
        oddRowBackgroundColor: DARK_ODD_ROW_COLOR,
        // Don't include spacing as we're controlling it via CSS variable
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