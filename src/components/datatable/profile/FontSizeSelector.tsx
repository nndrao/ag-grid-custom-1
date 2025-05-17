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
import { DEFAULT_FONT_SIZE, MIN_FONT_SIZE, SettingsController } from '@/services/settings-controller';
import { TextCursorInput } from 'lucide-react';

interface FontSizeSelectorProps {
  settingsController: SettingsController | null;
}

// Generate font size options from 6px (MIN_FONT_SIZE) to 24px
const fontSizeOptions = Array.from({ length: 10 }, (_, i) => MIN_FONT_SIZE + i * 2).map(size => ({
  value: size.toString(),
  label: `${size}px`
}));

export function FontSizeSelector({ settingsController }: FontSizeSelectorProps) {
  const [fontSize, setFontSize] = useState<string>(DEFAULT_FONT_SIZE.toString());
  
  // Initialize with current settings
  useEffect(() => {
    if (settingsController) {
      const currentSettings = settingsController.getCurrentToolbarSettings();
      if (currentSettings.fontSize !== undefined && currentSettings.fontSize !== null) {
        // Convert font size to number if it's a string with 'px'
        let numericFontSize = currentSettings.fontSize;
        if (typeof numericFontSize === 'string') {
          numericFontSize = parseInt(numericFontSize.replace('px', ''), 10);
        }
        
        // Validate font size
        if (typeof numericFontSize === 'number' && !isNaN(numericFontSize) && numericFontSize >= MIN_FONT_SIZE) {
          setFontSize(numericFontSize.toString());
        } else {
          // If invalid, use default
          setFontSize(DEFAULT_FONT_SIZE.toString());
          // Update settings to use default
          settingsController.updateToolbarSettings({ fontSize: DEFAULT_FONT_SIZE });
        }
      } else {
        // If font size is not set in the profile, use the default
        setFontSize(DEFAULT_FONT_SIZE.toString());
        // Also update the toolbar settings to ensure it's properly saved
        settingsController.updateToolbarSettings({ fontSize: DEFAULT_FONT_SIZE });
      }
    }
  }, [settingsController]);
  
  // Subscribe to settings changes
  useEffect(() => {
    if (!settingsController) return;
    
    const unsubscribe = settingsController.onToolbarSettingsChange((settings) => {
      if (settings.fontSize !== undefined && settings.fontSize !== null) {
        // Convert font size to number if it's a string with 'px'
        let numericFontSize = settings.fontSize;
        if (typeof numericFontSize === 'string') {
          numericFontSize = parseInt(numericFontSize.replace('px', ''), 10);
        }
        
        // Validate font size
        if (typeof numericFontSize === 'number' && !isNaN(numericFontSize) && numericFontSize >= MIN_FONT_SIZE) {
          setFontSize(numericFontSize.toString());
        } else {
          // If invalid, use default
          setFontSize(DEFAULT_FONT_SIZE.toString());
          // Update settings to use default
          settingsController.updateToolbarSettings({ fontSize: DEFAULT_FONT_SIZE });
        }
      } else {
        // If font size is not set or becomes undefined, reset to default
        setFontSize(DEFAULT_FONT_SIZE.toString());
        // Ensure the default is applied to toolbar settings
        settingsController.updateToolbarSettings({ 
          fontSize: DEFAULT_FONT_SIZE
        });
      }
    });
    
    return unsubscribe;
  }, [settingsController]);
  
  const handleFontSizeChange = useCallback((value: string) => {
    setFontSize(value);
    const numericValue = parseInt(value, 10);
    
    if (settingsController) {
      // Update toolbar settings - theme will be updated automatically by useAgGridTheme
      settingsController.updateToolbarSettings({ fontSize: numericValue });
    }
  }, [settingsController]);
  
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="inline-block">
          <Select value={fontSize} onValueChange={handleFontSizeChange}>
            <SelectTrigger className="h-8 w-[90px] text-xs border-border/50 bg-background/50 hover:bg-accent/50 transition-colors">
              <TextCursorInput className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Size" />
            </SelectTrigger>
            <SelectContent>
              {fontSizeOptions.map((option) => (
                <SelectItem 
                  key={option.value} 
                  value={option.value}
                >
                  <span className="flex items-center justify-between w-full">
                    <span>{option.label}</span>
                    {option.value === 'default' && (
                      <Badge variant="secondary" className="ml-2 text-xs px-1 py-0 font-normal">
                        14px
                      </Badge>
                    )}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p>Font Size</p>
        <p className="text-xs text-muted-foreground">Headers +2px larger</p>
      </TooltipContent>
    </Tooltip>
  );
} 