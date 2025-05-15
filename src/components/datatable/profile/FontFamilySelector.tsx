import { useCallback, useEffect, useState } from 'react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { DEFAULT_FONT_FAMILY, SettingsController } from '@/services/settingsController';
import { GridStateProvider } from '@/services/gridStateProvider';

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
      // If fontFamily is defined in settings, use it; otherwise, use the default
      setFontFamily(currentSettings.fontFamily || DEFAULT_FONT_FAMILY);
    }
  }, [settingsController]);
  
  // Subscribe to settings changes
  useEffect(() => {
    if (!settingsController) return;
    
    const unsubscribe = settingsController.onToolbarSettingsChange((settings) => {
      // If fontFamily is defined in settings, use it; otherwise, use the default
      if (settings.fontFamily) {
        setFontFamily(settings.fontFamily);
      } else {
        // If fontFamily becomes undefined (unlikely), fall back to default
        setFontFamily(DEFAULT_FONT_FAMILY);
        // Ensure the default is applied to toolbar settings
        settingsController.updateToolbarSettings({ fontFamily: DEFAULT_FONT_FAMILY });
      }
    });
    
    return unsubscribe;
  }, [settingsController]);
  
  // Apply the font family to the grid
  const applyFontToGrid = useCallback((fontFamily: string) => {
    if (!settingsController) return;
    
    // Try multiple approaches to get the grid's DOM element
    
    // 1. Try through grid options api
    const gridApi = settingsController.getCurrentGridOptions()?.api;
    if (gridApi && gridApi.gridBodyCtrl?.eGridDiv) {
      gridApi.gridBodyCtrl.eGridDiv.style.fontFamily = fontFamily;
      return;
    }
    
    // 2. As a fallback, directly apply to all AG-grid elements
    try {
      // Apply to various AG Grid DOM elements to ensure it works
      const gridElements = [
        '.ag-root',
        '.ag-root-wrapper',
        '.ag-header',
        '.ag-body-viewport',
        '.ag-center-cols-container'
      ];
      
      gridElements.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
          (element as HTMLElement).style.fontFamily = fontFamily;
        });
      });
    } catch (error) {
      console.error('Error applying font family to grid:', error);
    }
  }, [settingsController]);
  
  // Initial application of font when component mounts
  useEffect(() => {
    if (fontFamily) {
      applyFontToGrid(fontFamily);
    }
  }, [fontFamily, applyFontToGrid]);
  
  const handleFontChange = useCallback((value: string) => {
    setFontFamily(value);
    
    if (settingsController) {
      // Update toolbar settings
      settingsController.updateToolbarSettings({ fontFamily: value });
      
      // Apply font to grid
      applyFontToGrid(value);
    }
  }, [settingsController, applyFontToGrid]);
  
  return (
    <div className="flex items-center">
      <Tooltip>
        <TooltipTrigger asChild>
          <Select value={fontFamily} onValueChange={handleFontChange}>
            <SelectTrigger className="h-8 w-[160px] text-xs">
              <SelectValue placeholder="Font Family" />
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
              {fontOptions.map((option) => (
                <SelectItem 
                  key={option.value} 
                  value={option.value}
                  style={{ fontFamily: option.value }}
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </TooltipTrigger>
        <TooltipContent>
          <p>Change grid font family</p>
          <p className="text-xs text-muted-foreground">Includes Google Monospace fonts</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
} 