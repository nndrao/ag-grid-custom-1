import React, { useState, useEffect } from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

interface FilterTabProps {
  settings: any;
  onSettingsChange: (updates: Partial<FilterSettings>) => void;
  isModified?: boolean;
  bulkUpdateMode?: boolean;
}

interface FilterSettings {
  enableFilter: boolean;
  enableFloatingFilter: boolean;
  filterType: string;
  // Text Filter
  textDefaultOption?: string;
  textCaseSensitive?: boolean;
  // Number Filter
  numberDefaultOption?: string;
  numberAllowedCharPattern?: string;
  // Date Filter  
  dateDefaultOption?: string;
  useBrowserDatePicker?: boolean;
  dateMinYear?: number;
  dateMaxYear?: number;
  // Set Filter
  setSelectAllOnMiniFilter?: boolean;
  setEnableSearch?: boolean;
  // Multi Filter
  multiFilterTypes?: string[];
  // Common Settings
  showFilterButtons?: boolean;
  closeOnApply?: boolean;
  debounceMs?: number;
}

export function FilterTab({ settings, onSettingsChange, isModified, bulkUpdateMode }: FilterTabProps) {
  const [filterSettings, setFilterSettings] = useState<FilterSettings>({
    enableFilter: settings.enableFilter ?? true,
    enableFloatingFilter: settings.enableFloatingFilter ?? false,
    filterType: settings.filterType || 'text',
    // Text Filter
    textDefaultOption: settings.textDefaultOption || 'contains',
    textCaseSensitive: settings.textCaseSensitive ?? false,
    // Number Filter
    numberDefaultOption: settings.numberDefaultOption || 'equals',
    numberAllowedCharPattern: settings.numberAllowedCharPattern || '[\\d\\-\\+\\.]',
    // Date Filter
    dateDefaultOption: settings.dateDefaultOption || 'equals',
    useBrowserDatePicker: settings.useBrowserDatePicker ?? true,
    dateMinYear: settings.dateMinYear || 1900,
    dateMaxYear: settings.dateMaxYear || 2100,
    // Set Filter
    setSelectAllOnMiniFilter: settings.setSelectAllOnMiniFilter ?? true,
    setEnableSearch: settings.setEnableSearch ?? true,
    // Multi Filter
    multiFilterTypes: settings.multiFilterTypes || ['text', 'number'],
    // Common Settings
    showFilterButtons: settings.showFilterButtons ?? true,
    closeOnApply: settings.closeOnApply ?? true,
    debounceMs: settings.debounceMs || 200
  });

  useEffect(() => {
    setFilterSettings({
      enableFilter: settings.enableFilter ?? true,
      enableFloatingFilter: settings.enableFloatingFilter ?? false,
      filterType: settings.filterType || 'text',
      // Text Filter
      textDefaultOption: settings.textDefaultOption || 'contains',
      textCaseSensitive: settings.textCaseSensitive ?? false,
      // Number Filter
      numberDefaultOption: settings.numberDefaultOption || 'equals',
      numberAllowedCharPattern: settings.numberAllowedCharPattern || '[\\d\\-\\+\\.]',
      // Date Filter
      dateDefaultOption: settings.dateDefaultOption || 'equals',
      useBrowserDatePicker: settings.useBrowserDatePicker ?? true,
      dateMinYear: settings.dateMinYear || 1900,
      dateMaxYear: settings.dateMaxYear || 2100,
      // Set Filter
      setSelectAllOnMiniFilter: settings.setSelectAllOnMiniFilter ?? true,
      setEnableSearch: settings.setEnableSearch ?? true,
      // Multi Filter
      multiFilterTypes: settings.multiFilterTypes || ['text', 'number'],
      // Common Settings
      showFilterButtons: settings.showFilterButtons ?? true,
      closeOnApply: settings.closeOnApply ?? true,
      debounceMs: settings.debounceMs || 200
    });
  }, [settings]);

  const updateFilterSetting = (key: keyof FilterSettings, value: any) => {
    const newSettings = { ...filterSettings, [key]: value };
    setFilterSettings(newSettings);
    onSettingsChange({ [key]: value });
  };

  const toggleMultiFilterType = (type: string) => {
    const currentTypes = filterSettings.multiFilterTypes || [];
    const newTypes = currentTypes.includes(type)
      ? currentTypes.filter(t => t !== type)
      : [...currentTypes, type];
    updateFilterSetting('multiFilterTypes', newTypes);
  };

  return (
    <div className="space-y-3">
      {/* Basic Settings */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label htmlFor="enable-filter" className="text-xs">Enable Filter</Label>
          <Checkbox 
            id="enable-filter"
            checked={filterSettings.enableFilter}
            onCheckedChange={(checked) => updateFilterSetting('enableFilter', checked)}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <Label htmlFor="enable-floating-filter" className="text-xs">Enable Floating Filter</Label>
          <Checkbox 
            id="enable-floating-filter"
            checked={filterSettings.enableFloatingFilter}
            onCheckedChange={(checked) => updateFilterSetting('enableFloatingFilter', checked)}
          />
        </div>
        
        <div>
          <Label className="text-xs mb-1 block">Filter Type</Label>
          <Select 
            value={filterSettings.filterType}
            onValueChange={(value) => updateFilterSetting('filterType', value)}
            disabled={!filterSettings.enableFilter}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="text">Text</SelectItem>
              <SelectItem value="number">Number</SelectItem>
              <SelectItem value="date">Date</SelectItem>
              <SelectItem value="set">Set</SelectItem>
              <SelectItem value="multi">Multi</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Text Filter Options */}
      {filterSettings.filterType === 'text' && (
        <div className="space-y-3 pt-3 border-t">
          <h4 className="text-xs font-semibold">Text Filter Options</h4>
          <div>
            <Label className="text-xs mb-1 block">Default Option</Label>
            <Select 
              value={filterSettings.textDefaultOption}
              onValueChange={(value) => updateFilterSetting('textDefaultOption', value)}
              disabled={!filterSettings.enableFilter}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="contains">Contains</SelectItem>
                <SelectItem value="equals">Equals</SelectItem>
                <SelectItem value="startsWith">Starts With</SelectItem>
                <SelectItem value="endsWith">Ends With</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="text-case-sensitive" className="text-xs">Case Sensitive</Label>
            <Checkbox 
              id="text-case-sensitive"
              checked={filterSettings.textCaseSensitive}
              onCheckedChange={(checked) => updateFilterSetting('textCaseSensitive', checked)}
              disabled={!filterSettings.enableFilter}
            />
          </div>
        </div>
      )}

      {/* Number Filter Options */}
      {filterSettings.filterType === 'number' && (
        <div className="space-y-3 pt-3 border-t">
          <h4 className="text-xs font-semibold">Number Filter Options</h4>
          <div>
            <Label className="text-xs mb-1 block">Default Option</Label>
            <Select 
              value={filterSettings.numberDefaultOption}
              onValueChange={(value) => updateFilterSetting('numberDefaultOption', value)}
              disabled={!filterSettings.enableFilter}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="equals">Equals</SelectItem>
                <SelectItem value="notEqual">Not Equal</SelectItem>
                <SelectItem value="lessThan">Less Than</SelectItem>
                <SelectItem value="lessThanOrEqual">Less Than or Equal</SelectItem>
                <SelectItem value="greaterThan">Greater Than</SelectItem>
                <SelectItem value="greaterThanOrEqual">Greater Than or Equal</SelectItem>
                <SelectItem value="inRange">In Range</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label className="text-xs mb-1 block">Allowed Characters</Label>
            <Input
              type="text"
              value={filterSettings.numberAllowedCharPattern}
              onChange={(e) => updateFilterSetting('numberAllowedCharPattern', e.target.value)}
              placeholder="Regex pattern"
              className="h-8 text-xs"
              disabled={!filterSettings.enableFilter}
            />
          </div>
        </div>
      )}

      {/* Date Filter Options */}
      {filterSettings.filterType === 'date' && (
        <div className="space-y-3 pt-3 border-t">
          <h4 className="text-xs font-semibold">Date Filter Options</h4>
          <div>
            <Label className="text-xs mb-1 block">Default Option</Label>
            <Select 
              value={filterSettings.dateDefaultOption}
              onValueChange={(value) => updateFilterSetting('dateDefaultOption', value)}
              disabled={!filterSettings.enableFilter}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="equals">Equals</SelectItem>
                <SelectItem value="notEqual">Not Equal</SelectItem>
                <SelectItem value="before">Before</SelectItem>
                <SelectItem value="after">After</SelectItem>
                <SelectItem value="inRange">In Range</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="browser-date-picker" className="text-xs">Browser Date Picker</Label>
            <Checkbox 
              id="browser-date-picker"
              checked={filterSettings.useBrowserDatePicker}
              onCheckedChange={(checked) => updateFilterSetting('useBrowserDatePicker', checked)}
              disabled={!filterSettings.enableFilter}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs mb-1 block">Min Year</Label>
              <Input
                type="number"
                value={filterSettings.dateMinYear}
                onChange={(e) => updateFilterSetting('dateMinYear', parseInt(e.target.value) || 1900)}
                className="h-8 text-xs"
                disabled={!filterSettings.enableFilter}
              />
            </div>
            <div>
              <Label className="text-xs mb-1 block">Max Year</Label>
              <Input
                type="number"
                value={filterSettings.dateMaxYear}
                onChange={(e) => updateFilterSetting('dateMaxYear', parseInt(e.target.value) || 2100)}
                className="h-8 text-xs"
                disabled={!filterSettings.enableFilter}
              />
            </div>
          </div>
        </div>
      )}

      {/* Set Filter Options */}
      {filterSettings.filterType === 'set' && (
        <div className="space-y-3 pt-3 border-t">
          <h4 className="text-xs font-semibold">Set Filter Options</h4>
          <div className="flex items-center justify-between">
            <Label htmlFor="select-all-mini-filter" className="text-xs">Select All on Mini Filter</Label>
            <Checkbox 
              id="select-all-mini-filter"
              checked={filterSettings.setSelectAllOnMiniFilter}
              onCheckedChange={(checked) => updateFilterSetting('setSelectAllOnMiniFilter', checked)}
              disabled={!filterSettings.enableFilter}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="set-enable-search" className="text-xs">Enable Search</Label>
            <Checkbox 
              id="set-enable-search"
              checked={filterSettings.setEnableSearch}
              onCheckedChange={(checked) => updateFilterSetting('setEnableSearch', checked)}
              disabled={!filterSettings.enableFilter}
            />
          </div>
        </div>
      )}

      {/* Multi Filter Options */}
      {filterSettings.filterType === 'multi' && (
        <div className="space-y-3 pt-3 border-t">
          <h4 className="text-xs font-semibold">Multi Filter Options</h4>
          <Label className="text-xs mb-1 block">Filter Types</Label>
          <div className="space-y-2">
            {['text', 'number', 'date', 'set'].map(type => (
              <div key={type} className="flex items-center justify-between">
                <Label htmlFor={`multi-${type}`} className="text-xs">{type.charAt(0).toUpperCase() + type.slice(1)}</Label>
                <Checkbox 
                  id={`multi-${type}`}
                  checked={filterSettings.multiFilterTypes?.includes(type) || false}
                  onCheckedChange={() => toggleMultiFilterType(type)}
                  disabled={!filterSettings.enableFilter}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Common Settings */}
      <div className="space-y-3 pt-3 border-t">
        <h4 className="text-xs font-semibold">Common Settings</h4>
        <div className="flex items-center justify-between">
          <Label htmlFor="show-filter-buttons" className="text-xs">Show Filter Buttons</Label>
          <Checkbox 
            id="show-filter-buttons"
            checked={filterSettings.showFilterButtons}
            onCheckedChange={(checked) => updateFilterSetting('showFilterButtons', checked)}
            disabled={!filterSettings.enableFilter}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <Label htmlFor="close-on-apply" className="text-xs">Close on Apply</Label>
          <Checkbox 
            id="close-on-apply"
            checked={filterSettings.closeOnApply}
            onCheckedChange={(checked) => updateFilterSetting('closeOnApply', checked)}
            disabled={!filterSettings.enableFilter}
          />
        </div>
        
        <div>
          <Label className="text-xs mb-1 block">Debounce (ms)</Label>
          <Input
            type="number"
            min="0"
            max="5000"
            value={filterSettings.debounceMs}
            onChange={(e) => updateFilterSetting('debounceMs', parseInt(e.target.value) || 0)}
            className="h-8 text-xs"
            disabled={!filterSettings.enableFilter}
          />
        </div>
      </div>
    </div>
  );
}