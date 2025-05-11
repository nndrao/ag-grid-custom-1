import React, { createContext, useContext, useState } from 'react';

interface CurrentFontContextState {
  currentGridFont: string;
  setCurrentGridFont: (font: string) => void;
}

const CurrentFontContext = createContext<CurrentFontContextState | undefined>(undefined);

export const CurrentFontProvider: React.FC<{ children: React.ReactNode; initialFont?: string }> = ({
  children,
  initialFont = 'Inter, sans-serif', // Default font
}) => {
  const [currentGridFont, setCurrentGridFont] = useState<string>(initialFont);

  return (
    <CurrentFontContext.Provider value={{ currentGridFont, setCurrentGridFont }}>
      {children}
    </CurrentFontContext.Provider>
  );
};

export function useCurrentFont() {
  const context = useContext(CurrentFontContext);
  if (context === undefined) {
    throw new Error('useCurrentFont must be used within a CurrentFontProvider');
  }
  return context;
} 