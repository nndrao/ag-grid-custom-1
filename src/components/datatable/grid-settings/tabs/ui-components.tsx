import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Plus, Settings as SettingsIcon } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';

interface StatusPanel {
  statusPanel: string;
  align?: 'left' | 'center' | 'right';
  statusPanelParams?: {
    aggFuncs?: string[];
  };
}

// Available aggregation functions for the agAggregationComponent
const AGGREGATION_FUNCTIONS = ['count', 'sum', 'min', 'max', 'avg'] as const;
type AggregationFunction = typeof AGGREGATION_FUNCTIONS[number];

// Add a type for panel-specific configuration
interface PanelConfig {
  component: StatusPanel['statusPanel'];
  supports: {
    align: boolean;
    aggFuncs?: boolean;
  };
  description: string;
}

// Define configurations for each panel type
const STATUS_PANEL_CONFIGS: Record<string, PanelConfig> = {
  'agTotalRowCountComponent': {
    component: 'agTotalRowCountComponent',
    supports: { align: true },
    description: 'Shows the total number of rows in the grid.'
  },
  'agFilteredRowCountComponent': {
    component: 'agFilteredRowCountComponent',
    supports: { align: true },
    description: 'Shows the count of rows that match the current filter criteria.'
  },
  'agSelectedRowCountComponent': {
    component: 'agSelectedRowCountComponent',
    supports: { align: true },
    description: 'Shows the count of selected rows.'
  },
  'agAggregationComponent': {
    component: 'agAggregationComponent',
    supports: { align: true, aggFuncs: true },
    description: 'Shows aggregations (sum, avg, etc.) for selected cells.'
  },
  'agTotalAndFilteredRowCountComponent': {
    component: 'agTotalAndFilteredRowCountComponent',
    supports: { align: true },
    description: 'Shows both the total row count and filtered row count.'
  }
};

interface UiComponentsProps {
  settings: {
    suppressContextMenu?: boolean;
    suppressMenuHide?: boolean;
    suppressMovableColumns?: boolean;
    enableRangeSelection?: boolean;
    suppressColumnMoveAnimation?: boolean;
    loading?: boolean; // Replaces suppressLoadingOverlay
    suppressNoRowsOverlay?: boolean;
    sideBar?: boolean | string;
    statusBar?: boolean | { statusPanels: StatusPanel[] };
  };
  onChange: (option: string, value: any) => void;
  initialProperties?: string[];
}

