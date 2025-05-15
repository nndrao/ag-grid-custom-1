import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTheme } from '@/components/theme-provider';
import { Switch } from '@/components/ui/switch';

interface StylingAppearanceProps {
  settings: {
    animateRows?: boolean;
    alwaysShowVerticalScroll?: boolean;
    domLayout?: string;
  };
  onChange: (option: string, value: any) => void;
  initialProperties?: string[];
}

export function StylingAppearance({ settings, onChange, initialProperties = [] }: StylingAppearanceProps) {
  const [localSettings, setLocalSettings] = useState(settings);
  
  // Update local state when settings prop changes
  useEffect(() => {
    // Filter out the theme property if it exists in the incoming settings
    // Theme should only be set via theme-provider and the toolbar, not in the grid settings
    const { theme, ...restSettings } = settings as any;
    setLocalSettings(restSettings);
  }, [settings]);

  // Handler for checkbox options
  const handleCheckboxChange = (option: string, checked: boolean) => {
    setLocalSettings(prev => ({ ...prev, [option]: checked }));
    onChange(option, checked);
  };

  // Handler for select options
  const handleSelectChange = (option: string, value: string) => {
    const finalValue = value === 'normal' || value === 'default-theme' ? undefined : value; // Adjusted for domLayout
    setLocalSettings(prev => ({ ...prev, [option]: finalValue }));
    onChange(option, finalValue);
  };

  // Helper to handle empty values
  const getSelectValue = (value: string | undefined, defaultValue: string) => {
    if (value === undefined || value === '' || value === null) {
      return defaultValue;
    }
    return value;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center mb-2">
        <h3 className="text-base font-medium">Appearance & Visual Styling</h3>
      </div>
      
      <div className="space-y-1.5">
        <Label htmlFor="domLayout" className="text-sm font-medium">DOM Layout</Label>
        <Select
          value={getSelectValue(localSettings.domLayout, 'normal')}
          onValueChange={(value) => handleSelectChange('domLayout', value === 'normal' ? '' : value)}
        >
          <SelectTrigger id="domLayout" className="h-8 text-sm">
            <SelectValue placeholder="Select layout" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="normal">Normal</SelectItem>
            <SelectItem value="autoHeight">Auto Height</SelectItem>
            <SelectItem value="print">Print</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-[11px] text-muted-foreground">
          Controls how the DOM is structured for the grid
        </p>
      </div>
      
      <div className="space-y-3 mt-4">
        <h4 className="text-sm font-medium text-muted-foreground">Animation & Scroll Options</h4>
        
        <div className="flex items-center justify-between bg-muted/30 rounded-md p-2.5">
          <div className="space-y-0.5">
            <Label htmlFor="animateRows" className="text-sm">Animate Rows</Label>
            <p className="text-[11px] text-muted-foreground">
              Animate row changes when sorting/filtering
            </p>
          </div>
          <Switch 
            id="animateRows" 
            checked={!!localSettings.animateRows}
            onCheckedChange={(checked) => handleCheckboxChange('animateRows', checked)} 
          />
        </div>
        
        <div className="flex items-center justify-between bg-muted/30 rounded-md p-2.5">
          <div className="space-y-0.5">
            <Label htmlFor="alwaysShowVerticalScroll" className="text-sm">Always Show Vertical Scroll</Label>
            <p className="text-[11px] text-muted-foreground">
              Always display vertical scrollbar
            </p>
          </div>
          <Switch 
            id="alwaysShowVerticalScroll" 
            checked={!!localSettings.alwaysShowVerticalScroll}
            onCheckedChange={(checked) => handleCheckboxChange('alwaysShowVerticalScroll', checked)} 
          />
        </div>
      </div>
    </div>
  );
} 