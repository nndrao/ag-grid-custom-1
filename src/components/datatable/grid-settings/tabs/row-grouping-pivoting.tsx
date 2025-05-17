import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface RowGroupingPivotingProps {
  settings: {
    groupUseEntireRow?: boolean;
    groupSelectsChildren?: boolean;
    groupHideParentOfSingleChild?: boolean; // v33+ name
    pivotMode?: boolean;
    pivotPanelShow?: string;
    groupDefaultExpanded?: number;
    rowGroupPanelShow?: string;
    groupDisplayType?: string;
    groupRemoveLowestSingleChildren?: boolean; // v33+ additional option
  };
  onChange: (option: string, value: any) => void;
  initialProperties?: string[];
}

export function RowGroupingPivoting({ settings, onChange }: RowGroupingPivotingProps) {
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

  // Handler for select options
  const handleSelectChange = (option: string, value: string) => {
    // Don't set empty strings - use undefined instead
    const finalValue = value === '' ? undefined : value;
    setLocalSettings(prev => ({ ...prev, [option]: finalValue }));
    onChange(option, finalValue);
  };

  // Handler for number inputs
  const handleNumberChange = (option: string, value: string) => {
    const numValue = value !== '' ? parseInt(value, 10) : undefined;
    setLocalSettings(prev => ({ ...prev, [option]: numValue }));
    onChange(option, numValue);
  };

  // Map empty values to default strings for select components
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
          <CardTitle>Row Grouping</CardTitle>
          <CardDescription>
            Configure row grouping behavior and appearance.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="groupDisplayType">Group Display Type</Label>
            <Select
              value={getSelectValue(localSettings.groupDisplayType, 'default')}
              onValueChange={(value) => handleSelectChange('groupDisplayType', value === 'default' ? '' : value)}
            >
              <SelectTrigger id="groupDisplayType">
                <SelectValue placeholder="Select display type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="singleColumn">Single Column</SelectItem>
                <SelectItem value="multipleColumns">Multiple Columns</SelectItem>
                <SelectItem value="groupRows">Group Rows</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              How to display rows when grouped.
            </p>
          </div>
          
          <div className="space-y-2 pt-2">
            <Label htmlFor="rowGroupPanelShow">Row Group Panel</Label>
            <Select
              value={getSelectValue(localSettings.rowGroupPanelShow, 'never')}
              onValueChange={(value) => handleSelectChange('rowGroupPanelShow', value === 'never' ? '' : value)}
            >
              <SelectTrigger id="rowGroupPanelShow">
                <SelectValue placeholder="Select when to show" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="never">Never</SelectItem>
                <SelectItem value="always">Always</SelectItem>
                <SelectItem value="onlyWhenGrouping">Only When Grouping</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              When to show the row group panel.
            </p>
          </div>

          <div className="space-y-2 pt-2">
            <Label htmlFor="groupDefaultExpanded">Default Expanded Level</Label>
            <Input
              id="groupDefaultExpanded"
              type="number"
              value={localSettings.groupDefaultExpanded === undefined ? '' : localSettings.groupDefaultExpanded}
              onChange={(e) => handleNumberChange('groupDefaultExpanded', e.target.value)}
              placeholder="0"
              min={-1}
            />
            <p className="text-xs text-muted-foreground">
              The number of levels to expand by default (-1 for all).
            </p>
          </div>
          
          <div className="flex items-center space-x-2 pt-2">
            <Checkbox 
              id="groupUseEntireRow" 
              checked={!!localSettings.groupUseEntireRow}
              onCheckedChange={(checked) => handleCheckboxChange('groupUseEntireRow', !!checked)} 
            />
            <Label htmlFor="groupUseEntireRow" className="font-normal">
              Group row spans entire row
            </Label>
          </div>
          
          <div className="flex items-center space-x-2 pt-2">
            <Checkbox 
              id="groupSelectsChildren" 
              checked={!!localSettings.groupSelectsChildren}
              onCheckedChange={(checked) => handleCheckboxChange('groupSelectsChildren', !!checked)} 
            />
            <Label htmlFor="groupSelectsChildren" className="font-normal">
              Selecting group selects children
            </Label>
          </div>
          
          <div className="flex items-center space-x-2 pt-2">
            <Checkbox 
              id="groupHideParentOfSingleChild" 
              checked={!!localSettings.groupHideParentOfSingleChild}
              onCheckedChange={(checked) => handleCheckboxChange('groupHideParentOfSingleChild', !!checked)} 
            />
            <Label htmlFor="groupHideParentOfSingleChild" className="font-normal">
              Hide parent of single child
            </Label>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Pivot Mode</CardTitle>
          <CardDescription>
            Configure pivot functionality (Enterprise).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="pivotMode" 
              checked={!!localSettings.pivotMode}
              onCheckedChange={(checked) => handleCheckboxChange('pivotMode', !!checked)} 
            />
            <Label htmlFor="pivotMode" className="font-normal">
              Enable pivot mode
            </Label>
            <p className="text-xs text-muted-foreground ml-6">
              When enabled, allows pivoting on columns.
            </p>
          </div>
          
          <div className="space-y-2 pt-2">
            <Label htmlFor="pivotPanelShow">Pivot Panel</Label>
            <Select
              value={getSelectValue(localSettings.pivotPanelShow, 'never')}
              onValueChange={(value) => handleSelectChange('pivotPanelShow', value === 'never' ? '' : value)}
              disabled={!localSettings.pivotMode}
            >
              <SelectTrigger id="pivotPanelShow">
                <SelectValue placeholder="Select when to show" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="never">Never</SelectItem>
                <SelectItem value="always">Always</SelectItem>
                <SelectItem value="onlyWhenPivoting">Only When Pivoting</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              When to show the pivot panel.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 