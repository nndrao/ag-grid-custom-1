import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface SelectionOptionsProps {
  settings: {
    rowSelection?: any; // Can be string or object in v33+
    rowMultiSelectWithClick?: boolean;
    suppressRowClickSelection?: boolean;
    cellSelection?: any; // Object in v33+
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
  const handleRadioChange = (option: string, value: any) => {
    setLocalSettings(prev => ({ ...prev, [option]: value }));
    onChange(option, value);
  };

  // Handler for checkbox options
  const handleCheckboxChange = (option: string, checked: boolean) => {
    setLocalSettings(prev => ({ ...prev, [option]: checked }));
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
              value={typeof localSettings.rowSelection === 'object' ? 
                localSettings.rowSelection?.mode || 'singleRow' : 
                localSettings.rowSelection || 'singleRow'}
              onValueChange={(value) => handleRadioChange('rowSelection', { mode: value })}
              className="flex flex-col space-y-1"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="singleRow" id="single" />
                <Label htmlFor="single" className="font-normal">Single row selection</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="multiRow" id="multiple" />
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
                id="enableSelectionWithoutKeys" 
                checked={typeof localSettings.rowSelection === 'object' ? 
                  !!localSettings.rowSelection?.enableSelectionWithoutKeys : false}
                onCheckedChange={(checked) => {
                  const rowSelection = typeof localSettings.rowSelection === 'object' ? 
                    {...localSettings.rowSelection} : { mode: 'singleRow' };
                  onChange('rowSelection', { ...rowSelection, enableSelectionWithoutKeys: !!checked });
                }} 
              />
              <Label htmlFor="enableSelectionWithoutKeys" className="font-normal">
                Enable selection without modifier keys
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="enableClickSelection" 
                checked={typeof localSettings.rowSelection === 'object' ? 
                  localSettings.rowSelection?.enableClickSelection !== false : true}
                onCheckedChange={(checked) => {
                  const rowSelection = typeof localSettings.rowSelection === 'object' ? 
                    {...localSettings.rowSelection} : { mode: 'singleRow' };
                  onChange('rowSelection', { ...rowSelection, enableClickSelection: !!checked });
                }} 
              />
              <Label htmlFor="enableClickSelection" className="font-normal">
                Enable row selection on click
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
                id="cellSelectionEnabled" 
                checked={typeof localSettings.cellSelection === 'object' ? 
                  localSettings.cellSelection !== false : true}
                onCheckedChange={(checked) => {
                  if (checked) {
                    onChange('cellSelection', {});
                  } else {
                    onChange('cellSelection', false);
                  }
                }} 
              />
              <Label htmlFor="cellSelectionEnabled" className="font-normal">
                Enable cell selection
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="cellSelectionMulti" 
                checked={typeof localSettings.cellSelection === 'object' ? 
                  localSettings.cellSelection?.multi !== false : true}
                onCheckedChange={(checked) => {
                  const cellSelection = typeof localSettings.cellSelection === 'object' ? 
                    {...localSettings.cellSelection} : {};
                  onChange('cellSelection', { ...cellSelection, multi: !!checked });
                }}
                disabled={typeof localSettings.cellSelection !== 'object'}
              />
              <Label htmlFor="cellSelectionMulti" className="font-normal">
                Enable multiple cell selection
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="cellSelectionHandle" 
                checked={typeof localSettings.cellSelection === 'object' ? 
                  !!localSettings.cellSelection?.handle : false}
                onCheckedChange={(checked) => {
                  const cellSelection = typeof localSettings.cellSelection === 'object' ? 
                    {...localSettings.cellSelection} : {};
                  onChange('cellSelection', { ...cellSelection, handle: !!checked });
                }}
                disabled={typeof localSettings.cellSelection !== 'object'}
              />
              <Label htmlFor="cellSelectionHandle" className="font-normal">
                Show range handle for extending selection
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 