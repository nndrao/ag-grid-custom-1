import { useCallback, useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { GridApi } from 'ag-grid-community';
import { SettingsController } from '@/services/settingsController';
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

export interface GridSettingsState {
  [category: string]: {
    [option: string]: any;
  };
}

interface GridSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  gridApi: GridApi | null;
  settingsController: SettingsController | null;
}

export function GridSettingsDialog({
  open,
  onOpenChange,
  gridApi,
  settingsController
}: GridSettingsDialogProps) {
  const [activeTab, setActiveTab] = useState("basic");
  const [gridSettings, setGridSettings] = useState<GridSettingsState>({});
  const [hasChanges, setHasChanges] = useState(false);
  
  // List of properties that cannot be updated at runtime
  const initialProperties = [
    'rowModelType',
    'cacheQuickFilter',
    'paginationPageSizeSelector',
    'pivotPanelShow',
    'undoRedoCellEditing',
    'undoRedoCellEditingLimit',
    'suppressAutoSize',
    'valueCache',
    'suppressLoadingOverlay'
  ];

  // Load current grid settings when dialog opens
  useEffect(() => {
    if (open && gridApi) {
      // Extract current grid options
      const currentSettings: GridSettingsState = {};
      
      // First, check if settingsController has stored options (from profile)
      const storedOptions = settingsController?.getCurrentGridOptions() || {};
      
      // Basic grid configuration
      currentSettings.basic = {
        rowHeight: storedOptions.rowHeight || gridApi.getGridOption('rowHeight'),
        headerHeight: storedOptions.headerHeight || gridApi.getGridOption('headerHeight'),
        rowModelType: storedOptions.rowModelType || gridApi.getGridOption('rowModelType'),
      };
      
      // Selection options
      currentSettings.selection = {
        rowSelection: storedOptions.rowSelection || gridApi.getGridOption('rowSelection'),
        rowMultiSelectWithClick: storedOptions.rowMultiSelectWithClick ?? gridApi.getGridOption('rowMultiSelectWithClick'),
        suppressRowClickSelection: storedOptions.suppressRowClickSelection ?? gridApi.getGridOption('suppressRowClickSelection'),
        suppressCellSelection: storedOptions.suppressCellSelection ?? gridApi.getGridOption('suppressCellSelection'),
        enableRangeSelection: storedOptions.enableRangeSelection ?? gridApi.getGridOption('enableRangeSelection'),
        enableRangeHandle: storedOptions.enableRangeHandle ?? gridApi.getGridOption('enableRangeHandle'),
        suppressRowDeselection: storedOptions.suppressRowDeselection ?? gridApi.getGridOption('suppressRowDeselection'),
      };
      
      // Sorting & Filtering options
      currentSettings.sorting = {
        sortingOrder: storedOptions.sortingOrder || gridApi.getGridOption('sortingOrder'),
        multiSortKey: storedOptions.multiSortKey || gridApi.getGridOption('multiSortKey'),
        accentedSort: storedOptions.accentedSort ?? gridApi.getGridOption('accentedSort'),
        enableAdvancedFilter: storedOptions.enableAdvancedFilter ?? gridApi.getGridOption('enableAdvancedFilter'),
        quickFilterText: storedOptions.quickFilterText || gridApi.getGridOption('quickFilterText'),
        cacheQuickFilter: storedOptions.cacheQuickFilter ?? gridApi.getGridOption('cacheQuickFilter'),
        excludeChildrenWhenTreeDataFiltering: storedOptions.excludeChildrenWhenTreeDataFiltering ?? gridApi.getGridOption('excludeChildrenWhenTreeDataFiltering'),
      };
      
      // Pagination options
      currentSettings.pagination = {
        pagination: storedOptions.pagination ?? gridApi.getGridOption('pagination'),
        paginationPageSize: storedOptions.paginationPageSize || gridApi.getGridOption('paginationPageSize'),
        paginationAutoPageSize: storedOptions.paginationAutoPageSize ?? gridApi.getGridOption('paginationAutoPageSize'),
        suppressPaginationPanel: storedOptions.suppressPaginationPanel ?? gridApi.getGridOption('suppressPaginationPanel'),
        paginationPageSizeSelector: storedOptions.paginationPageSizeSelector ?? gridApi.getGridOption('paginationPageSizeSelector'),
      };
      
      // Styling & Appearance
      currentSettings.appearance = {
        theme: storedOptions.theme || gridApi.getGridOption('theme'),
        animateRows: storedOptions.animateRows ?? gridApi.getGridOption('animateRows'),
        alwaysShowVerticalScroll: storedOptions.alwaysShowVerticalScroll ?? gridApi.getGridOption('alwaysShowVerticalScroll'),
        domLayout: storedOptions.domLayout || gridApi.getGridOption('domLayout'),
      };
      
      // Row Grouping & Pivoting
      currentSettings.grouping = {
        groupUseEntireRow: storedOptions.groupUseEntireRow ?? gridApi.getGridOption('groupUseEntireRow'),
        groupSelectsChildren: storedOptions.groupSelectsChildren ?? gridApi.getGridOption('groupSelectsChildren'),
        groupRemoveSingleChildren: storedOptions.groupRemoveSingleChildren ?? gridApi.getGridOption('groupRemoveSingleChildren'),
        pivotMode: storedOptions.pivotMode ?? gridApi.getGridOption('pivotMode'),
        pivotPanelShow: storedOptions.pivotPanelShow || gridApi.getGridOption('pivotPanelShow'),
        groupDefaultExpanded: storedOptions.groupDefaultExpanded ?? gridApi.getGridOption('groupDefaultExpanded'),
        rowGroupPanelShow: storedOptions.rowGroupPanelShow || gridApi.getGridOption('rowGroupPanelShow'),
        groupDisplayType: storedOptions.groupDisplayType || gridApi.getGridOption('groupDisplayType'),
      };
      
      // Editing Options
      currentSettings.editing = {
        editType: storedOptions.editType || gridApi.getGridOption('editType'),
        singleClickEdit: storedOptions.singleClickEdit ?? gridApi.getGridOption('singleClickEdit'),
        suppressClickEdit: storedOptions.suppressClickEdit ?? gridApi.getGridOption('suppressClickEdit'),
        enterMovesDown: storedOptions.enterMovesDown ?? gridApi.getGridOption('enterMovesDown'),
        enterMovesDownAfterEdit: storedOptions.enterMovesDownAfterEdit ?? gridApi.getGridOption('enterMovesDownAfterEdit'),
        undoRedoCellEditing: storedOptions.undoRedoCellEditing ?? gridApi.getGridOption('undoRedoCellEditing'),
        undoRedoCellEditingLimit: storedOptions.undoRedoCellEditingLimit || gridApi.getGridOption('undoRedoCellEditingLimit'),
      };
      
      // Column Features
      currentSettings.columns = {
        suppressDragLeaveHidesColumns: storedOptions.suppressDragLeaveHidesColumns ?? gridApi.getGridOption('suppressDragLeaveHidesColumns'),
        suppressMovableColumns: storedOptions.suppressMovableColumns ?? gridApi.getGridOption('suppressMovableColumns'),
        suppressFieldDotNotation: storedOptions.suppressFieldDotNotation ?? gridApi.getGridOption('suppressFieldDotNotation'),
        suppressAutoSize: storedOptions.suppressAutoSize ?? gridApi.getGridOption('suppressAutoSize'),
      };
      
      // Data & Rendering
      currentSettings.data = {
        rowBuffer: storedOptions.rowBuffer || gridApi.getGridOption('rowBuffer'),
        valueCache: storedOptions.valueCache ?? gridApi.getGridOption('valueCache'),
        immutableData: storedOptions.immutableData ?? gridApi.getGridOption('immutableData'),
        enableCellChangeFlash: storedOptions.enableCellChangeFlash ?? gridApi.getGridOption('enableCellChangeFlash'),
        asyncTransactionWaitMillis: storedOptions.asyncTransactionWaitMillis || gridApi.getGridOption('asyncTransactionWaitMillis'),
      };
      
      // Clipboard & Export
      currentSettings.clipboard = {
        enableCellTextSelection: storedOptions.enableCellTextSelection ?? gridApi.getGridOption('enableCellTextSelection'),
        suppressCopyRowsToClipboard: storedOptions.suppressCopyRowsToClipboard ?? gridApi.getGridOption('suppressCopyRowsToClipboard'),
        suppressCopySingleCellRanges: storedOptions.suppressCopySingleCellRanges ?? gridApi.getGridOption('suppressCopySingleCellRanges'),
        clipboardDelimiter: storedOptions.clipboardDelimiter || gridApi.getGridOption('clipboardDelimiter'),
        suppressExcelExport: storedOptions.suppressExcelExport ?? gridApi.getGridOption('suppressExcelExport'),
        suppressCsvExport: storedOptions.suppressCsvExport ?? gridApi.getGridOption('suppressCsvExport'),
        exporterCsvFilename: storedOptions.exporterCsvFilename || gridApi.getGridOption('exporterCsvFilename'),
        exporterExcelFilename: storedOptions.exporterExcelFilename || gridApi.getGridOption('exporterExcelFilename'),
      };
      
      // Advanced Features
      currentSettings.advanced = {
        enableCharts: storedOptions.enableCharts ?? gridApi.getGridOption('enableCharts'),
        masterDetail: storedOptions.masterDetail ?? gridApi.getGridOption('masterDetail'),
        treeData: storedOptions.treeData ?? gridApi.getGridOption('treeData'),
        getDataPath: storedOptions.getDataPath?.toString() || gridApi.getGridOption('getDataPath')?.toString(),
        getRowNodeId: storedOptions.getRowNodeId?.toString() || gridApi.getGridOption('getRowNodeId')?.toString(),
      };
      
      // UI Components
      currentSettings.ui = {
        suppressContextMenu: storedOptions.suppressContextMenu ?? gridApi.getGridOption('suppressContextMenu'),
        suppressMenuHide: storedOptions.suppressMenuHide ?? gridApi.getGridOption('suppressMenuHide'),
        suppressMovableColumns: storedOptions.suppressMovableColumns ?? gridApi.getGridOption('suppressMovableColumns'),
        suppressColumnMoveAnimation: storedOptions.suppressColumnMoveAnimation ?? gridApi.getGridOption('suppressColumnMoveAnimation'),
        suppressLoadingOverlay: storedOptions.suppressLoadingOverlay ?? gridApi.getGridOption('suppressLoadingOverlay'),
        suppressNoRowsOverlay: storedOptions.suppressNoRowsOverlay ?? gridApi.getGridOption('suppressNoRowsOverlay'),
        sideBar: storedOptions.sideBar ?? gridApi.getGridOption('sideBar'),
        statusBar: storedOptions.statusBar ?? gridApi.getGridOption('statusBar')
      };
      
      // Fetch all settings categories from the grid
      setGridSettings(currentSettings);
      setHasChanges(false);
    }
  }, [open, gridApi, settingsController]);

  // Handler for changes to grid settings
  const handleSettingChange = useCallback((category: string, option: string, value: any) => {
    setGridSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [option]: value
      }
    }));
    setHasChanges(true);
  }, []);

  // Apply changes to grid - special handling for function strings
  const applyChanges = useCallback(() => {
    if (!gridApi || !hasChanges) return;
    
    // Flatten all settings into a single object
    const flattenedSettings: Record<string, any> = {};
    
    Object.entries(gridSettings).forEach(([category, categorySettings]) => {
      Object.entries(categorySettings).forEach(([option, value]) => {
        if (value !== undefined) {
          // Explicitly skip processing the 'theme' string option here
          if (option === 'theme') {
            return; // Do not add it to flattenedSettings
          }

          // Special handling for function strings
          if (typeof value === 'string' && (option === 'getDataPath' || option === 'getRowNodeId') && value.trim()) {
            try {
              // Handle common function patterns
              const fnBody = value.trim();
              // Convert string to function
              if (fnBody.startsWith('function') || fnBody.startsWith('(')) {
                flattenedSettings[option] = eval(`(${fnBody})`);
              } else {
                flattenedSettings[option] = eval(`(function ${fnBody})`);
              }
            } catch (error) {
              console.error(`Error parsing function string for ${option}:`, error);
              flattenedSettings[option] = value; // Keep as string if eval fails
            }
          } else {
            // Handle deprecated properties
            switch (option) {
              // Replace deprecated properties with their modern equivalents
              case 'rowMultiSelectWithClick':
                flattenedSettings['rowSelection'] = flattenedSettings['rowSelection'] || {};
                flattenedSettings['rowSelection'].enableSelectionWithoutKeys = value;
                break;
              case 'suppressRowClickSelection':
                flattenedSettings['rowSelection'] = flattenedSettings['rowSelection'] || {};
                flattenedSettings['rowSelection'].enableClickSelection = !value; // Invert the value
                break;
              case 'enableRangeSelection':
                flattenedSettings['cellSelection'] = value;
                break;
              case 'enableRangeHandle':
                flattenedSettings['cellSelection'] = flattenedSettings['cellSelection'] || {};
                if (typeof flattenedSettings['cellSelection'] === 'boolean') {
                  flattenedSettings['cellSelection'] = { handle: value };
                } else {
                  flattenedSettings['cellSelection'].handle = value;
                }
                break;
              case 'suppressRowDeselection':
                flattenedSettings['rowSelection'] = flattenedSettings['rowSelection'] || {};
                flattenedSettings['rowSelection'].enableClickSelection = !value; // Invert the value
                break;
              case 'groupSelectsChildren':
                flattenedSettings['rowSelection'] = flattenedSettings['rowSelection'] || {};
                flattenedSettings['rowSelection'].groupSelects = value ? 'descendants' : 'none';
                break;
              case 'groupRemoveSingleChildren':
                flattenedSettings['groupHideParentOfSingleChild'] = value;
                break;
              case 'suppressCopyRowsToClipboard':
                flattenedSettings['rowSelection'] = flattenedSettings['rowSelection'] || {};
                flattenedSettings['rowSelection'].copySelectedRows = !value; // Invert the value
                break;
              case 'suppressCopySingleCellRanges':
                flattenedSettings['rowSelection'] = flattenedSettings['rowSelection'] || {};
                flattenedSettings['rowSelection'].copySelectedRows = !value; // Invert the value
                break;
              case 'suppressLoadingOverlay':
                flattenedSettings['loading'] = false;
                break;
              default:
                // Add the option without changes for non-deprecated properties
                flattenedSettings[option] = value;
                break;
            }
          }
        }
      });
    });
    
    console.log('Applying grid settings:', flattenedSettings);
    
    // Apply each setting to the grid
    Object.entries(flattenedSettings).forEach(([option, value]) => {
      try {
        // Skip undefined values and initial properties
        if (value !== undefined && !initialProperties.includes(option) && option !== 'theme') {
          // Special handling for specific options
          if (option === 'statusBar') {
            if (value === false) {
              // Disable status bar
              gridApi.setGridOption('statusBar', false);
            } else if (typeof value === 'object' && value.statusPanels) {
              // Check if statusPanels is an array and has items
              if (Array.isArray(value.statusPanels) && value.statusPanels.length > 0) {
                // Make sure each panel has the required statusPanel property
                const validPanels = value.statusPanels.filter(
                  (panel: any) => panel && typeof panel === 'object' && panel.statusPanel
                );
                
                if (validPanels.length > 0) {
                  // Apply valid panels configuration
                  gridApi.setGridOption('statusBar', { 
                    statusPanels: validPanels 
                  });
                } else {
                  // No valid panels, disable status bar
                  gridApi.setGridOption('statusBar', false);
                }
              } else {
                // Empty array or not an array, disable status bar
                gridApi.setGridOption('statusBar', false);
              }
            } else {
              // For any other value (like true or invalid object), disable
              gridApi.setGridOption('statusBar', false);
            }
          } else if (option === 'sideBar') {
            if (value === false || value === '' || value === 'none') {
              // Disable side bar
              gridApi.setGridOption('sideBar', false);
            } else if (value === true || value === 'true') {
              // Enable default side bar
              gridApi.setGridOption('sideBar', true);
            } else if (typeof value === 'string') {
              // Set to specific tool panel
              gridApi.setGridOption('sideBar', value);
            } else if (typeof value === 'object') {
              // Apply object configuration
              gridApi.setGridOption('sideBar', value);
            } else {
              // Disable for any other invalid value
              gridApi.setGridOption('sideBar', false);
            }
          } else if (option === 'theme' && typeof value === 'string' && value.length > 0) {
            // Apply theme class correctly
            //gridApi.setGridOption('theme', value);
          } else if (option === 'rowSelection' && typeof value === 'object') {
            // Need special handling for the rowSelection object
            const currentRowSelection = gridApi.getGridOption('rowSelection') || {};
            const typedRowSelection = typeof currentRowSelection === 'object' ? 
              currentRowSelection : { mode: currentRowSelection };
            gridApi.setGridOption('rowSelection', { ...typedRowSelection, ...value });
          } else if (option === 'cellSelection' && typeof value === 'object') {
            // Need special handling for the cellSelection object
            const currentCellSelection = gridApi.getGridOption('cellSelection');
            const typedCellSelection = typeof currentCellSelection === 'boolean' ? 
              { enabled: currentCellSelection } : currentCellSelection || {};
            gridApi.setGridOption('cellSelection', { ...typedCellSelection, ...value });
          } else {
            // Apply all other settings normally
            gridApi.setGridOption(option, value);
          }
        }
      } catch (error) {
        console.error(`Failed to apply setting: ${option}`, error);
      }
    });
    
    // If settings controller exists, store grid options in custom settings
    if (settingsController) {
      // Filter out initial properties that can't be updated at runtime
      const filteredSettings = { ...flattenedSettings };
      initialProperties.forEach(prop => delete filteredSettings[prop]);
      
      settingsController.updateGridOptions(filteredSettings);
    }
    
    setHasChanges(false);
    
    // Close the dialog after applying changes
    onOpenChange(false);
  }, [gridApi, gridSettings, hasChanges, settingsController, onOpenChange, initialProperties]);

  // Custom tabs style for vertical tabs
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] h-[80vh] max-h-[700px] flex flex-col p-0 gap-0">
        <DialogDescription>
          Configure grid settings such as columns, appearance, selection, and advanced features. All changes apply only to this grid instance.
        </DialogDescription>
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle>Grid Settings</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-grow overflow-hidden">
          {/* Vertical tabs sidebar */}
          <div className="w-48 border-r overflow-y-auto bg-muted/30">
            <Tabs 
              orientation="vertical" 
              value={activeTab} 
              onValueChange={setActiveTab}
              className="w-full h-full"
            >
              <TabsList className="flex flex-col w-full bg-transparent h-auto">
                <TabsTrigger value="basic" className="justify-start w-full py-2 px-4">Basic Configuration</TabsTrigger>
                <TabsTrigger value="selection" className="justify-start w-full py-2 px-4">Selection Options</TabsTrigger>
                <TabsTrigger value="sorting" className="justify-start w-full py-2 px-4">Sorting & Filtering</TabsTrigger>
                <TabsTrigger value="pagination" className="justify-start w-full py-2 px-4">Pagination</TabsTrigger>
                <TabsTrigger value="grouping" className="justify-start w-full py-2 px-4">Row Grouping & Pivoting</TabsTrigger>
                <TabsTrigger value="editing" className="justify-start w-full py-2 px-4">Editing Options</TabsTrigger>
                <TabsTrigger value="appearance" className="justify-start w-full py-2 px-4">Styling & Appearance</TabsTrigger>
                <TabsTrigger value="columns" className="justify-start w-full py-2 px-4">Column Features</TabsTrigger>
                <TabsTrigger value="ui" className="justify-start w-full py-2 px-4">UI Components</TabsTrigger>
                <TabsTrigger value="data" className="justify-start w-full py-2 px-4">Data & Rendering</TabsTrigger>
                <TabsTrigger value="clipboard" className="justify-start w-full py-2 px-4">Clipboard & Export</TabsTrigger>
                <TabsTrigger value="advanced" className="justify-start w-full py-2 px-4">Advanced Features</TabsTrigger>
                <TabsTrigger value="localization" className="justify-start w-full py-2 px-4">Localization</TabsTrigger>
                <TabsTrigger value="sizing" className="justify-start w-full py-2 px-4">Sizing & Dimensions</TabsTrigger>
                <TabsTrigger value="defaults" className="justify-start w-full py-2 px-4">Column Defaults</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          {/* Tab content with scroll area */}
          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-[calc(80vh-130px)] max-h-[570px]">
              <div className="p-6">
                {/* Information alert about initialization-only properties */}
                <Alert className="mb-4 bg-blue-50 dark:bg-blue-950/30">
                  <InfoCircledIcon className="h-4 w-4" />
                  <AlertTitle>AG Grid Version 33+ Compatibility</AlertTitle>
                  <AlertDescription>
                    Some properties can only be set during grid initialization and cannot be changed at runtime.
                    Changes to these properties will be saved in your profile but will only take effect when the grid is reinitialized.
                  </AlertDescription>
                </Alert>
                
                <Tabs value={activeTab} onValueChange={setActiveTab} orientation="vertical">
                  <TabsContent value="basic" className="mt-0">
                    <BasicGridConfig 
                      settings={gridSettings.basic || {}} 
                      onChange={(option, value) => handleSettingChange('basic', option, value)} 
                      initialProperties={initialProperties}
                    />
                  </TabsContent>
                  
                  <TabsContent value="selection" className="mt-0">
                    <SelectionOptions 
                      settings={gridSettings.selection || {}} 
                      onChange={(option, value) => handleSettingChange('selection', option, value)} 
                      initialProperties={initialProperties}
                    />
                  </TabsContent>
                  
                  <TabsContent value="sorting" className="mt-0">
                    <SortingFiltering 
                      settings={gridSettings.sorting || {}} 
                      onChange={(option, value) => handleSettingChange('sorting', option, value)} 
                      initialProperties={initialProperties}
                    />
                  </TabsContent>
                  
                  <TabsContent value="pagination" className="mt-0">
                    <PaginationOptions 
                      settings={gridSettings.pagination || {}} 
                      onChange={(option, value) => handleSettingChange('pagination', option, value)} 
                      initialProperties={initialProperties}
                    />
                  </TabsContent>
                  
                  <TabsContent value="grouping" className="mt-0">
                    <RowGroupingPivoting 
                      settings={gridSettings.grouping || {}} 
                      onChange={(option, value) => handleSettingChange('grouping', option, value)} 
                      initialProperties={initialProperties}
                    />
                  </TabsContent>
                  
                  <TabsContent value="editing" className="mt-0">
                    <EditingOptions 
                      settings={gridSettings.editing || {}} 
                      onChange={(option, value) => handleSettingChange('editing', option, value)} 
                      initialProperties={initialProperties}
                    />
                  </TabsContent>
                  
                  <TabsContent value="appearance" className="mt-0">
                    <StylingAppearance 
                      settings={gridSettings.appearance || {}} 
                      onChange={(option, value) => handleSettingChange('appearance', option, value)} 
                      initialProperties={initialProperties}
                    />
                  </TabsContent>
                  
                  <TabsContent value="columns" className="mt-0">
                    <ColumnFeatures 
                      settings={gridSettings.columns || {}} 
                      onChange={(option, value) => handleSettingChange('columns', option, value)} 
                      initialProperties={initialProperties}
                    />
                  </TabsContent>
                  
                  <TabsContent value="ui" className="mt-0">
                    <UiComponents 
                      settings={gridSettings.ui || {}} 
                      onChange={(option, value) => handleSettingChange('ui', option, value)} 
                      initialProperties={initialProperties}
                    />
                  </TabsContent>
                  
                  <TabsContent value="data" className="mt-0">
                    <DataRendering 
                      settings={gridSettings.data || {}} 
                      onChange={(option, value) => handleSettingChange('data', option, value)} 
                      initialProperties={initialProperties}
                    />
                  </TabsContent>
                  
                  <TabsContent value="clipboard" className="mt-0">
                    <ClipboardExport 
                      settings={gridSettings.clipboard || {}} 
                      onChange={(option, value) => handleSettingChange('clipboard', option, value)} 
                      initialProperties={initialProperties}
                    />
                  </TabsContent>
                  
                  <TabsContent value="advanced" className="mt-0">
                    <AdvancedFeatures 
                      settings={gridSettings.advanced || {}} 
                      onChange={(option, value) => handleSettingChange('advanced', option, value)} 
                      initialProperties={initialProperties}
                    />
                  </TabsContent>
                  
                  <TabsContent value="localization" className="mt-0">
                    <LocalizationAccessibility 
                      settings={gridSettings.localization || {}} 
                      onChange={(option, value) => handleSettingChange('localization', option, value)} 
                      initialProperties={initialProperties}
                    />
                  </TabsContent>
                  
                  <TabsContent value="sizing" className="mt-0">
                    <SizingDimensions 
                      settings={gridSettings.sizing || {}} 
                      onChange={(option, value) => handleSettingChange('sizing', option, value)} 
                      initialProperties={initialProperties}
                    />
                  </TabsContent>
                  
                  <TabsContent value="defaults" className="mt-0">
                    <ColumnDefaults 
                      settings={gridSettings.defaults || {}} 
                      onChange={(option, value) => handleSettingChange('defaults', option, value)} 
                      initialProperties={initialProperties}
                    />
                  </TabsContent>
                </Tabs>
              </div>
            </ScrollArea>
          </div>
        </div>
        
        <DialogFooter className="px-6 py-4 border-t">
          <div className="flex justify-between w-full">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={applyChanges} 
              disabled={!hasChanges}
              className="ml-2"
            >
              Apply Changes
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 