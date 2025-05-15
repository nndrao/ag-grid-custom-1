import { useEffect } from 'react';

export function GoogleFontsLoader() {
  useEffect(() => {
    // Check if the Google Fonts link already exists
    const existingLink = document.head.querySelector('link[href*="fonts.googleapis.com"]');
    
    if (!existingLink) {
      // Create a link element for Google Fonts
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;500;700&family=JetBrains+Mono:wght@400;500;700&family=Source+Code+Pro:wght@400;500;700&family=Fira+Code:wght@400;500;700&family=Space+Mono:wght@400;700&family=Ubuntu+Mono:wght@400;700&family=IBM+Plex+Mono:wght@400;500;700&family=Inconsolata:wght@400;500;700&family=Cousine:wght@400;700&family=PT+Mono&display=swap';
      
      // Add the link to the document head
      document.head.appendChild(link);
      
      // Clean up when the component unmounts
      return () => {
        document.head.removeChild(link);
      };
    }
  }, []);
  
  return null; // This component doesn't render anything
} 