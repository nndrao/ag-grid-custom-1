import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ColumnFeaturesProps {
  settings: {
    suppressDragLeaveHidesColumns?: boolean;
    suppressMovableColumns?: boolean;
    suppressFieldDotNotation?: boolean;
    suppressAutoSize?: boolean;
  };
  onChange: (option: string, value: any) => void;
  initialProperties?: string[];
}

export function ColumnFeatures({ settings, onChange }: ColumnFeaturesProps) {
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Column Behavior</CardTitle>
          <CardDescription>
            Configure how columns behave in the grid.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="suppressMovableColumns" 
              checked={!!localSettings.suppressMovableColumns}
              onCheckedChange={(checked) => handleCheckboxChange('suppressMovableColumns', !!checked)} 
            />
            <Label htmlFor="suppressMovableColumns" className="font-normal">
              Prevent column moving
            </Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="suppressDragLeaveHidesColumns" 
              checked={!!localSettings.suppressDragLeaveHidesColumns}
              onCheckedChange={(checked) => handleCheckboxChange('suppressDragLeaveHidesColumns', !!checked)} 
            />
            <Label htmlFor="suppressDragLeaveHidesColumns" className="font-normal">
              Prevent column hiding when dragged out of grid
            </Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="suppressAutoSize" 
              checked={!!localSettings.suppressAutoSize}
              onCheckedChange={(checked) => handleCheckboxChange('suppressAutoSize', !!checked)} 
            />
            <Label htmlFor="suppressAutoSize" className="font-normal">
              Prevent automatic column sizing
            </Label>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Data Handling</CardTitle>
          <CardDescription>
            Configure how column data is accessed and handled.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="suppressFieldDotNotation" 
              checked={!!localSettings.suppressFieldDotNotation}
              onCheckedChange={(checked) => handleCheckboxChange('suppressFieldDotNotation', !!checked)} 
            />
            <Label htmlFor="suppressFieldDotNotation" className="font-normal">
              Disable dot notation for accessing nested properties
            </Label>
            <p className="text-xs text-muted-foreground ml-6">
              When enabled, columns cannot use 'address.city' to access nested data.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 