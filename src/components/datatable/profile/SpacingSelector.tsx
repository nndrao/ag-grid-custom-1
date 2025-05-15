import { useCallback, useEffect, useState } from 'react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { DEFAULT_SPACING, SettingsController } from '@/services/settings-controller';

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
    <div className="flex items-center">
      <Tooltip>
        <TooltipTrigger>
          <div>
            <Select value={spacing} onValueChange={handleSpacingChange}>
              <SelectTrigger className="h-8 w-[80px] text-xs">
                <SelectValue placeholder="Spacing" />
              </SelectTrigger>
              <SelectContent>
                {spacingOptions.map((option) => (
                  <SelectItem 
                    key={option.value} 
                    value={option.value}
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>Change grid spacing</p>
          <p className="text-xs text-muted-foreground">Adjusts cell padding and grid size</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
} 