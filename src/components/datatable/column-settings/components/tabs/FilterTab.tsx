import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { InfoIcon } from "lucide-react";
import { FilterSettings } from "../../types";

interface FilterTabProps {
  settings: FilterSettings;
  onSettingsChange: (settings: FilterSettings) => void;
  isModified: boolean;
  bulkUpdateMode: boolean;
  columnType?: string;
}

export function FilterTab({
  settings,
  onSettingsChange,
  isModified,
  bulkUpdateMode,
  columnType
}: FilterTabProps) {
  const updateSettings = (update: Partial<FilterSettings>) => {
    onSettingsChange({ ...settings, ...update });
  };

  const getFilterTypeOptions = () => {
    const baseOptions = [
      { value: 'agTextColumnFilter', label: 'Text' },
      { value: 'agNumberColumnFilter', label: 'Number' },
      { value: 'agDateColumnFilter', label: 'Date' },
      { value: 'agSetColumnFilter', label: 'Set' },
    ];

    // Add appropriate filter types based on column type
    if (columnType === 'boolean') {
      baseOptions.push({ value: 'agBooleanColumnFilter', label: 'Boolean' });
    }

    return baseOptions;
  };

  return (
    <div className="space-y-6">
      {bulkUpdateMode && (
        <Alert className="bg-blue-50 border-blue-200">
          <InfoIcon className="h-4 w-4" />
          <AlertDescription>
            These settings will be applied to all selected columns
          </AlertDescription>
        </Alert>
      )}
      
      {isModified && (
        <Badge variant="outline" className="mb-4">Modified</Badge>
      )}

      {/* Filter Type */}
      <Card className="p-4">
        <h4 className="text-sm font-semibold mb-4">Filter Type</h4>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-normal">Filter Type</Label>
            <Select
              value={settings.filter || 'agTextColumnFilter'}
              onValueChange={(value) => updateSettings({ filter: value })}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {getFilterTypeOptions().map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="floatingFilter"
              checked={settings.floatingFilter || false}
              onCheckedChange={(checked) => updateSettings({ floatingFilter: !!checked })}
            />
            <Label htmlFor="floatingFilter" className="text-sm font-normal">
              Show floating filter
            </Label>
          </div>
        </div>
      </Card>

      {/* Filter Options */}
      <Card className="p-4">
        <h4 className="text-sm font-semibold mb-4">Filter Options</h4>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="filterable"
              checked={settings.filterable !== false}
              onCheckedChange={(checked) => updateSettings({ filterable: checked })}
            />
            <Label htmlFor="filterable" className="text-sm font-normal">
              Allow filtering
            </Label>
          </div>

          <div className="flex items-center justify-between">
            <Label className="text-sm font-normal">Filter Menu Tab</Label>
            <Select
              value={settings.filterMenuTab || 'filtersTab'}
              onValueChange={(value) => updateSettings({ filterMenuTab: value })}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="filtersTab">Filters</SelectItem>
                <SelectItem value="generalTab">General</SelectItem>
                <SelectItem value="columnsTab">Columns</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="suppressFilterButton"
              checked={settings.suppressFilterButton || false}
              onCheckedChange={(checked) => updateSettings({ suppressFilterButton: !!checked })}
            />
            <Label htmlFor="suppressFilterButton" className="text-sm font-normal">
              Hide filter button
            </Label>
          </div>
        </div>
      </Card>

      {/* Quick Filter */}
      <Card className="p-4">
        <h4 className="text-sm font-semibold mb-4">Quick Filter</h4>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="includeInQuickFilter"
              checked={settings.includeInQuickFilter !== false}
              onCheckedChange={(checked) => updateSettings({ includeInQuickFilter: checked })}
            />
            <Label htmlFor="includeInQuickFilter" className="text-sm font-normal">
              Include in quick filter
            </Label>
          </div>

          <div className="flex items-center justify-between">
            <Label className="text-sm font-normal">Quick Filter Text</Label>
            <Input
              type="text"
              value={settings.quickFilterText || ''}
              onChange={(e) => updateSettings({ quickFilterText: e.target.value })}
              placeholder="Custom text"
              className="w-40"
            />
          </div>
        </div>
      </Card>

      {/* Advanced Filter Settings */}
      <Card className="p-4">
        <h4 className="text-sm font-semibold mb-4">Advanced Filter Settings</h4>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-normal">Default Filter Option</Label>
            <Select
              value={settings.defaultFilterOption || 'contains'}
              onValueChange={(value) => updateSettings({ defaultFilterOption: value })}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="contains">Contains</SelectItem>
                <SelectItem value="equals">Equals</SelectItem>
                <SelectItem value="startsWith">Starts With</SelectItem>
                <SelectItem value="endsWith">Ends With</SelectItem>
                <SelectItem value="notEqual">Not Equal</SelectItem>
                <SelectItem value="notContains">Not Contains</SelectItem>
                <SelectItem value="greaterThan">Greater Than</SelectItem>
                <SelectItem value="lessThan">Less Than</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="caseSensitive"
              checked={settings.caseSensitive || false}
              onCheckedChange={(checked) => updateSettings({ caseSensitive: !!checked })}
            />
            <Label htmlFor="caseSensitive" className="text-sm font-normal">
              Case sensitive filtering
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="suppressKeyboardEvent"
              checked={settings.suppressKeyboardEvent || false}
              onCheckedChange={(checked) => updateSettings({ suppressKeyboardEvent: !!checked })}
            />
            <Label htmlFor="suppressKeyboardEvent" className="text-sm font-normal">
              Suppress keyboard events in filter
            </Label>
          </div>
        </div>
      </Card>
    </div>
  );
}