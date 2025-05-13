import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Plus } from 'lucide-react';

interface SortingFilteringProps {
  settings: {
    sortingOrder?: string[];
    multiSortKey?: string;
    accentedSort?: boolean;
    enableAdvancedFilter?: boolean;
    quickFilterText?: string;
    cacheQuickFilter?: boolean;
    excludeChildrenWhenTreeDataFiltering?: boolean;
  };
  onChange: (option: string, value: any) => void;
  initialProperties?: string[];
}

export function SortingFiltering({ settings, onChange }: SortingFilteringProps) {
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

  // Handler for text inputs
  const handleTextChange = (option: string, value: string) => {
    setLocalSettings(prev => ({ ...prev, [option]: value }));
    onChange(option, value);
  };

  // Handler for select inputs
  const handleSelectChange = (option: string, value: string) => {
    setLocalSettings(prev => ({ ...prev, [option]: value }));
    onChange(option, value);
  };

  // Handler for sorting order (array of values)
  const [sortOrder, setSortOrder] = useState<string[]>(
    localSettings.sortingOrder || ['asc', 'desc', null]
  );

  // Update sorting order
  useEffect(() => {
    if (localSettings.sortingOrder) {
      setSortOrder(localSettings.sortingOrder);
    }
  }, [localSettings.sortingOrder]);

  // Add sort option
  const addSortOption = (value: string) => {
    const newSortOrder = [...sortOrder, value];
    setSortOrder(newSortOrder);
    handleSortOrderChange(newSortOrder);
  };

  // Remove sort option
  const removeSortOption = (index: number) => {
    const newSortOrder = sortOrder.filter((_, i) => i !== index);
    setSortOrder(newSortOrder);
    handleSortOrderChange(newSortOrder);
  };

  // Update parent on sort order change
  const handleSortOrderChange = (newSortOrder: string[]) => {
    setLocalSettings(prev => ({ ...prev, sortingOrder: newSortOrder }));
    onChange('sortingOrder', newSortOrder);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Sorting Options</CardTitle>
          <CardDescription>
            Configure how data is sorted in the grid.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Sorting Order</Label>
            <div className="flex flex-wrap gap-2 p-2 border rounded-md">
              {sortOrder.map((option, index) => (
                <div key={`${option}-${index}`} className="flex items-center bg-muted px-2 py-1 rounded-md">
                  <span>{option === null ? 'None' : option}</span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-5 w-5 ml-1"
                    onClick={() => removeSortOption(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
              <Select onValueChange={(value) => addSortOption(value === 'null' ? null : value)}>
                <SelectTrigger className="w-24 h-8">
                  <Plus className="h-4 w-4 mr-1" />
                  <span>Add</span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asc">Ascending</SelectItem>
                  <SelectItem value="desc">Descending</SelectItem>
                  <SelectItem value="null">None</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <p className="text-xs text-muted-foreground">
              Order of sort cycles when clicking column headers.
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="multiSortKey">Multi-Column Sort Key</Label>
            <Select
              value={localSettings.multiSortKey || 'ctrl'}
              onValueChange={(value) => handleSelectChange('multiSortKey', value)}
            >
              <SelectTrigger id="multiSortKey">
                <SelectValue placeholder="Select key for multi-sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ctrl">Ctrl</SelectItem>
                <SelectItem value="shift">Shift</SelectItem>
                <SelectItem value="alt">Alt</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Key to hold for multi-column sorting.
            </p>
          </div>
          
          <div className="flex items-center space-x-2 pt-2">
            <Checkbox 
              id="accentedSort" 
              checked={!!localSettings.accentedSort}
              onCheckedChange={(checked) => handleCheckboxChange('accentedSort', !!checked)} 
            />
            <Label htmlFor="accentedSort" className="font-normal">
              Use locale-specific rules for sorting accented characters
            </Label>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Filtering Options</CardTitle>
          <CardDescription>
            Configure how data filtering works in the grid.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="enableAdvancedFilter" 
              checked={!!localSettings.enableAdvancedFilter}
              onCheckedChange={(checked) => handleCheckboxChange('enableAdvancedFilter', !!checked)} 
            />
            <Label htmlFor="enableAdvancedFilter" className="font-normal">
              Enable Advanced Filter (Enterprise)
            </Label>
          </div>
          
          <div className="space-y-2 pt-2">
            <Label htmlFor="quickFilterText">Quick Filter Text</Label>
            <Input
              id="quickFilterText"
              value={localSettings.quickFilterText || ''}
              onChange={(e) => handleTextChange('quickFilterText', e.target.value)}
              placeholder="Enter text to filter across all columns"
            />
            <p className="text-xs text-muted-foreground">
              Text for quick filtering across all columns.
            </p>
          </div>
          
          <div className="flex items-center space-x-2 pt-2">
            <Checkbox 
              id="cacheQuickFilter" 
              checked={!!localSettings.cacheQuickFilter}
              onCheckedChange={(checked) => handleCheckboxChange('cacheQuickFilter', !!checked)} 
            />
            <Label htmlFor="cacheQuickFilter" className="font-normal">
              Cache quick filter results for better performance
            </Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="excludeChildrenWhenTreeDataFiltering" 
              checked={!!localSettings.excludeChildrenWhenTreeDataFiltering}
              onCheckedChange={(checked) => handleCheckboxChange('excludeChildrenWhenTreeDataFiltering', !!checked)} 
            />
            <Label htmlFor="excludeChildrenWhenTreeDataFiltering" className="font-normal">
              Exclude children when filtering tree data
            </Label>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 