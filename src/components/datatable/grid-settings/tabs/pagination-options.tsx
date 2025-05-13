import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Plus } from 'lucide-react';

interface PaginationOptionsProps {
  settings: {
    pagination?: boolean;
    paginationPageSize?: number;
    paginationAutoPageSize?: boolean;
    suppressPaginationPanel?: boolean;
    paginationPageSizeSelector?: number[];
  };
  onChange: (option: string, value: any) => void;
  initialProperties?: string[];
}

export function PaginationOptions({ settings, onChange }: PaginationOptionsProps) {
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

  // Manage page size selector array - ensure default is an array
  const defaultPageSizes = [10, 20, 50, 100];
  const [pageSizes, setPageSizes] = useState<number[]>(() => {
    // Make sure paginationPageSizeSelector is an array
    if (Array.isArray(localSettings.paginationPageSizeSelector) && 
        localSettings.paginationPageSizeSelector.length > 0) {
      return localSettings.paginationPageSizeSelector;
    }
    return defaultPageSizes;
  });
  const [newPageSize, setNewPageSize] = useState('');

  // Update from props
  useEffect(() => {
    // Only update if paginationPageSizeSelector is a valid array
    if (Array.isArray(localSettings.paginationPageSizeSelector) && 
        localSettings.paginationPageSizeSelector.length > 0) {
      setPageSizes(localSettings.paginationPageSizeSelector);
    }
  }, [localSettings.paginationPageSizeSelector]);

  // Add new page size
  const addPageSize = () => {
    if (!newPageSize) return;
    
    const size = parseInt(newPageSize, 10);
    if (isNaN(size) || size <= 0) return;
    
    const newSizes = [...pageSizes, size].sort((a, b) => a - b);
    setPageSizes(newSizes);
    handlePageSizesChange(newSizes);
    setNewPageSize('');
  };

  // Remove page size
  const removePageSize = (index: number) => {
    const newSizes = pageSizes.filter((_, i) => i !== index);
    setPageSizes(newSizes);
    handlePageSizesChange(newSizes);
  };

  // Update parent on page sizes change
  const handlePageSizesChange = (newSizes: number[]) => {
    setLocalSettings(prev => ({ ...prev, paginationPageSizeSelector: newSizes }));
    onChange('paginationPageSizeSelector', newSizes);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Pagination Settings</CardTitle>
          <CardDescription>
            Configure how data is paginated in the grid.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="pagination" 
              checked={!!localSettings.pagination}
              onCheckedChange={(checked) => handleCheckboxChange('pagination', !!checked)} 
            />
            <Label htmlFor="pagination" className="font-normal">
              Enable pagination
            </Label>
          </div>
          
          <div className="space-y-2 pt-2">
            <Label htmlFor="paginationPageSize">Page Size</Label>
            <Input
              id="paginationPageSize"
              type="number"
              value={localSettings.paginationPageSize || ''}
              onChange={(e) => handleNumberChange('paginationPageSize', e.target.value)}
              placeholder="Default"
              min={1}
              disabled={!!localSettings.paginationAutoPageSize}
            />
            <p className="text-xs text-muted-foreground">
              Number of rows per page.
            </p>
          </div>
          
          <div className="flex items-center space-x-2 pt-2">
            <Checkbox 
              id="paginationAutoPageSize" 
              checked={!!localSettings.paginationAutoPageSize}
              onCheckedChange={(checked) => handleCheckboxChange('paginationAutoPageSize', !!checked)} 
            />
            <Label htmlFor="paginationAutoPageSize" className="font-normal">
              Automatically adjust page size based on grid height
            </Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="suppressPaginationPanel" 
              checked={!!localSettings.suppressPaginationPanel}
              onCheckedChange={(checked) => handleCheckboxChange('suppressPaginationPanel', !!checked)} 
            />
            <Label htmlFor="suppressPaginationPanel" className="font-normal">
              Hide pagination panel
            </Label>
          </div>
          
          <div className="space-y-2 pt-4">
            <Label>Page Size Selector Options</Label>
            <div className="flex flex-wrap gap-2 p-2 border rounded-md">
              {pageSizes.map((size, index) => (
                <div key={`${size}-${index}`} className="flex items-center bg-muted px-2 py-1 rounded-md">
                  <span>{size}</span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-5 w-5 ml-1"
                    onClick={() => removePageSize(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
              <div className="flex items-center">
                <Input
                  type="number"
                  value={newPageSize}
                  onChange={(e) => setNewPageSize(e.target.value)}
                  className="w-16 h-8"
                  min={1}
                  placeholder="Size"
                />
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 ml-1"
                  onClick={addPageSize}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  <span>Add</span>
                </Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Options available in the page size selector dropdown.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 