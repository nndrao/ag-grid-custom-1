import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface DataRenderingProps {
  settings: {
    rowBuffer?: number;
    valueCache?: boolean;
    immutableData?: boolean;
    enableCellChangeFlash?: boolean;
    asyncTransactionWaitMillis?: number;
  };
  onChange: (option: string, value: any) => void;
  initialProperties?: string[];
}

export function DataRendering({ settings, onChange }: DataRenderingProps) {
  const [localSettings, setLocalSettings] = useState(settings);
  
  // Update local state when settings prop changes
  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  // Handler for checkbox options
  const handleCheckboxChange = (option: string, checked: boolean) => {
    setLocalSettings(prev => ({ ...prev, [option]: checked }));
    if (option === 'immutableData') {
  // Do not pass immutableData to AG Grid
  return;
}
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
          <CardTitle>Performance Optimization</CardTitle>
          <CardDescription>
            Configure performance-related settings for data rendering.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="rowBuffer">Row Buffer</Label>
            <Input
              id="rowBuffer"
              type="number"
              value={localSettings.rowBuffer || ''}
              onChange={(e) => handleNumberChange('rowBuffer', e.target.value)}
              placeholder="Default"
              min={1}
            />
            <p className="text-xs text-muted-foreground">
              Number of rows rendered outside visible area (default: 10).
            </p>
          </div>
          
          <div className="flex items-center space-x-2 pt-2">
            <Checkbox 
              id="valueCache" 
              checked={!!localSettings.valueCache}
              onCheckedChange={(checked) => handleCheckboxChange('valueCache', !!checked)} 
            />
            <Label htmlFor="valueCache" className="font-normal">
              Enable value caching for rendering
            </Label>
            <p className="text-xs text-muted-foreground ml-6">
              Caches values to improve rendering performance.
            </p>
          </div>
          
          <div className="space-y-2 pt-2">
            <Label htmlFor="asyncTransactionWaitMillis">Async Transaction Wait</Label>
            <Input
              id="asyncTransactionWaitMillis"
              type="number"
              value={localSettings.asyncTransactionWaitMillis || ''}
              onChange={(e) => handleNumberChange('asyncTransactionWaitMillis', e.target.value)}
              placeholder="Default"
              min={0}
            />
            <p className="text-xs text-muted-foreground">
              Milliseconds to wait for asynchronous transaction batching (default: 50).
            </p>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Data Handling</CardTitle>
          <CardDescription>
            Configure how data is handled and processed.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="immutableData" 
              checked={!!localSettings.immutableData}
              onCheckedChange={(checked) => handleCheckboxChange('immutableData', !!checked)} 
            />
            <Label htmlFor="immutableData" className="font-normal">
              Treat data objects as immutable
            </Label>
            <p className="text-xs text-muted-foreground ml-6">
              When enabled, the grid optimizes for immutable data objects.
            </p>
          </div>
          
          <div className="flex items-center space-x-2 pt-2">
            <Checkbox 
              id="enableCellChangeFlash" 
              checked={!!localSettings.enableCellChangeFlash}
              onCheckedChange={(checked) => handleCheckboxChange('enableCellChangeFlash', !!checked)} 
            />
            <Label htmlFor="enableCellChangeFlash" className="font-normal">
              Flash cells when values change
            </Label>
            <p className="text-xs text-muted-foreground ml-6">
              Highlights cells with a background flash animation when their value changes.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 