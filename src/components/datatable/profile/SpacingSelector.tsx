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
import { DEFAULT_SPACING, SettingsController } from '@/services/settings-controller';
import { Rows3 } from 'lucide-react';

interface SpacingSelectorProps {
  settingsController: SettingsController | null;
}

const spacingOptions = [
  { value: '2', label: '2px' },
  { value: '3', label: '3px' },
  { value: '4', label: '4px' },
  { value: '5', label: '5px' },
  { value: '6', label: '6px' },
  { value: '8', label: '8px' },
  { value: '10', label: '10px' },
  { value: '12', label: '12px' },
];

export function SpacingSelector({ settingsController }: SpacingSelectorProps) {
  const [spacing, setSpacing] = useState<string>(DEFAULT_SPACING.toString());
  
  // Initialize with current settings
  useEffect(() => {
    if (settingsController) {
      const currentSettings = settingsController.getCurrentToolbarSettings();
      // Explicitly check for undefined or null to ensure default is applied
      if (currentSettings.spacing !== undefined && currentSettings.spacing !== null) {
        setSpacing(currentSettings.spacing.toString());
      } else {
        // If spacing is not set in the profile, use the default
        setSpacing(DEFAULT_SPACING.toString());
        // Also update the toolbar settings to ensure it's properly saved
        settingsController.updateToolbarSettings({ spacing: DEFAULT_SPACING });
      }
    }
  }, [settingsController]);
  
  // Subscribe to settings changes
  useEffect(() => {
    if (!settingsController) return;
    
    const unsubscribe = settingsController.onToolbarSettingsChange((settings) => {
      // Explicitly check for undefined or null to ensure default is applied
      if (settings.spacing !== undefined && settings.spacing !== null) {
        setSpacing(settings.spacing.toString());
      } else {
        // If spacing is not set or becomes undefined, reset to default
        setSpacing(DEFAULT_SPACING.toString());
        // Ensure the default is applied to toolbar settings
        settingsController.updateToolbarSettings({ 
          spacing: DEFAULT_SPACING
        });
      }
    });
    
    return unsubscribe;
  }, [settingsController]);
  
  const handleSpacingChange = useCallback((value: string) => {
    setSpacing(value);
    const numericValue = parseInt(value, 10);
    
    if (settingsController) {
      // Update toolbar settings - theme will be updated automatically
      settingsController.updateToolbarSettings({ spacing: numericValue });
    }
  }, [settingsController]);
  
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="inline-block">
          <Select value={spacing} onValueChange={handleSpacingChange}>
            <SelectTrigger className="h-8 w-[100px] text-xs border-border/60 bg-background/95 hover:bg-background hover:border-border shadow-sm transition-all">
              <Rows3 className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Spacing" />
            </SelectTrigger>
            <SelectContent>
              {spacingOptions.map((option) => (
                <SelectItem 
                  key={option.value} 
                  value={option.value}
                >
                  <span className="flex items-center justify-between w-full">
                    <span>{option.label}</span>
                    {option.value === 'default' && (
                      <Badge variant="secondary" className="ml-2 text-xs px-1 py-0 font-normal">
                        ✓
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
        <p>Grid Spacing</p>
        <p className="text-xs text-muted-foreground">Adjust cell padding</p>
      </TooltipContent>
    </Tooltip>
  );
} 