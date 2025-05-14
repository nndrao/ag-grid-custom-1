import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface LocalizationAccessibilityProps {
  settings: {
    enableRtl?: boolean;
    enableCellTextSelection?: boolean;
    tabToNextHeader?: boolean;
    tabToNextCell?: boolean;
    suppressHeaderKeyboardEvent?: boolean;
    suppressKeyboardEvent?: boolean;
    localeText?: string;
  };
  onChange: (option: string, value: any) => void;
  initialProperties?: string[];
}

export function LocalizationAccessibility({ settings, onChange }: LocalizationAccessibilityProps) {
  const [localSettings, setLocalSettings] = useState(settings);
  
  // Update local state when settings prop changes
  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  // Handler for checkbox options
  const handleCheckboxChange = (option: string, checked: boolean) => {
    setLocalSettings(prev => ({ ...prev, [option]: checked }));
    onChange(option, checked);
  };

  // Handler for text inputs
  const handleTextChange = (option: string, value: string) => {
    setLocalSettings(prev => ({ ...prev, [option]: value }));
    onChange(option, value);
  };

  // Handler for select options
  const handleSelectChange = (option: string, value: string) => {
    setLocalSettings(prev => ({ ...prev, [option]: value }));
    onChange(option, value);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Localization</CardTitle>
          <CardDescription>
            Configure language and localization options.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="enableRtl" 
              checked={!!localSettings.enableRtl}
              onCheckedChange={(checked) => handleCheckboxChange('enableRtl', !!checked)} 
            />
            <Label htmlFor="enableRtl" className="font-normal">
              Enable right-to-left mode
            </Label>
            <p className="text-xs text-muted-foreground ml-6">
              For languages that read right-to-left (like Arabic or Hebrew).
            </p>
          </div>
          
          <div className="space-y-2 pt-3">
            <Label htmlFor="localeText">Locale Text JSON</Label>
            <Input
              id="localeText"
              value={localSettings.localeText || ''}
              onChange={(e) => handleTextChange('localeText', e.target.value)}
              placeholder='{"search": "Rechercher", "equals": "Égal à"}'
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Custom translations as a valid JSON string.
            </p>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Accessibility</CardTitle>
          <CardDescription>
            Configure keyboard navigation and accessibility features.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="enableCellTextSelection" 
              checked={!!localSettings.enableCellTextSelection}
              onCheckedChange={(checked) => handleCheckboxChange('enableCellTextSelection', !!checked)} 
            />
            <Label htmlFor="enableCellTextSelection" className="font-normal">
              Enable text selection in cells
            </Label>
            <p className="text-xs text-muted-foreground ml-6">
              Allows users to select and copy text from cells.
            </p>
          </div>
          
          <div className="flex items-center space-x-2 pt-2">
            <Checkbox 
              id="tabToNextHeader" 
              checked={!!localSettings.tabToNextHeader}
              onCheckedChange={(checked) => handleCheckboxChange('tabToNextHeader', !!checked)} 
            />
            <Label htmlFor="tabToNextHeader" className="font-normal">
              Tab navigates to next header
            </Label>
          </div>
          
          <div className="flex items-center space-x-2 pt-2">
            <Checkbox 
              id="tabToNextCell" 
              checked={!!localSettings.tabToNextCell}
              onCheckedChange={(checked) => handleCheckboxChange('tabToNextCell', !!checked)} 
            />
            <Label htmlFor="tabToNextCell" className="font-normal">
              Tab navigates to next cell
            </Label>
          </div>
          
          <div className="flex items-center space-x-2 pt-2">
            <Checkbox 
              id="suppressHeaderKeyboardEvent" 
              checked={!!localSettings.suppressHeaderKeyboardEvent}
              onCheckedChange={(checked) => handleCheckboxChange('suppressHeaderKeyboardEvent', !!checked)} 
            />
            <Label htmlFor="suppressHeaderKeyboardEvent" className="font-normal">
              Disable keyboard events on headers
            </Label>
          </div>
          
          <div className="flex items-center space-x-2 pt-2">
            <Checkbox 
              id="suppressKeyboardEvent" 
              checked={!!localSettings.suppressKeyboardEvent}
              onCheckedChange={(checked) => handleCheckboxChange('suppressKeyboardEvent', !!checked)} 
            />
            <Label htmlFor="suppressKeyboardEvent" className="font-normal">
              Disable grid keyboard events
            </Label>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 