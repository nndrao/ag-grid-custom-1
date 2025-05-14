import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { InfoCircledIcon } from '@radix-ui/react-icons';

interface BasicGridConfigProps {
  settings: {
    rowHeight?: number;
    headerHeight?: number;
    rowModelType?: string;
  };
  onChange: (option: string, value: any) => void;
  initialProperties?: string[];
}

export function BasicGridConfig({ settings, onChange, initialProperties = [] }: BasicGridConfigProps) {
  const [localSettings, setLocalSettings] = useState(settings);
  
  // Update local state when settings prop changes
  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  // Handler for number inputs
  const handleNumberChange = (option: string, value: string) => {
    const numValue = value ? parseInt(value, 10) : undefined;
    setLocalSettings(prev => ({ ...prev, [option]: numValue }));
    onChange(option, numValue);
  };

  // Handler for select inputs
  const handleSelectChange = (option: string, value: string) => {
    setLocalSettings(prev => ({ ...prev, [option]: value || undefined }));
    onChange(option, value || undefined);
  };

  // Helper to check if a property is initialization-only
  const isInitProperty = (property: string): boolean => {
    return initialProperties.includes(property);
  };

  // Render initialization-only badge with tooltip
  const renderInitBadge = (property: string) => {
    if (isInitProperty(property)) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className="ml-2 text-amber-500 border-amber-200 bg-amber-50 dark:bg-amber-950/30">
                <InfoCircledIcon className="h-3 w-3 mr-1" />
                Init-only
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs">
                This property can only be set when the grid is initialized. Changes will be saved but will only take effect when the grid is reinitialized.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Basic Grid Configuration</CardTitle>
          <CardDescription>
            Configure fundamental grid behavior and layout.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center">
              <Label htmlFor="rowHeight">Row Height (px)</Label>
              {renderInitBadge('rowHeight')}
            </div>
            <Input
              id="rowHeight"
              type="number"
              value={localSettings.rowHeight === undefined ? '' : localSettings.rowHeight}
              onChange={(e) => handleNumberChange('rowHeight', e.target.value)}
              placeholder="Auto"
              min={1}
            />
          </div>
          
          <div className="space-y-2 pt-2">
            <div className="flex items-center">
              <Label htmlFor="headerHeight">Header Height (px)</Label>
              {renderInitBadge('headerHeight')}
            </div>
            <Input
              id="headerHeight"
              type="number"
              value={localSettings.headerHeight === undefined ? '' : localSettings.headerHeight}
              onChange={(e) => handleNumberChange('headerHeight', e.target.value)}
              placeholder="Auto"
              min={1}
            />
          </div>
          
          <div className="space-y-2 pt-2">
            <div className="flex items-center">
              <Label htmlFor="rowModelType">Row Model Type</Label>
              {renderInitBadge('rowModelType')}
            </div>
            <Select
              value={localSettings.rowModelType || ''}
              onValueChange={(value) => handleSelectChange('rowModelType', value)}
            >
              <SelectTrigger id="rowModelType">
                <SelectValue placeholder="Select row model type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="clientSide">Client Side</SelectItem>
                <SelectItem value="infinite">Infinite</SelectItem>
                <SelectItem value="serverSide">Server Side</SelectItem>
                <SelectItem value="viewport">Viewport</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Defines how data is loaded into the grid. Default is 'clientSide'.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 