export function UiComponents({ settings, onChange }: UiComponentsProps) {
  const [localSettings, setLocalSettings] = useState(settings);
  
  // Track status panels separately for better user experience
  const [statusPanels, setStatusPanels] = useState<StatusPanel[]>(
    (typeof localSettings.statusBar === 'object' && localSettings.statusBar?.statusPanels) 
      ? [...localSettings.statusBar.statusPanels] 
      : []
  );
  
  // Update local state when settings prop changes
  useEffect(() => {
    setLocalSettings({...settings});
    
    // Update status panels
    if (typeof settings.statusBar === 'object' && settings.statusBar?.statusPanels) {
      setStatusPanels([...settings.statusBar.statusPanels]);
    } else {
      // Default panels when status bar is enabled but no panels are defined
      setStatusPanels([]);
    }
  }, [settings]);

  // Handler for checkbox options
  const handleCheckboxChange = (option: string, checked: boolean) => {
    setLocalSettings(prev => ({ ...prev, [option]: checked }));
    onChange(option, checked);
  };

  // Handler for select options
  const handleSelectChange = (option: string, value: string) => {
    setLocalSettings(prev => ({ ...prev, [option]: value }));
    onChange(option, value);
  };

  // Helper function for getting default value
  const getSideBarValue = (value: string | boolean | object | undefined) => {
    if (value === undefined || value === '') {
      return 'none';
    }
    
    // Handle boolean values
    if (typeof value === 'boolean') {
      return value ? 'true' : 'none';
    }
    
    // Handle object configurations (sideBar can be a complex object)
    if (typeof value === 'object' && value !== null) {
      // For now, just treat objects as 'true' - full object support would need more UI
      return 'true';
    }
    
    // If it's a string, use it directly
    return value;
  };

  // Special handler for sideBar which can be boolean, string, or object
  const handleSideBarChange = (value: string) => {
    if (value === 'none') {
      // Equivalent to not showing the sidebar
      onChange('sideBar', false);
    } else if (value === 'true') {
      // Default sidebar with standard tools
      onChange('sideBar', true);
    } else if (value === 'false') {
      // Explicitly disabled
      onChange('sideBar', false);
    } else {
      // A specific tool panel ID
      onChange('sideBar', value);
    }
    
    // Update local state to reflect the change
    setLocalSettings(prev => {
      if (value === 'none') {
        return { ...prev, sideBar: false };
      } else if (value === 'true') {
        return { ...prev, sideBar: true };
      } else if (value === 'false') {
        return { ...prev, sideBar: false };
      } else {
        return { ...prev, sideBar: value };
      }
    });
  };

  // Special handler for statusBar which can be boolean or object
  const handleStatusBarChange = (checked: boolean) => {
    if (checked) {
      // When enabling, create a default statusBar configuration with previously used panels
      // or populate with standard panels if none
      const panels = statusPanels.length > 0 ? statusPanels : [
        { statusPanel: 'agTotalRowCountComponent', align: 'left' },
        { statusPanel: 'agFilteredRowCountComponent', align: 'left' },
        { statusPanel: 'agSelectedRowCountComponent', align: 'center' },
        { statusPanel: 'agAggregationComponent', align: 'right', statusPanelParams: { aggFuncs: ['count', 'sum', 'avg'] } },
      ];
      
      // Update status panels array
      setStatusPanels(panels);
      
      // Create statusBar configuration object
      const statusBarValue = { statusPanels: panels };
      
      // Update local settings and parent
      setLocalSettings(prev => ({ ...prev, statusBar: statusBarValue }));
      onChange('statusBar', statusBarValue);
    } else {
      // When disabling, set to false explicitly (not undefined or null)
      setLocalSettings(prev => ({ ...prev, statusBar: false }));
      onChange('statusBar', false);
      // Clear panels
      setStatusPanels([]);
    }
  };

  // Helper to check if statusBar is enabled (boolean or object)
  const isStatusBarEnabled = () => {
    // If null, undefined, or explicitly false, it's disabled
    if (localSettings.statusBar === null || 
        localSettings.statusBar === undefined || 
        localSettings.statusBar === false) {
      return false;
    }
    
    // If it's a boolean true, it's enabled
    if (localSettings.statusBar === true) {
      return true;
    }
    
    // If it's an object with statusPanels, it's enabled
    if (typeof localSettings.statusBar === 'object' && 
        'statusPanels' in localSettings.statusBar) {
      return true;
    }
    
    // If it's an empty string, treat as disabled
    if (localSettings.statusBar === '') {
      return false;
    }
    
    // For any other case, assume it's enabled
    return true;
  };
  
  // Add a new status panel
  const addStatusPanel = (panelType: string) => {
    // Don't add empty panel types
    if (!panelType) return;
    
    const newPanel: StatusPanel = { statusPanel: panelType, align: 'left' };
    
    // If this is an aggregation component, add default aggregation functions
    if (panelType === 'agAggregationComponent') {
      newPanel.statusPanelParams = {
        aggFuncs: ['count', 'sum', 'avg'] // Default functions
      };
    }
    
    // Add to status panels array
    const updatedPanels = [...statusPanels, newPanel];
    setStatusPanels(updatedPanels);
    
    // Update statusBar object
    const statusBarValue = { statusPanels: updatedPanels };
    setLocalSettings(prev => ({ ...prev, statusBar: statusBarValue }));
    onChange('statusBar', statusBarValue);
  };
  
  // Remove a status panel
  const removeStatusPanel = (index: number) => {
    const updatedPanels = [...statusPanels];
    updatedPanels.splice(index, 1);
    setStatusPanels(updatedPanels);
    
    // Update statusBar object
    const statusBarValue = updatedPanels.length > 0 ? { statusPanels: updatedPanels } : false;
    setLocalSettings(prev => ({ ...prev, statusBar: statusBarValue }));
    onChange('statusBar', statusBarValue);
  };
  
  // Change a status panel's alignment
  const changeStatusPanelAlign = (index: number, align: 'left' | 'center' | 'right') => {
    const updatedPanels = [...statusPanels];
    updatedPanels[index] = { ...updatedPanels[index], align };
    setStatusPanels(updatedPanels);
    
    // Update statusBar object
    const statusBarValue = { statusPanels: updatedPanels };
    setLocalSettings(prev => ({ ...prev, statusBar: statusBarValue }));
    onChange('statusBar', statusBarValue);
  };
  
  // Update aggregation functions for a panel
  const updateAggregationFunctions = (index: number, aggFuncs: string[]) => {
    const updatedPanels = [...statusPanels];
    
    // Create or update statusPanelParams
    updatedPanels[index] = { 
      ...updatedPanels[index], 
      statusPanelParams: { 
        ...updatedPanels[index]?.statusPanelParams,
        aggFuncs 
      } 
    };
    
    setStatusPanels(updatedPanels);
    
    // Update statusBar object
    const statusBarValue = { statusPanels: updatedPanels };
    setLocalSettings(prev => ({ ...prev, statusBar: statusBarValue }));
    onChange('statusBar', statusBarValue);
  };
  
  // Toggle an aggregation function for a panel
  const toggleAggregationFunction = (index: number, func: string) => {
    const panel = statusPanels[index];
    const currentFuncs = panel.statusPanelParams?.aggFuncs || [];
    
    let newFuncs: string[];
    if (currentFuncs.includes(func)) {
      // Remove the function if it's already there
      newFuncs = currentFuncs.filter(f => f !== func);
    } else {
      // Add the function if it's not there
      newFuncs = [...currentFuncs, func];
    }
    
    // Update with the new functions
    updateAggregationFunctions(index, newFuncs);
  };
  
  // Get a readable name for a status panel type
  const getStatusPanelName = (panelType: string): string => {
    switch (panelType) {
      case 'agTotalRowCountComponent': return 'Total Row Count';
      case 'agFilteredRowCountComponent': return 'Filtered Row Count';
      case 'agSelectedRowCountComponent': return 'Selected Row Count';
      case 'agAggregationComponent': return 'Aggregation';
      case 'agTotalAndFilteredRowCountComponent': return 'Total & Filtered Count';
      default: return panelType;
    }
  };
  
  // Get current aggregation functions for a panel
  const getPanelAggFuncs = (panel: StatusPanel): string[] => {
    return panel.statusPanelParams?.aggFuncs || [];
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Menu & Toolbars</CardTitle>
          <CardDescription>
            Configure menu and toolbar components.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="suppressContextMenu" 
              checked={!!localSettings.suppressContextMenu}
              onCheckedChange={(checked) => handleCheckboxChange('suppressContextMenu', !!checked)} 
            />
            <Label htmlFor="suppressContextMenu" className="font-normal">
              Disable context menu
            </Label>
          </div>
          
          <div className="flex items-center space-x-2 pt-2">
            <Checkbox 
              id="suppressMenuHide" 
              checked={!!localSettings.suppressMenuHide}
              onCheckedChange={(checked) => handleCheckboxChange('suppressMenuHide', !!checked)} 
            />
            <Label htmlFor="suppressMenuHide" className="font-normal">
              Keep column menu open after selection
            </Label>
          </div>
          
          <div className="space-y-2 pt-4">
            <Label htmlFor="sideBar">Side Bar</Label>
            <Select
              value={getSideBarValue(localSettings.sideBar)}
              onValueChange={handleSideBarChange}
            >
              <SelectTrigger id="sideBar">
                <SelectValue placeholder="Select side bar configuration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="true">Default</SelectItem>
                <SelectItem value="columns">Columns Only</SelectItem>
                <SelectItem value="filters">Filters Only</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Configure the side bar tool panels (Enterprise).
            </p>
          </div>
          
          <div className="flex items-center space-x-2 pt-2">
            <Checkbox 
              id="statusBar" 
              checked={isStatusBarEnabled()}
              onCheckedChange={handleStatusBarChange} 
            />
            <Label htmlFor="statusBar" className="font-normal">
              Show status bar (Enterprise)
            </Label>
            <p className="text-xs text-muted-foreground ml-6">
              Displays aggregation information and selected range count.
            </p>
          </div>
          
          {/* Status bar panels configuration */}
          {isStatusBarEnabled() && (
            <div className="mt-3 pl-6 border-l-2 border-l-muted">
              <p className="text-sm font-medium mb-3">Status Bar Panels</p>
              
              {/* Show current panels */}
              <div className="space-y-2">
                {statusPanels.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No panels configured. Add panels below.</p>
                ) : (
                  <div className="space-y-2 mb-3">
                    {statusPanels.map((panel, index) => {
                      const config = STATUS_PANEL_CONFIGS[panel.statusPanel];
                      const supportsAggFuncs = config?.supports.aggFuncs;
                      
                      return (
                        <div key={`${panel.statusPanel}-${index}`} className="flex items-center justify-between bg-muted/30 p-2 rounded-md">
                          <div className="flex items-center gap-2">
                            <span className="text-sm">{getStatusPanelName(panel.statusPanel)}</span>
                            
                            {/* Show indicator if panel has special config */}
                            {supportsAggFuncs && panel.statusPanelParams?.aggFuncs && (
                              <span className="text-xs text-muted-foreground">
                                ({panel.statusPanelParams.aggFuncs.join(', ')})
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {/* Alignment selector */}
                            <Select
                              value={panel.align || 'left'}
                              onValueChange={(value) => changeStatusPanelAlign(index, value as 'left' | 'center' | 'right')}
                            >
                              <SelectTrigger className="h-7 w-20">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="left">Left</SelectItem>
                                <SelectItem value="center">Center</SelectItem>
                                <SelectItem value="right">Right</SelectItem>
                              </SelectContent>
                            </Select>
                            
                            {/* Aggregation config if supported */}
                            {supportsAggFuncs && (
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button variant="outline" size="icon" className="h-7 w-7">
                                    <SettingsIcon className="h-3.5 w-3.5" />
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-64">
                                  <div className="space-y-2">
                                    <h4 className="font-medium text-sm">Aggregation Functions</h4>
                                    <p className="text-xs text-muted-foreground mb-2">
                                      Select which calculations to show:
                                    </p>
                                    
                                    <div className="space-y-1.5">
                                      {AGGREGATION_FUNCTIONS.map(func => (
                                        <div key={func} className="flex items-center space-x-2">
                                          <Checkbox 
                                            id={`agg-${index}-${func}`}
                                            checked={getPanelAggFuncs(panel).includes(func)}
                                            onCheckedChange={() => toggleAggregationFunction(index, func)}
                                          />
                                          <Label htmlFor={`agg-${index}-${func}`} className="font-normal text-sm capitalize">
                                            {func}
                                          </Label>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </PopoverContent>
                              </Popover>
                            )}
                            
                            {/* Remove button */}
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => removeStatusPanel(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                
                {/* Add panel dropdown */}
                <div className="flex items-center gap-2 mt-3">
                  <Select onValueChange={addStatusPanel}>
                    <SelectTrigger className="w-[200px]">
                      <span className="flex items-center gap-1">
                        <Plus className="h-3.5 w-3.5" />
                        <span>Add Panel</span>
                      </span>
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(STATUS_PANEL_CONFIGS).map(([key, config]) => (
                        <SelectItem key={key} value={key}>
                          {getStatusPanelName(key)}
                          <div className="text-xs text-muted-foreground">{config.description}</div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <p className="text-xs text-muted-foreground mt-2">
                  Configure which panels appear in the status bar and their alignment.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Overlays</CardTitle>
          <CardDescription>
            Configure overlay components and animations.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="loading" 
              // Invert logic: loading=false means hide overlay (same as suppressLoadingOverlay=true)
              checked={localSettings.loading === false}
              onCheckedChange={(checked) => handleCheckboxChange('loading', !checked)} 
            />
            <Label htmlFor="loading" className="font-normal">
              Hide loading overlay
            </Label>
          </div>
          
          <div className="flex items-center space-x-2 pt-2">
            <Checkbox 
              id="suppressNoRowsOverlay" 
              checked={!!localSettings.suppressNoRowsOverlay}
              onCheckedChange={(checked) => handleCheckboxChange('suppressNoRowsOverlay', !!checked)} 
            />
            <Label htmlFor="suppressNoRowsOverlay" className="font-normal">
              Hide no rows overlay
            </Label>
          </div>
          
          <div className="flex items-center space-x-2 pt-2">
            <Checkbox 
              id="suppressColumnMoveAnimation" 
              checked={!!localSettings.suppressColumnMoveAnimation}
              onCheckedChange={(checked) => handleCheckboxChange('suppressColumnMoveAnimation', !!checked)} 
            />
            <Label htmlFor="suppressColumnMoveAnimation" className="font-normal">
              Disable column move animation
            </Label>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 