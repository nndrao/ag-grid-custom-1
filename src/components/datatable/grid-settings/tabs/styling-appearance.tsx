import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTheme } from '@/components/theme-provider';

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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>
            Configure the visual appearance of the grid.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2 pt-0">
            <Label htmlFor="domLayout">DOM Layout</Label>
            <Select
              value={getSelectValue(localSettings.domLayout, 'normal')}
              onValueChange={(value) => handleSelectChange('domLayout', value === 'normal' ? '' : value)}
            >
              <SelectTrigger id="domLayout">
                <SelectValue placeholder="Select layout" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="autoHeight">Auto Height</SelectItem>
                <SelectItem value="print">Print</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              The DOM layout to use for the grid.
            </p>
          </div>
          
          <div className="flex items-center space-x-2 pt-4">
            <Checkbox 
              id="animateRows" 
              checked={!!localSettings.animateRows}
              onCheckedChange={(checked) => handleCheckboxChange('animateRows', !!checked)} 
            />
            <Label htmlFor="animateRows" className="font-normal">
              Animate rows
            </Label>
            <p className="text-xs text-muted-foreground ml-6">
              When enabled, rows will animate when sorting or filtering.
            </p>
          </div>
          
          <div className="flex items-center space-x-2 pt-2">
            <Checkbox 
              id="alwaysShowVerticalScroll" 
              checked={!!localSettings.alwaysShowVerticalScroll}
              onCheckedChange={(checked) => handleCheckboxChange('alwaysShowVerticalScroll', !!checked)} 
            />
            <Label htmlFor="alwaysShowVerticalScroll" className="font-normal">
              Always show vertical scroll
            </Label>
            <p className="text-xs text-muted-foreground ml-6">
              When enabled, vertical scrollbar will always be displayed.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 