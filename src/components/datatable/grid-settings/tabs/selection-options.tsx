import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';

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

  // Helper to check if cell selection is enabled
  const isCellSelectionEnabled = () => {
    return localSettings.cellSelection !== false;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center mb-2">
        <h3 className="text-base font-medium">Selection Options</h3>
      </div>
      
      {/* Row Selection Section */}
      <div className="bg-muted/30 rounded-lg p-3 space-y-3">
        <h4 className="text-sm font-medium">Row Selection</h4>
        
        <RadioGroup
          value={typeof localSettings.rowSelection === 'object' ? 
            localSettings.rowSelection?.mode || 'singleRow' : 
            localSettings.rowSelection || 'singleRow'}
          onValueChange={(value) => handleRadioChange('rowSelection', { mode: value })}
          className="flex flex-col space-y-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="singleRow" id="single" className="h-4 w-4" />
            <Label htmlFor="single" className="font-normal text-sm">Single row selection</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="multiRow" id="multiple" className="h-4 w-4" />
            <Label htmlFor="multiple" className="font-normal text-sm">Multiple row selection</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="" id="none" className="h-4 w-4" />
            <Label htmlFor="none" className="font-normal text-sm">No row selection</Label>
          </div>
        </RadioGroup>
      </div>
      
      {/* Row Selection Options */}
      <div className="space-y-2.5 pt-1">
        <div className="flex items-center justify-between py-1.5">
          <div>
            <Label htmlFor="enableSelectionWithoutKeys" className="text-sm font-medium">Multiselect Without Keys</Label>
            <p className="text-[11px] text-muted-foreground">Select multiple rows without holding Ctrl/Cmd</p>
          </div>
          <Switch 
            id="enableSelectionWithoutKeys" 
            checked={typeof localSettings.rowSelection === 'object' ? 
              !!localSettings.rowSelection?.enableSelectionWithoutKeys : false}
            onCheckedChange={(checked) => {
              const rowSelection = typeof localSettings.rowSelection === 'object' ? 
                {...localSettings.rowSelection} : { mode: 'singleRow' };
              onChange('rowSelection', { ...rowSelection, enableSelectionWithoutKeys: !!checked });
            }} 
          />
        </div>
        
        <div className="flex items-center justify-between py-1.5">
          <div>
            <Label htmlFor="enableClickSelection" className="text-sm font-medium">Click Selection</Label>
            <p className="text-[11px] text-muted-foreground">Select rows by clicking on cells</p>
          </div>
          <Switch 
            id="enableClickSelection" 
            checked={typeof localSettings.rowSelection === 'object' ? 
              localSettings.rowSelection?.enableClickSelection !== false : true}
            onCheckedChange={(checked) => {
              const rowSelection = typeof localSettings.rowSelection === 'object' ? 
                {...localSettings.rowSelection} : { mode: 'singleRow' };
              onChange('rowSelection', { ...rowSelection, enableClickSelection: !!checked });
            }} 
          />
        </div>
        
        <div className="flex items-center justify-between py-1.5">
          <div>
            <Label htmlFor="showCheckboxes" className="text-sm font-medium">Show Checkboxes</Label>
            <p className="text-[11px] text-muted-foreground">Display checkbox column for row selection</p>
          </div>
          <Switch 
            id="showCheckboxes" 
            checked={typeof localSettings.rowSelection === 'object' ? 
              localSettings.rowSelection?.checkboxes !== false : true}
            onCheckedChange={(checked) => {
              const rowSelection = typeof localSettings.rowSelection === 'object' ? 
                {...localSettings.rowSelection} : { mode: 'singleRow' };
              onChange('rowSelection', { ...rowSelection, checkboxes: checked });
            }} 
          />
        </div>
        
        <div className="flex items-center justify-between py-1.5">
          <div>
            <Label htmlFor="suppressRowDeselection" className="text-sm font-medium">Prevent Deselection</Label>
            <p className="text-[11px] text-muted-foreground">Prevent rows from being deselected</p>
          </div>
          <Switch 
            id="suppressRowDeselection" 
            checked={!!localSettings.suppressRowDeselection}
            onCheckedChange={(checked) => {
              setLocalSettings(prev => ({ ...prev, suppressRowDeselection: checked }));
              onChange('suppressRowDeselection', checked);
            }} 
          />
        </div>
      </div>
      
      <Separator className="my-3" />
      
      {/* Cell Selection Section */}
      <div>
        <h4 className="text-sm font-medium mb-3">Cell Selection</h4>
        
        <div className="space-y-2.5">
          <div className="flex items-center justify-between py-1.5">
            <div>
              <Label htmlFor="cellSelectionEnabled" className="text-sm font-medium">Enable Cell Selection</Label>
              <p className="text-[11px] text-muted-foreground">Allow selecting individual cells</p>
            </div>
            <Switch 
              id="cellSelectionEnabled" 
              checked={isCellSelectionEnabled()}
              onCheckedChange={(checked) => {
                if (checked) {
                  onChange('cellSelection', {});
                } else {
                  onChange('cellSelection', false);
                }
              }} 
            />
          </div>
          
          <div className="flex items-center justify-between py-1.5 pl-4 border-l-2 border-muted-foreground/20">
            <div>
              <Label htmlFor="cellSelectionMulti" className="text-sm font-medium">
                Multiple Cell Selection
              </Label>
              <p className="text-[11px] text-muted-foreground">Allow selecting multiple cells at once</p>
            </div>
            <Switch 
              id="cellSelectionMulti" 
              checked={typeof localSettings.cellSelection === 'object' ? 
                localSettings.cellSelection?.multi !== false : true}
              onCheckedChange={(checked) => {
                const cellSelection = typeof localSettings.cellSelection === 'object' ? 
                  {...localSettings.cellSelection} : {};
                onChange('cellSelection', { ...cellSelection, multi: !!checked });
              }}
              disabled={!isCellSelectionEnabled()}
            />
          </div>
          
          <div className="flex items-center justify-between py-1.5 pl-4 border-l-2 border-muted-foreground/20">
            <div>
              <Label htmlFor="cellSelectionHandle" className="text-sm font-medium">
                Range Handle
              </Label>
              <p className="text-[11px] text-muted-foreground">Show handle for extending cell selection</p>
            </div>
            <Switch 
              id="cellSelectionHandle" 
              checked={typeof localSettings.cellSelection === 'object' ? 
                !!localSettings.cellSelection?.handle : false}
              onCheckedChange={(checked) => {
                const cellSelection = typeof localSettings.cellSelection === 'object' ? 
                  {...localSettings.cellSelection} : {};
                onChange('cellSelection', { ...cellSelection, handle: !!checked });
              }}
              disabled={!isCellSelectionEnabled()}
            />
          </div>
        </div>
      </div>
    </div>
  );
} 