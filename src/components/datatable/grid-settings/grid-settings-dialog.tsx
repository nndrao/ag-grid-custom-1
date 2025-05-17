import { useCallback, useEffect, useState, useRef } from 'react';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { GridApi, GridOptions } from 'ag-grid-community';
import { SettingsController } from '@/services/settings-controller';
import { DEFAULT_GRID_OPTIONS, INITIAL_PROPERTIES, extractCurrentGridSettings, IndexableGridOptions, normalizeRowSelection, normalizeCellSelection } from '@/components/datatable/config/default-grid-options';
import {
  BasicGridConfig,
  SelectionOptions,
  StylingAppearance,
  SortingFiltering,
  PaginationOptions,
  RowGroupingPivoting,
  EditingOptions,
  ColumnFeatures,
  UiComponents,
  DataRendering,
  ClipboardExport,
  AdvancedFeatures,
  LocalizationAccessibility,
  SizingDimensions,
  ColumnDefaults
} from './tabs/index';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { InfoCircledIcon } from '@radix-ui/react-icons';
import { applySettingsOptimized } from './apply-settings-optimized';
import { loadSettingsOptimized, getCachedSettings, preloadSettings } from './load-settings-optimized';
import { toast } from '@/components/ui/use-toast';

export interface GridSettingsState {
  [category: string]: {
    [option: string]: any;
  };
}

// Use IndexableGridOptions from default-grid-options.ts
export type GridOptionsMap = IndexableGridOptions;

interface GridSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  gridApi: GridApi | null;
  settingsController: SettingsController | null;
  profileManager?: any;
}

