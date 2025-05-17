import { useCallback, useEffect, useState } from 'react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { DEFAULT_FONT_FAMILY, SettingsController } from '@/services/settings-controller';
import { GridStateProvider } from '@/services/gridStateProvider';
import { Type } from 'lucide-react';

interface FontFamilySelectorProps {
  settingsController: SettingsController | null;
}

const fontOptions = [
  // System fonts
  { value: 'system-ui', label: 'System UI' },
  { value: 'sans-serif', label: 'Sans Serif' },
  { value: 'serif', label: 'Serif' },
  { value: 'monospace', label: 'Monospace' },
  
  // Google Monospace Fonts
  { value: '"Roboto Mono", monospace', label: 'Roboto Mono' },
  { value: '"JetBrains Mono", monospace', label: 'JetBrains Mono' },
  { value: '"Source Code Pro", monospace', label: 'Source Code Pro' },
  { value: '"Fira Code", monospace', label: 'Fira Code' },
  { value: '"Space Mono", monospace', label: 'Space Mono' },
  { value: '"Ubuntu Mono", monospace', label: 'Ubuntu Mono' },
  { value: '"IBM Plex Mono", monospace', label: 'IBM Plex Mono' },
  { value: '"Inconsolata", monospace', label: 'Inconsolata' },
  { value: '"Cousine", monospace', label: 'Cousine' },
  { value: '"PT Mono", monospace', label: 'PT Mono' },
  
  // Other fonts
  { value: 'Inter, sans-serif', label: 'Inter' },
];

export function FontFamilySelector({ settingsController }: FontFamilySelectorProps) {
  const [fontFamily, setFontFamily] = useState<string>(DEFAULT_FONT_FAMILY);
  
  // Initialize with current settings
  useEffect(() => {
    if (settingsController) {
      const currentSettings = settingsController.getCurrentToolbarSettings();
      setFontFamily(currentSettings.fontFamily || DEFAULT_FONT_FAMILY);
    }
  }, [settingsController]);
  
  // Subscribe to settings changes
  useEffect(() => {
    if (!settingsController) return;
    
    const unsubscribe = settingsController.onToolbarSettingsChange((settings) => {
      if (settings.fontFamily) {
        setFontFamily(settings.fontFamily);
      } else {
        setFontFamily(DEFAULT_FONT_FAMILY);
        settingsController.updateToolbarSettings({ fontFamily: DEFAULT_FONT_FAMILY });
      }
    });
    
    return unsubscribe;
  }, [settingsController]);
  
  // Apply the font family to the grid via CSS variable
  useEffect(() => {
    if (fontFamily) {
      document.documentElement.style.setProperty('--ag-font-family', fontFamily);
    }
  }, [fontFamily]);
  
  const handleFontChange = useCallback((value: string) => {
    setFontFamily(value);
    if (settingsController) {
      settingsController.updateToolbarSettings({ fontFamily: value });
    }
    // The useEffect above will update the CSS variable
  }, [settingsController]);
  
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="inline-block">
          <Select value={fontFamily} onValueChange={handleFontChange}>
            <SelectTrigger className="h-8 w-[140px] text-xs border-border/50 bg-background/50 hover:bg-accent/50 transition-colors">
              <Type className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Font Family" />
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
              {fontOptions.map((option) => (
                <SelectItem 
                  key={option.value} 
                  value={option.value}
                  style={{ fontFamily: option.value }}
                  className="flex items-center justify-between"
                >
                  <span>{option.label}</span>
                  {option.label.includes('Mono') && (
                    <Badge variant="secondary" className="ml-2 text-xs px-1 py-0 font-normal">
                      mono
                    </Badge>
                  )}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p>Font Family</p>
        <p className="text-xs text-muted-foreground">Change grid typography</p>
      </TooltipContent>
    </Tooltip>
  );
} 