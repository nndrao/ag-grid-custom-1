import React, { ReactNode } from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: string;
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
}: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="data-theme"
      defaultTheme={defaultTheme}
      enableSystem
      themes={["light", "dark"]}
    >
      <div className="font-sans [&_.ag-root]:font-[inherit] [&_.ag-theme-quartz]:font-[inherit]">
        {children}
      </div>
    </NextThemesProvider>
  );
} 