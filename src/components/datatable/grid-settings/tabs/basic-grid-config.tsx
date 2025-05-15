import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
              <Badge variant="outline" className="ml-1.5 text-amber-500 border-amber-200 bg-amber-50/50 dark:bg-amber-950/20 py-0 px-1.5 h-5 text-[10px] font-medium">
                <InfoCircledIcon className="h-2.5 w-2.5 mr-0.5" />
                Init-only
              </Badge>
            </TooltipTrigger>
            <TooltipContent side="right" className="max-w-[200px] text-xs">
              <p>
                This property can only be set during initialization. Changes will apply when the grid is reinitialized.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center mb-2">
        <h3 className="text-base font-medium">Basic Grid Configuration</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center">
            <Label htmlFor="rowHeight" className="text-sm font-medium">Row Height</Label>
            {renderInitBadge('rowHeight')}
          </div>
          <Input
            id="rowHeight"
            type="number"
            value={localSettings.rowHeight === undefined ? '' : localSettings.rowHeight}
            onChange={(e) => handleNumberChange('rowHeight', e.target.value)}
            placeholder="Auto"
            min={1}
            className="h-8 text-sm"
          />
          <p className="text-[11px] text-muted-foreground">Height of grid rows in pixels</p>
        </div>
        
        <div className="space-y-1.5">
          <div className="flex items-center">
            <Label htmlFor="headerHeight" className="text-sm font-medium">Header Height</Label>
            {renderInitBadge('headerHeight')}
          </div>
          <Input
            id="headerHeight"
            type="number"
            value={localSettings.headerHeight === undefined ? '' : localSettings.headerHeight}
            onChange={(e) => handleNumberChange('headerHeight', e.target.value)}
            placeholder="Auto"
            min={1}
            className="h-8 text-sm"
          />
          <p className="text-[11px] text-muted-foreground">Height of column headers in pixels</p>
        </div>
      </div>
      
      <div className="space-y-1.5 pt-1">
        <div className="flex items-center">
          <Label htmlFor="rowModelType" className="text-sm font-medium">Row Model Type</Label>
          {renderInitBadge('rowModelType')}
        </div>
        <Select
          value={localSettings.rowModelType || ''}
          onValueChange={(value) => handleSelectChange('rowModelType', value)}
        >
          <SelectTrigger id="rowModelType" className="h-8 text-sm">
            <SelectValue placeholder="Select row model type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="clientSide">Client Side</SelectItem>
            <SelectItem value="infinite">Infinite</SelectItem>
            <SelectItem value="serverSide">Server Side</SelectItem>
            <SelectItem value="viewport">Viewport</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-[11px] text-muted-foreground">
          Defines how data is loaded into the grid
        </p>
      </div>
    </div>
  );
} 