import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface EditingOptionsProps {
  settings: {
    editType?: string; // 'fullRow' or 'singleClick' in v33+
    singleClickEdit?: boolean;
    suppressClickEdit?: boolean;
    enterNavigatesVertically?: boolean; // v33+ replaces enterMovesDown
    enterNavigatesVerticallyAfterEdit?: boolean; // v33+ replaces enterMovesDownAfterEdit
    undoRedoCellEditing?: boolean;
    undoRedoCellEditingLimit?: number;
  };
  onChange: (option: string, value: any) => void;
  initialProperties?: string[];
}

export function EditingOptions({ settings, onChange }: EditingOptionsProps) {
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

  // Handler for radio options
  const handleRadioChange = (option: string, value: string) => {
    setLocalSettings(prev => ({ ...prev, [option]: value }));
    onChange(option, value);
  };

  // Handler for number inputs
  const handleNumberChange = (option: string, value: string) => {
    const numValue = value ? parseInt(value, 10) : undefined;
    setLocalSettings(prev => ({ ...prev, [option]: numValue }));
    onChange(option, numValue);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Cell Editing</CardTitle>
          <CardDescription>
            Configure how cells can be edited in the grid.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Label>Edit Type</Label>
            <RadioGroup
              value={localSettings.editType || 'none'}
              onValueChange={(value) => handleRadioChange('editType', value)}
              className="flex flex-col space-y-1"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="fullRow" id="fullRow" />
                <Label htmlFor="fullRow" className="font-normal">Full Row Edit</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="singleClick" id="singleClick" />
                <Label htmlFor="singleClick" className="font-normal">Single Click Edit</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="none" id="none" />
                <Label htmlFor="none" className="font-normal">No Edit (Default)</Label>
              </div>
            </RadioGroup>
            <p className="text-xs text-muted-foreground">
              Determines how editing is started in the grid.
            </p>
          </div>
          
          <div className="flex items-center space-x-2 pt-2">
            <Checkbox 
              id="singleClickEdit" 
              checked={!!localSettings.singleClickEdit}
              onCheckedChange={(checked) => handleCheckboxChange('singleClickEdit', !!checked)} 
              disabled={localSettings.editType === 'singleClick'}
            />
            <Label htmlFor="singleClickEdit" className="font-normal">
              Enter edit mode with a single click
            </Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="suppressClickEdit" 
              checked={!!localSettings.suppressClickEdit}
              onCheckedChange={(checked) => handleCheckboxChange('suppressClickEdit', !!checked)} 
            />
            <Label htmlFor="suppressClickEdit" className="font-normal">
              Disable entering edit mode with mouse clicks
            </Label>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Navigation & Keyboard Controls</CardTitle>
          <CardDescription>
            Configure keyboard behavior during editing.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="enterNavigatesVertically" 
              checked={!!localSettings.enterNavigatesVertically}
              onCheckedChange={(checked) => handleCheckboxChange('enterNavigatesVertically', !!checked)} 
            />
            <Label htmlFor="enterNavigatesVertically" className="font-normal">
              Enter key navigates vertically
            </Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="enterNavigatesVerticallyAfterEdit" 
              checked={!!localSettings.enterNavigatesVerticallyAfterEdit}
              onCheckedChange={(checked) => handleCheckboxChange('enterNavigatesVerticallyAfterEdit', !!checked)} 
            />
            <Label htmlFor="enterNavigatesVerticallyAfterEdit" className="font-normal">
              Enter key navigates vertically after editing
            </Label>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Undo / Redo</CardTitle>
          <CardDescription>
            Configure undo/redo functionality for editing.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="undoRedoCellEditing" 
              checked={!!localSettings.undoRedoCellEditing}
              onCheckedChange={(checked) => handleCheckboxChange('undoRedoCellEditing', !!checked)} 
            />
            <Label htmlFor="undoRedoCellEditing" className="font-normal">
              Enable undo/redo for cell editing
            </Label>
          </div>
          
          <div className="space-y-2 pt-2">
            <Label htmlFor="undoRedoCellEditingLimit">Undo Stack Size</Label>
            <Input
              id="undoRedoCellEditingLimit"
              type="number"
              value={localSettings.undoRedoCellEditingLimit || ''}
              onChange={(e) => handleNumberChange('undoRedoCellEditingLimit', e.target.value)}
              placeholder="Default"
              min={1}
              disabled={!localSettings.undoRedoCellEditing}
            />
            <p className="text-xs text-muted-foreground">
              Maximum number of undo steps to remember.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 