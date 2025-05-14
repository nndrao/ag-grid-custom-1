import { useCallback, useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { GridApi, GridOptions } from 'ag-grid-community';
import { SettingsController } from '@/services/settingsController';
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
  const [initialValues, setInitialValues] = useState<GridOptionsMap>({});

  // Load current grid settings when dialog opens
  useEffect(() => {
    if (open && gridApi) {
      // Start with default grid options
      const defaultOptions = DEFAULT_GRID_OPTIONS;
      
      // Get current grid settings from the API
      const currentGridSettings = extractCurrentGridSettings(gridApi);
      
      // Get stored options from profile if available
      const storedOptions = settingsController?.getCurrentGridOptions() || {};
      
      // Merge in the following order: defaults -> current -> stored
      // This ensures that stored options (from profile) take precedence
      const mergedSettings = { ...defaultOptions, ...currentGridSettings, ...storedOptions };
      
      // Save initial values for comparison later
      setInitialValues(mergedSettings);
      
      // Structure for the dialog UI
      const currentSettings: GridSettingsState = {};
      
      // Basic grid configuration
      currentSettings.basic = {
        rowHeight: mergedSettings.rowHeight,
        headerHeight: mergedSettings.headerHeight,
        rowModelType: mergedSettings.rowModelType,
      };
      
      // Column defaults - ensure this is properly hydrated
      currentSettings.defaults = {
        defaultColDef: mergedSettings.defaultColDef || DEFAULT_GRID_OPTIONS.defaultColDef
      };
      
      // Selection options - handling both modern AG-Grid v33+ API and backward compatibility
      const rowSelection = mergedSettings.rowSelection as any;
      const cellSelection = mergedSettings.cellSelection as any;
      
      // Convert AG-Grid v33+ selection modes to dialog format
      const normalizedRowMode = typeof rowSelection === 'object' && rowSelection?.mode ? 
        (rowSelection.mode === 'multiRow' ? 'multiple' : 
         rowSelection.mode === 'singleRow' ? 'single' : 
         rowSelection.mode) : 
        (typeof rowSelection === 'string' ? rowSelection : 'multiple');
      
      currentSettings.selection = {
        rowSelection: normalizedRowMode,
        rowMultiSelectWithClick: typeof rowSelection === 'object' && 'enableSelectionWithoutKeys' in rowSelection ? 
          !!rowSelection.enableSelectionWithoutKeys : 
          !!mergedSettings.rowMultiSelectWithClick,
        suppressRowClickSelection: typeof rowSelection === 'object' && 'enableClickSelection' in rowSelection ? 
          !rowSelection.enableClickSelection : 
          !!mergedSettings.suppressRowClickSelection,
        suppressCellSelection: typeof cellSelection === 'boolean' ? 
          !cellSelection : 
          (typeof cellSelection === 'object' ? false : true),
        enableRangeSelection: typeof cellSelection === 'boolean' ? 
          cellSelection : 
          !!cellSelection,
        enableRangeHandle: mergedSettings.enableRangeHandle || false,
        suppressRowDeselection: typeof rowSelection === 'object' && 'enableClickSelection' in rowSelection ? 
          !rowSelection.enableClickSelection : 
          !!mergedSettings.suppressRowDeselection,
        groupSelectsChildren: typeof rowSelection === 'object' && 'groupSelects' in rowSelection ? 
          (rowSelection.groupSelects === 'descendants') : 
          !!mergedSettings.groupSelectsChildren,
      };
      
      // Sorting & Filtering options
      currentSettings.sorting = {
        sortingOrder: mergedSettings.sortingOrder,
        multiSortKey: mergedSettings.multiSortKey,
        accentedSort: mergedSettings.accentedSort,
        enableAdvancedFilter: mergedSettings.enableAdvancedFilter,
        quickFilterText: mergedSettings.quickFilterText,
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
        loading: storedOptions.loading ?? gridApi.getGridOption('loading'),
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

  // Apply changes to grid - special handling for function strings and modern AG-Grid API
  const applyChanges = useCallback(() => {
    if (!gridApi || !hasChanges) return;
    
    // Flatten all settings into a single object
    const flattenedSettings: GridOptionsMap = {};
    
    // Keep track of which specific options have changed from their initial values
    const changedOptions = new Set<string>();
    
    Object.entries(gridSettings).forEach(([category, categorySettings]) => {
      Object.entries(categorySettings).forEach(([option, value]) => {
        if (value !== undefined) {
          // Explicitly skip processing the 'theme' string option here
          if (option === 'theme') {
            return; // Do not add it to flattenedSettings
          }
          
          // Track if this option has changed from initial value
          const initialValue = initialValues[option as keyof GridOptions];
          if (JSON.stringify(initialValue) !== JSON.stringify(value)) {
            changedOptions.add(option);
          }

          // Special handling for function strings
          if (typeof value === 'string' && (option === 'getDataPath' || option === 'getRowId') && value.trim()) {
            // Function string parsing is disabled due to TypeScript errors
            // and security concerns with eval
            flattenedSettings[option] = value; // Keep as string
          } else {
            // Handle deprecated properties
            switch (option) {
              // Replace deprecated properties with their modern equivalents
              case 'rowMultiSelectWithClick':
                // Handle modern AG-Grid v33+ API
                if (typeof flattenedSettings.rowSelection === 'string' || !flattenedSettings.rowSelection) {
                  // Convert legacy 'multiple'/'single' to AG-Grid v33+ 'multiRow'/'singleRow'
                  const mode = flattenedSettings.rowSelection === 'multiple' ? 'multiRow' : 
                             flattenedSettings.rowSelection === 'single' ? 'singleRow' : 
                             flattenedSettings.rowSelection || 'multiRow';
                             
                  flattenedSettings.rowSelection = { 
                    mode: mode as any,
                    enableSelectionWithoutKeys: value as boolean 
                  };
                } else {
                  (flattenedSettings.rowSelection as any).enableSelectionWithoutKeys = value as boolean;
                }
                break;
              case 'suppressRowClickSelection':
                flattenedSettings['rowSelection'] = flattenedSettings['rowSelection'] || {};
                flattenedSettings['rowSelection'].enableClickSelection = !value; // Invert the value
                break;
              case 'enableRangeSelection':
                // Handle modern AG-Grid v33+ API for cell selection
                flattenedSettings.cellSelection = value ? true : false;
                break;
              case 'enableRangeHandle':
                // This is handled separately from cellSelection in AG-Grid v33+
                flattenedSettings.enableRangeHandle = value as boolean;
                break;
              case 'suppressRowDeselection':
                // Handle modern AG-Grid v33+ API
                if (typeof flattenedSettings.rowSelection === 'string' || !flattenedSettings.rowSelection) {
                  // Convert legacy 'multiple'/'single' to AG-Grid v33+ 'multiRow'/'singleRow'
                  const mode = flattenedSettings.rowSelection === 'multiple' ? 'multiRow' : 
                             flattenedSettings.rowSelection === 'single' ? 'singleRow' : 
                             flattenedSettings.rowSelection || 'multiRow';
                             
                  flattenedSettings.rowSelection = { 
                    mode: mode as any,
                    enableClickSelection: !(value as boolean) 
                  };
                } else {
                  (flattenedSettings.rowSelection as any).enableClickSelection = !(value as boolean);
                }
                break;
              case 'groupSelectsChildren':
                // Handle modern AG-Grid v33+ API
                if (typeof flattenedSettings.rowSelection === 'string' || !flattenedSettings.rowSelection) {
                  // Convert legacy 'multiple'/'single' to AG-Grid v33+ 'multiRow'/'singleRow'
                  const mode = flattenedSettings.rowSelection === 'multiple' ? 'multiRow' : 
                             flattenedSettings.rowSelection === 'single' ? 'singleRow' : 
                             flattenedSettings.rowSelection || 'multiRow';
                             
                  flattenedSettings.rowSelection = { 
                    mode: mode as any,
                    groupSelects: (value as boolean) ? 'descendants' : 'none'
                  } as any;
                } else {
                  (flattenedSettings.rowSelection as any).groupSelects = (value as boolean) ? 'descendants' : 'none';
                }
                break;
              case 'groupRemoveSingleChildren':
                flattenedSettings['groupHideParentOfSingleChild'] = value;
                break;
              case 'suppressCopyRowsToClipboard':
                // Handle modern AG-Grid v33+ API
                if (typeof flattenedSettings.rowSelection === 'string' || !flattenedSettings.rowSelection) {
                  flattenedSettings.rowSelection = { 
                    mode: flattenedSettings.rowSelection || 'multiple',
                    copySelectedRows: !(value as boolean) 
                  };
                } else {
                  (flattenedSettings.rowSelection as any).copySelectedRows = !(value as boolean);
                }
                break;
              case 'suppressCopySingleCellRanges':
                // Handle modern AG-Grid v33+ API
                if (typeof flattenedSettings.rowSelection === 'string' || !flattenedSettings.rowSelection) {
                  flattenedSettings.rowSelection = { 
                    mode: flattenedSettings.rowSelection || 'multiple',
                    copySelectedRows: !(value as boolean) 
                  };
                } else {
                  (flattenedSettings.rowSelection as any).copySelectedRows = !(value as boolean);
                }
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
    
    console.log('Applying grid settings:', flattenedSettings, 'Changed options:', Array.from(changedOptions));
    
    // Process special cases for AG-Grid v33+ API
    if (flattenedSettings.rowSelection) {
      flattenedSettings.rowSelection = normalizeRowSelection(flattenedSettings.rowSelection);
    }
    
    if (flattenedSettings.cellSelection !== undefined) {
      flattenedSettings.cellSelection = normalizeCellSelection(flattenedSettings.cellSelection);
    }
    
    // Process alignment settings to regenerate cellStyle function for defaultColDef
    if (flattenedSettings.defaultColDef) {
      const colDef = flattenedSettings.defaultColDef as any; // Type as any to handle custom properties
      const verticalAlign = colDef.verticalAlign as 'start' | 'center' | 'end' | undefined;
      const horizontalAlign = colDef.horizontalAlign as 'left' | 'center' | 'right' | undefined;
      
      // Only create cellStyle if at least one alignment is specified
      if (verticalAlign || horizontalAlign) {
        // Create a function that returns the style object
        colDef.cellStyle = () => {
          const styleObj: any = { display: 'flex' };
          
          // Add vertical alignment
          if (verticalAlign) {
            styleObj.alignItems = verticalAlign;
          }
          
          // Add horizontal alignment
          if (horizontalAlign) {
            switch (horizontalAlign) {
              case 'left':
                styleObj.justifyContent = 'flex-start';
                break;
              case 'center':
                styleObj.justifyContent = 'center';
                break;
              case 'right':
                styleObj.justifyContent = 'flex-end';
                break;
            }
          }
          
          return styleObj;
        };
      } else {
        // If both alignments are unset, remove the cellStyle function
        delete colDef.cellStyle;
      }
    }
    
    // Apply each setting to the grid
    Object.entries(flattenedSettings).forEach(([option, value]) => {
      try {
        // Skip undefined values and initial properties
        if (value !== undefined && !INITIAL_PROPERTIES.includes(option) && option !== 'theme') {
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
      INITIAL_PROPERTIES.forEach(prop => delete filteredSettings[prop]);
      
      // Only persist options that have actually changed
      const changedSettings: GridOptionsMap = {};
      changedOptions.forEach(option => {
        if (filteredSettings[option] !== undefined) {
          changedSettings[option] = filteredSettings[option];
        }
      });
      
      settingsController.updateGridOptions(changedSettings);
    }
    
    setHasChanges(false);
    
    // Close the dialog after applying changes
    onOpenChange(false);
  }, [gridApi, gridSettings, hasChanges, settingsController, onOpenChange, initialValues]);

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
                      initialProperties={INITIAL_PROPERTIES}
                    />
                  </TabsContent>
                  
                  <TabsContent value="selection" className="mt-0">
                    <SelectionOptions 
                      settings={gridSettings.selection || {}} 
                      onChange={(option, value) => handleSettingChange('selection', option, value)} 
                      initialProperties={INITIAL_PROPERTIES}
                    />
                  </TabsContent>
                  
                  <TabsContent value="sorting" className="mt-0">
                    <SortingFiltering 
                      settings={gridSettings.sorting || {}} 
                      onChange={(option, value) => handleSettingChange('sorting', option, value)} 
                      initialProperties={INITIAL_PROPERTIES}
                    />
                  </TabsContent>
                  
                  <TabsContent value="pagination" className="mt-0">
                    <PaginationOptions 
                      settings={gridSettings.pagination || {}} 
                      onChange={(option, value) => handleSettingChange('pagination', option, value)} 
                      initialProperties={INITIAL_PROPERTIES}
                    />
                  </TabsContent>
                  
                  <TabsContent value="grouping" className="mt-0">
                    <RowGroupingPivoting 
                      settings={gridSettings.grouping || {}} 
                      onChange={(option, value) => handleSettingChange('grouping', option, value)} 
                      initialProperties={INITIAL_PROPERTIES}
                    />
                  </TabsContent>
                  
                  <TabsContent value="editing" className="mt-0">
                    <EditingOptions 
                      settings={gridSettings.editing || {}} 
                      onChange={(option, value) => handleSettingChange('editing', option, value)} 
                      initialProperties={INITIAL_PROPERTIES}
                    />
                  </TabsContent>
                  
                  <TabsContent value="appearance" className="mt-0">
                    <StylingAppearance 
                      settings={gridSettings.appearance || {}} 
                      onChange={(option, value) => handleSettingChange('appearance', option, value)} 
                      initialProperties={INITIAL_PROPERTIES}
                    />
                  </TabsContent>
                  
                  <TabsContent value="columns" className="mt-0">
                    <ColumnFeatures 
                      settings={gridSettings.columns || {}} 
                      onChange={(option, value) => handleSettingChange('columns', option, value)} 
                      initialProperties={INITIAL_PROPERTIES}
                    />
                  </TabsContent>
                  
                  <TabsContent value="ui" className="mt-0">
                    <UiComponents 
                      settings={gridSettings.ui || {}} 
                      onChange={(option, value) => handleSettingChange('ui', option, value)} 
                      initialProperties={INITIAL_PROPERTIES}
                    />
                  </TabsContent>
                  
                  <TabsContent value="data" className="mt-0">
                    <DataRendering 
                      settings={gridSettings.data || {}} 
                      onChange={(option, value) => handleSettingChange('data', option, value)} 
                      initialProperties={INITIAL_PROPERTIES}
                    />
                  </TabsContent>
                  
                  <TabsContent value="clipboard" className="mt-0">
                    <ClipboardExport 
                      settings={gridSettings.clipboard || {}} 
                      onChange={(option, value) => handleSettingChange('clipboard', option, value)} 
                      initialProperties={INITIAL_PROPERTIES}
                    />
                  </TabsContent>
                  
                  <TabsContent value="advanced" className="mt-0">
                    <AdvancedFeatures 
                      settings={gridSettings.advanced || {}} 
                      onChange={(option, value) => handleSettingChange('advanced', option, value)} 
                      initialProperties={INITIAL_PROPERTIES}
                    />
                  </TabsContent>
                  
                  <TabsContent value="localization" className="mt-0">
                    <LocalizationAccessibility 
                      settings={gridSettings.localization || {}} 
                      onChange={(option, value) => handleSettingChange('localization', option, value)} 
                      initialProperties={INITIAL_PROPERTIES}
                    />
                  </TabsContent>
                  
                  <TabsContent value="sizing" className="mt-0">
                    <SizingDimensions 
                      settings={gridSettings.sizing || {}} 
                      onChange={(option, value) => handleSettingChange('sizing', option, value)} 
                      initialProperties={INITIAL_PROPERTIES}
                    />
                  </TabsContent>
                  
                  <TabsContent value="defaults" className="mt-0">
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