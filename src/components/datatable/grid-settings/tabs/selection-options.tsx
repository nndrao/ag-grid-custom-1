import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface SelectionOptionsProps {
  settings: {
    rowSelection?: string;
    rowMultiSelectWithClick?: boolean;
    suppressRowClickSelection?: boolean;
    suppressCellSelection?: boolean;
    enableRangeSelection?: boolean;
    enableRangeHandle?: boolean;
    suppressRowDeselection?: boolean;
  };
  onChange: (option: string, value: any) => void;
  initialProperties?: string[];
}

export function SelectionOptions({ settings, onChange }: SelectionOptionsProps) {
  const [localSettings, setLocalSettings] = useState(settings);
  
  // Update local state when settings prop changes
  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  // Handler for radio options
  const handleRadioChange = (option: string, value: string) => {
    setLocalSettings(prev => ({ ...prev, [option]: value }));
    onChange(option, value);
  };

  // Handler for checkbox options
  const handleCheckboxChange = (option: string, checked: boolean) => {
    setLocalSettings(prev => ({ ...prev, [option]: checked }));
    if (option === 'suppressCellSelection') {
  // Do not pass suppressCellSelection to AG Grid
  return;
}
onChange(option, checked);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Row Selection</CardTitle>
          <CardDescription>
            Configure how users select rows in the grid.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Label>Selection Type</Label>
            <RadioGroup
              value={localSettings.rowSelection || 'single'}
              onValueChange={(value) => handleRadioChange('rowSelection', value)}
              className="flex flex-col space-y-1"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="single" id="single" />
                <Label htmlFor="single" className="font-normal">Single row selection</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="multiple" id="multiple" />
                <Label htmlFor="multiple" className="font-normal">Multiple row selection</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="" id="none" />
                <Label htmlFor="none" className="font-normal">No row selection</Label>
              </div>
            </RadioGroup>
          </div>
          
          <div className="space-y-3 pt-3">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="rowMultiSelectWithClick" 
                checked={!!localSettings.rowMultiSelectWithClick}
                onCheckedChange={(checked) => handleCheckboxChange('rowMultiSelectWithClick', !!checked)} 
              />
              <Label htmlFor="rowMultiSelectWithClick" className="font-normal">
                Row multi-select with single click
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="suppressRowClickSelection" 
                checked={!!localSettings.suppressRowClickSelection}
                onCheckedChange={(checked) => handleCheckboxChange('suppressRowClickSelection', !!checked)} 
              />
              <Label htmlFor="suppressRowClickSelection" className="font-normal">
                Prevent row selection on click
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="suppressRowDeselection" 
                checked={!!localSettings.suppressRowDeselection}
                onCheckedChange={(checked) => handleCheckboxChange('suppressRowDeselection', !!checked)} 
              />
              <Label htmlFor="suppressRowDeselection" className="font-normal">
                Prevent row deselection
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Cell Selection</CardTitle>
          <CardDescription>
            Configure how users select and interact with cells.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="suppressCellSelection" 
                checked={!!localSettings.suppressCellSelection}
                onCheckedChange={(checked) => handleCheckboxChange('suppressCellSelection', !!checked)} 
              />
              <Label htmlFor="suppressCellSelection" className="font-normal">
                Prevent cell selection
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="enableRangeSelection" 
                checked={!!localSettings.enableRangeSelection}
                onCheckedChange={(checked) => handleCheckboxChange('enableRangeSelection', !!checked)} 
              />
              <Label htmlFor="enableRangeSelection" className="font-normal">
                Enable range selection (multiple cells)
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="enableRangeHandle" 
                checked={!!localSettings.enableRangeHandle}
                onCheckedChange={(checked) => handleCheckboxChange('enableRangeHandle', !!checked)} 
              />
              <Label htmlFor="enableRangeHandle" className="font-normal">
                Show range handle for extending selection
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 