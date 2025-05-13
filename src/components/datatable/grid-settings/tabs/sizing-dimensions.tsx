import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface SizingDimensionsProps {
  settings: {
    headerHeight?: number;
    rowHeight?: number;
    floatingFiltersHeight?: number;
    pivotHeaderHeight?: number;
    pivotGroupHeaderHeight?: number;
    groupHeaderHeight?: number;
    suppressAutoSize?: boolean;
    suppressFillHandle?: boolean;
    suppressColumnVirtualisation?: boolean;
    suppressRowVirtualisation?: boolean;
  };
  onChange: (option: string, value: any) => void;
  initialProperties?: string[];
}

export function SizingDimensions({ settings, onChange }: SizingDimensionsProps) {
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
          <CardTitle>Heights</CardTitle>
          <CardDescription>
            Configure height dimensions for different grid components.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="rowHeight">Row Height (px)</Label>
            <Input
              id="rowHeight"
              type="number"
              value={localSettings.rowHeight || ''}
              onChange={(e) => handleNumberChange('rowHeight', e.target.value)}
              placeholder="Default"
              min={1}
            />
            <p className="text-xs text-muted-foreground">
              Height in pixels for each row. Default varies by theme.
            </p>
          </div>
          
          <div className="space-y-2 pt-2">
            <Label htmlFor="headerHeight">Header Height (px)</Label>
            <Input
              id="headerHeight"
              type="number"
              value={localSettings.headerHeight || ''}
              onChange={(e) => handleNumberChange('headerHeight', e.target.value)}
              placeholder="Default"
              min={1}
            />
            <p className="text-xs text-muted-foreground">
              Height in pixels for the header row. Default varies by theme.
            </p>
          </div>
          
          <div className="space-y-2 pt-2">
            <Label htmlFor="floatingFiltersHeight">Floating Filters Height (px)</Label>
            <Input
              id="floatingFiltersHeight"
              type="number"
              value={localSettings.floatingFiltersHeight || ''}
              onChange={(e) => handleNumberChange('floatingFiltersHeight', e.target.value)}
              placeholder="Default"
              min={1}
            />
          </div>
          
          <div className="space-y-2 pt-2">
            <Label htmlFor="groupHeaderHeight">Group Header Height (px)</Label>
            <Input
              id="groupHeaderHeight"
              type="number"
              value={localSettings.groupHeaderHeight || ''}
              onChange={(e) => handleNumberChange('groupHeaderHeight', e.target.value)}
              placeholder="Default"
              min={1}
            />
          </div>
          
          <div className="space-y-2 pt-2">
            <Label htmlFor="pivotHeaderHeight">Pivot Header Height (px)</Label>
            <Input
              id="pivotHeaderHeight"
              type="number"
              value={localSettings.pivotHeaderHeight || ''}
              onChange={(e) => handleNumberChange('pivotHeaderHeight', e.target.value)}
              placeholder="Default"
              min={1}
            />
          </div>
          
          <div className="space-y-2 pt-2">
            <Label htmlFor="pivotGroupHeaderHeight">Pivot Group Header Height (px)</Label>
            <Input
              id="pivotGroupHeaderHeight"
              type="number"
              value={localSettings.pivotGroupHeaderHeight || ''}
              onChange={(e) => handleNumberChange('pivotGroupHeaderHeight', e.target.value)}
              placeholder="Default"
              min={1}
            />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Virtualization</CardTitle>
          <CardDescription>
            Configure virtualization settings for performance.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="suppressColumnVirtualisation" 
              checked={!!localSettings.suppressColumnVirtualisation}
              onCheckedChange={(checked) => handleCheckboxChange('suppressColumnVirtualisation', !!checked)} 
            />
            <Label htmlFor="suppressColumnVirtualisation" className="font-normal">
              Disable column virtualization
            </Label>
            <p className="text-xs text-muted-foreground ml-6">
              Renders all columns regardless of visibility.
            </p>
          </div>
          
          <div className="flex items-center space-x-2 pt-2">
            <Checkbox 
              id="suppressRowVirtualisation" 
              checked={!!localSettings.suppressRowVirtualisation}
              onCheckedChange={(checked) => handleCheckboxChange('suppressRowVirtualisation', !!checked)} 
            />
            <Label htmlFor="suppressRowVirtualisation" className="font-normal">
              Disable row virtualization
            </Label>
            <p className="text-xs text-muted-foreground ml-6">
              Renders all rows regardless of visibility.
            </p>
          </div>
          
          <div className="flex items-center space-x-2 pt-2">
            <Checkbox 
              id="suppressAutoSize" 
              checked={!!localSettings.suppressAutoSize}
              onCheckedChange={(checked) => handleCheckboxChange('suppressAutoSize', !!checked)} 
            />
            <Label htmlFor="suppressAutoSize" className="font-normal">
              Disable column auto-sizing
            </Label>
          </div>
          
          <div className="flex items-center space-x-2 pt-2">
            <Checkbox 
              id="suppressFillHandle" 
              checked={!!localSettings.suppressFillHandle}
              onCheckedChange={(checked) => handleCheckboxChange('suppressFillHandle', !!checked)} 
            />
            <Label htmlFor="suppressFillHandle" className="font-normal">
              Disable cell fill handle
            </Label>
            <p className="text-xs text-muted-foreground ml-6">
              Hides the Excel-like fill handle for drag-filling values.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 