export function GridSettingsDialog({
  open,
  onOpenChange,
  gridApi,
  settingsController,
  profileManager
}: GridSettingsDialogProps) {
  const [activeTab, setActiveTab] = useState("basic");
  const [gridSettings, setGridSettings] = useState<GridSettingsState>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [initialValues, setInitialValues] = useState<GridOptionsMap>({});
  
  // Refs for batching state updates
  const pendingUpdates = useRef<Record<string, { category: string, option: string, value: any }>>({});
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup effect
  useEffect(() => {
    return () => {
      // Clear any pending timeout when component unmounts
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, []);

  // Load current grid settings when dialog opens - optimized version
  useEffect(() => {
    if (open && gridApi) {
      // Check if we have cached settings first
      const profileId = profileManager?.activeProfile?.id;
      const cachedSettings = profileId ? getCachedSettings(profileId) : null;
      
      if (cachedSettings) {
        // Use cached settings for instant load
        setGridSettings(cachedSettings);
        setHasChanges(false);
        return;
      }
      
      // Load settings using optimized function
      loadSettingsOptimized(gridApi, profileManager, settingsController).then(result => {
        setGridSettings(result.settings);
        setHasChanges(false);
        
        // Set initial values for comparison on save
        const flattenedInitialValues: GridOptionsMap = {};
        Object.entries(result.settings).forEach(([category, categorySettings]) => {
          Object.entries(categorySettings).forEach(([option, value]) => {
            flattenedInitialValues[option] = value;
          });
        });
        setInitialValues(flattenedInitialValues);
        
        // Show load time in development
        if (process.env.NODE_ENV === 'development') {
          console.log(`Settings loaded in ${result.loadTime.toFixed(2)}ms (${result.settingsCount} settings)`);
        }
      });
    }
  }, [open, gridApi, profileManager, settingsController]);
  
  // Preload settings when component mounts for faster dialog opening
  useEffect(() => {
    if (gridApi && profileManager && settingsController) {
      preloadSettings(gridApi, profileManager, settingsController);
    }
  }, [gridApi, profileManager, settingsController]);

  // Handler for changes to grid settings with batching
  const handleSettingChange = useCallback((category: string, option: string, value: any) => {
    // Store the update in our pending updates
    const key = `${category}.${option}`;
    pendingUpdates.current[key] = { category, option, value };
    
    // Clear existing timeout if any
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }
    
    // Set new timeout to batch updates
    updateTimeoutRef.current = setTimeout(() => {
      // Process all pending updates at once
      setGridSettings(prev => {
        let newState = { ...prev };
        
        Object.values(pendingUpdates.current).forEach(({ category, option, value }) => {
          // Special handling for ColumnDefaults: merge defaultColDef deeply
          if (category === 'defaults' && option === 'defaultColDef') {
            newState = {
              ...newState,
              defaults: {
                ...newState.defaults,
                defaultColDef: {
                  ...newState.defaults?.defaultColDef,
                  ...value
                }
              }
            };
          } else {
            // Standard update for all other cases
            newState = {
              ...newState,
              [category]: {
                ...newState[category],
                [option]: value
              }
            };
          }
        });
        
        return newState;
      });
      
      // Clear pending updates
      pendingUpdates.current = {};
      updateTimeoutRef.current = null;
      setHasChanges(true);
    }, 0); // Use 0ms timeout to defer until after current event loop
  }, []);

  // Apply changes to grid - optimized version
  const applyChanges = useCallback(async () => {
    if (!gridApi || !hasChanges) return;
    
    // Save current grid state before applying changes
    const currentGridState = settingsController?.gridStateProvider?.extractGridState();
    
    // Pass the gridSettings structure as-is to applySettingsOptimized
    // The preprocessSettings function will handle proper flattening
    const result = await applySettingsOptimized(
      gridApi,
      gridSettings,
      initialValues,
      settingsController
    );
    
    // Handle the result
    if (result.success) {
      // Restore grid state if available
      if (currentGridState && settingsController) {
        settingsController.gridStateProvider?.applyGridState(currentGridState);
      }
      
      // Show success toast
      toast({
        title: "Settings Applied",
        description: `Successfully applied ${result.appliedSettings.length} settings in ${result.performanceMetrics.totalTime.toFixed(2)}ms`,
        variant: "default"
      });
      
      setHasChanges(false);
      onOpenChange(false);
    } else {
      // Show error toast
      toast({
        title: "Error Applying Settings",
        description: result.errors.join(", "),
        variant: "destructive"
      });
    }
  }, [gridApi, gridSettings, hasChanges, settingsController, onOpenChange, initialValues]);

  // Helper function to strip invalid grid properties
  const stripInvalidGridProps = (settings: any) => {
    const {
      verticalAlign,
      horizontalAlign,
      immutableData,
      suppressCellSelection,
      groupIncludeFooter,
      suppressPropertyNamesCheck,
      suppressBrowserResizeObserver,
      debug,
      stopEditingWhenCellsLoseFocus,
      groupUseEntireRow,
      enterMovesDown,
      enterMovesDownAfterEdit,
      enableCellChangeFlash,
      exporterCsvFilename,
      exporterExcelFilename,
      getRowNodeId,
      enableRangeHandle,
      ...rest
    } = settings;
    
    // Convert rowSelection string to object format for v33+
    if (rest.rowSelection && typeof rest.rowSelection === 'string') {
      const mode = rest.rowSelection === 'single' ? 'singleRow' : 
                  rest.rowSelection === 'multiple' ? 'multiRow' : rest.rowSelection;
      rest.rowSelection = { mode };
    }
    
    // Convert enableRangeSelection to cellSelection object
    if (rest.enableRangeSelection !== undefined) {
      if (rest.enableRangeSelection) {
        rest.cellSelection = rest.cellSelection || {};
      } else {
        rest.cellSelection = false;
      }
      delete rest.enableRangeSelection;
    }
    
    // Handle enableRangeHandle -> cellSelection.handle
    if (enableRangeHandle !== undefined) {
      if (typeof rest.cellSelection !== 'boolean') {
        rest.cellSelection = rest.cellSelection || {};
        rest.cellSelection.handle = !!enableRangeHandle;
      }
    }
    
    // Handle suppressCellSelection -> cellSelection = false
    if (suppressCellSelection) {
      rest.cellSelection = false;
    }
    
    // Also recursively update defaultColDef if present
    if (rest.defaultColDef) {
      const {
        verticalAlign,
        horizontalAlign,
        ...colDefRest
      } = rest.defaultColDef;
      
      // Convert alignment properties to cellStyle if needed
      if (verticalAlign || horizontalAlign) {
        const cellStyleFn = (params: any) => {
          const style: Record<string, string> = { display: 'flex' };
          
          if (verticalAlign) {
            style.alignItems = verticalAlign === 'middle' ? 'center' : verticalAlign;
          }
          
          if (horizontalAlign) {
            switch (horizontalAlign) {
              case 'left':
                style.justifyContent = 'flex-start';
                break;
              case 'center':
                style.justifyContent = 'center';
                break;
              case 'right':
                style.justifyContent = 'flex-end';
                break;
            }
          }
          
          return style;
        };
        
        colDefRest.cellStyle = cellStyleFn;
      }
      
      rest.defaultColDef = colDefRest;
    }
    
    return rest;
  };

  // Custom tabs style for vertical tabs
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] h-[80vh] max-h-[700px] flex flex-col p-0 gap-0 overflow-hidden">
        <TooltipProvider>
        <div className="flex flex-col px-6 py-3 pb-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold">Grid Settings</DialogTitle>
          </div>
          <DialogDescription className="mt-1 text-xs max-w-[75%] text-muted-foreground">
            Configure display, behavior, and advanced features
          </DialogDescription>
        </div>
        
        <div className="flex flex-grow overflow-hidden">
          {/* Vertical tabs sidebar */}
          <div className="w-44 border-r overflow-y-auto bg-background/95 backdrop-blur-sm shadow-sm">
            <Tabs 
              orientation="vertical" 
              value={activeTab} 
              onValueChange={setActiveTab}
              className="w-full h-full"
            >
              <TabsList className="flex flex-col items-start w-full bg-transparent h-auto p-0 gap-0.5">
                <TabsTrigger value="basic" className="justify-start w-full py-1.5 px-3 text-sm rounded-none text-left">Basic Configuration</TabsTrigger>
                <TabsTrigger value="selection" className="justify-start w-full py-1.5 px-3 text-sm rounded-none text-left">Selection Options</TabsTrigger>
                <TabsTrigger value="sorting" className="justify-start w-full py-1.5 px-3 text-sm rounded-none text-left">Sorting & Filtering</TabsTrigger>
                <TabsTrigger value="pagination" className="justify-start w-full py-1.5 px-3 text-sm rounded-none text-left">Pagination</TabsTrigger>
                <TabsTrigger value="grouping" className="justify-start w-full py-1.5 px-3 text-sm rounded-none text-left">Row Grouping</TabsTrigger>
                <TabsTrigger value="editing" className="justify-start w-full py-1.5 px-3 text-sm rounded-none text-left">Editing Options</TabsTrigger>
                <TabsTrigger value="appearance" className="justify-start w-full py-1.5 px-3 text-sm rounded-none text-left">Styling & Appearance</TabsTrigger>
                <TabsTrigger value="columns" className="justify-start w-full py-1.5 px-3 text-sm rounded-none text-left">Column Features</TabsTrigger>
                <TabsTrigger value="ui" className="justify-start w-full py-1.5 px-3 text-sm rounded-none text-left">UI Components</TabsTrigger>
                <TabsTrigger value="data" className="justify-start w-full py-1.5 px-3 text-sm rounded-none text-left">Data & Rendering</TabsTrigger>
                <TabsTrigger value="clipboard" className="justify-start w-full py-1.5 px-3 text-sm rounded-none text-left">Clipboard & Export</TabsTrigger>
                <TabsTrigger value="advanced" className="justify-start w-full py-1.5 px-3 text-sm rounded-none text-left">Advanced Features</TabsTrigger>
                <TabsTrigger value="localization" className="justify-start w-full py-1.5 px-3 text-sm rounded-none text-left">Localization</TabsTrigger>
                <TabsTrigger value="sizing" className="justify-start w-full py-1.5 px-3 text-sm rounded-none text-left">Sizing & Dimensions</TabsTrigger>
                <TabsTrigger value="defaults" className="justify-start w-full py-1.5 px-3 text-sm rounded-none text-left">Column Defaults</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          {/* Tab content with scroll area */}
          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-[calc(80vh-90px)] max-h-[610px]">
              <div className="p-4">
                {/* Information alert about initialization-only properties */}
                <Alert className="mb-3 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900 py-2 px-3">
                  <div className="flex gap-2 items-start">
                    <InfoCircledIcon className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <div className="space-y-0.5">
                      <AlertTitle className="text-sm font-medium">AG Grid v33+ Compatible Settings</AlertTitle>
                      <AlertDescription className="text-xs text-muted-foreground">
                        Some properties are initialization-only and will be applied when the grid is reinitialized.
                      </AlertDescription>
                    </div>
                  </div>
                </Alert>
                
                <Tabs value={activeTab} onValueChange={setActiveTab} orientation="vertical">
                  <TabsContent value="basic" className="mt-0 pt-0">
                    <BasicGridConfig 
                      settings={gridSettings.basic || {}} 
                      onChange={(option, value) => handleSettingChange('basic', option, value)} 
                      initialProperties={INITIAL_PROPERTIES}
                    />
                  </TabsContent>
                  
                  <TabsContent value="selection" className="mt-0 pt-0">
                    <SelectionOptions 
                      settings={gridSettings.selection || {}} 
                      onChange={(option, value) => handleSettingChange('selection', option, value)} 
                      initialProperties={INITIAL_PROPERTIES}
                    />
                  </TabsContent>
                  
                  <TabsContent value="sorting" className="mt-0 pt-0">
                    <SortingFiltering 
                      settings={gridSettings.sorting || {}} 
                      onChange={(option, value) => handleSettingChange('sorting', option, value)} 
                      initialProperties={INITIAL_PROPERTIES}
                    />
                  </TabsContent>
                  
                  <TabsContent value="pagination" className="mt-0 pt-0">
                    <PaginationOptions 
                      settings={gridSettings.pagination || {}} 
                      onChange={(option, value) => handleSettingChange('pagination', option, value)} 
                      initialProperties={INITIAL_PROPERTIES}
                    />
                  </TabsContent>
                  
                  <TabsContent value="grouping" className="mt-0 pt-0">
                    <RowGroupingPivoting 
                      settings={gridSettings.grouping || {}} 
                      onChange={(option, value) => handleSettingChange('grouping', option, value)} 
                      initialProperties={INITIAL_PROPERTIES}
                    />
                  </TabsContent>
                  
                  <TabsContent value="editing" className="mt-0 pt-0">
                    <EditingOptions 
                      settings={gridSettings.editing || {}} 
                      onChange={(option, value) => handleSettingChange('editing', option, value)} 
                      initialProperties={INITIAL_PROPERTIES}
                    />
                  </TabsContent>
                  
                  <TabsContent value="appearance" className="mt-0 pt-0">
                    <StylingAppearance 
                      settings={gridSettings.appearance || {}} 
                      onChange={(option, value) => handleSettingChange('appearance', option, value)} 
                      initialProperties={INITIAL_PROPERTIES}
                    />
                  </TabsContent>
                  
                  <TabsContent value="columns" className="mt-0 pt-0">
                    <ColumnFeatures 
                      settings={gridSettings.columns || {}} 
                      onChange={(option, value) => handleSettingChange('columns', option, value)} 
                      initialProperties={INITIAL_PROPERTIES}
                    />
                  </TabsContent>
                  
                  <TabsContent value="ui" className="mt-0 pt-0">
                    <UiComponents 
                      settings={gridSettings.ui || {}} 
                      onChange={(option, value) => handleSettingChange('ui', option, value)} 
                      initialProperties={INITIAL_PROPERTIES}
                    />
                  </TabsContent>
                  
                  <TabsContent value="data" className="mt-0 pt-0">
                    <DataRendering 
                      settings={gridSettings.data || {}} 
                      onChange={(option, value) => handleSettingChange('data', option, value)} 
                      initialProperties={INITIAL_PROPERTIES}
                    />
                  </TabsContent>
                  
                  <TabsContent value="clipboard" className="mt-0 pt-0">
                    <ClipboardExport 
                      settings={gridSettings.clipboard || {}} 
                      onChange={(option, value) => handleSettingChange('clipboard', option, value)} 
                      initialProperties={INITIAL_PROPERTIES}
                    />
                  </TabsContent>
                  
                  <TabsContent value="advanced" className="mt-0 pt-0">
                    <AdvancedFeatures 
                      settings={gridSettings.advanced || {}} 
                      onChange={(option, value) => handleSettingChange('advanced', option, value)} 
                      initialProperties={INITIAL_PROPERTIES}
                    />
                  </TabsContent>
                  
                  <TabsContent value="localization" className="mt-0 pt-0">
                    <LocalizationAccessibility 
                      settings={gridSettings.localization || {}} 
                      onChange={(option, value) => handleSettingChange('localization', option, value)} 
                      initialProperties={INITIAL_PROPERTIES}
                    />
                  </TabsContent>
                  
                  <TabsContent value="sizing" className="mt-0 pt-0">
                    <SizingDimensions 
                      settings={gridSettings.sizing || {}} 
                      onChange={(option, value) => handleSettingChange('sizing', option, value)} 
                      initialProperties={INITIAL_PROPERTIES}
                    />
                  </TabsContent>
                  
                  <TabsContent value="defaults" className="mt-0 pt-0">
                    <ColumnDefaults 
                      settings={gridSettings.defaults || {}} 
                      onChange={(option, value) => handleSettingChange('defaults', option, value)} 
                      initialProperties={INITIAL_PROPERTIES}
                    />
                  </TabsContent>
                </Tabs>
              </div>
            </ScrollArea>
          </div>
        </div>
        
        <DialogFooter className="px-4 py-3 border-t flex justify-between w-full">
          <Button variant="ghost" size="sm" onClick={() => {
            // Clear any pending updates
            if (updateTimeoutRef.current) {
              clearTimeout(updateTimeoutRef.current);
              updateTimeoutRef.current = null;
            }
            pendingUpdates.current = {};
            onOpenChange(false);
          }}>
            Cancel
          </Button>
          <Button 
            onClick={applyChanges} 
            disabled={!hasChanges}
            size="sm"
            className={`${hasChanges ? 'bg-primary text-primary-foreground' : 'bg-muted/50 text-muted-foreground'}`}
          >
            Apply Changes
          </Button>
        </DialogFooter>
        </TooltipProvider>
      </DialogContent>
    </Dialog>
  );
} 