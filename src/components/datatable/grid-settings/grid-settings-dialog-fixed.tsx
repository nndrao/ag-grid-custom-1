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
  
  // Use a ref to track pending updates
  const pendingUpdates = useRef<{ [key: string]: any }>({});
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load current grid settings when dialog opens
  // Only rehydrate gridSettings when dialog is first opened
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
      let mergedSettings = { ...defaultOptions, ...currentGridSettings, ...storedOptions };

      // Utility to convert and strip deprecated/invalid AG Grid properties
      const stripInvalidGridProps = (settings: any) => {
        // Extract deprecated properties
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
          groupUseEntireRow,  // Deprecated in v33+
          enterMovesDown,     // Deprecated in v33+
          enterMovesDownAfterEdit, // Deprecated in v33+
          enableCellChangeFlash, // Deprecated in v33+
          exporterCsvFilename,  // Deprecated in v33+
          exporterExcelFilename, // Deprecated in v33+
          getRowNodeId,        // Deprecated in v33+
          enableRangeHandle,   // Deprecated in v33+
          ...rest
        } = settings;
        
        // Convert rowSelection string to object format for v33+
        if (rest.rowSelection && typeof rest.rowSelection === 'string') {
          // Map 'single' to 'singleRow' and 'multiple' to 'multiRow'
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
      mergedSettings = stripInvalidGridProps(mergedSettings);
      
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
      
      // Column defaults - ensure this is properly hydrated with alignment values
      
      // Extract alignment values from the defaultColDef if they exist
      const defaultColDef = mergedSettings.defaultColDef || DEFAULT_GRID_OPTIONS.defaultColDef;
      
      // If defaultColDef has verticalAlign or horizontalAlign, preserve them
      currentSettings.defaults = {
        defaultColDef: {
          ...defaultColDef,
          // Ensure alignment values are preserved from stored settings
          verticalAlign: defaultColDef?.verticalAlign,
          horizontalAlign: defaultColDef?.horizontalAlign
        }
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
      
      currentSettings.columns = {
        suppressDragLeaveHidesColumns: storedOptions.suppressDragLeaveHidesColumns ?? gridApi.getGridOption('suppressDragLeaveHidesColumns'),
        suppressMovableColumns: storedOptions.suppressMovableColumns ?? gridApi.getGridOption('suppressMovableColumns'),
        suppressFieldDotNotation: storedOptions.suppressFieldDotNotation ?? gridApi.getGridOption('suppressFieldDotNotation'),
        suppressAutoSize: storedOptions.suppressAutoSize ?? gridApi.getGridOption('suppressAutoSize'),
      };
      
      // Data & Rendering
      currentSettings.data = {
        // Use AG Grid v33+ properties
        rowBuffer: storedOptions.rowBuffer || gridApi.getGridOption('rowBuffer'),
        valueCache: storedOptions.valueCache ?? gridApi.getGridOption('valueCache'),
        // Convert deprecated properties to v33+ equivalents
        cellFlashDuration: storedOptions.cellFlashDuration ?? storedOptions.enableCellChangeFlash ?? 
                          gridApi.getGridOption('cellFlashDuration') ?? gridApi.getGridOption('enableCellChangeFlash'),
        getRowId: storedOptions.getRowId ?? storedOptions.getRowNodeId ?? 
                 gridApi.getGridOption('getRowId') ?? gridApi.getGridOption('getRowNodeId'),
      };
      
      // Clipboard & Export
      currentSettings.clipboard = {
        // Use AG Grid v33+ properties
        enableCellTextSelection: storedOptions.enableCellTextSelection ?? gridApi.getGridOption('enableCellTextSelection'),
        suppressCopyRowsToClipboard: storedOptions.suppressCopyRowsToClipboard ?? gridApi.getGridOption('suppressCopyRowsToClipboard'),
        suppressCopySingleCellRanges: storedOptions.suppressCopySingleCellRanges ?? gridApi.getGridOption('suppressCopySingleCellRanges'),
        clipboardDelimiter: storedOptions.clipboardDelimiter || gridApi.getGridOption('clipboardDelimiter'),
        // Convert deprecated properties to v33+ equivalents
        csvFilename: storedOptions.csvFilename ?? storedOptions.exporterCsvFilename ?? 
                    gridApi.getGridOption('csvFilename') ?? gridApi.getGridOption('exporterCsvFilename'),
        excelFilename: storedOptions.excelFilename ?? storedOptions.exporterExcelFilename ?? 
                      gridApi.getGridOption('excelFilename') ?? gridApi.getGridOption('exporterExcelFilename'),
      };
      
      // Advanced Features
      currentSettings.advanced = {
        // Use AG Grid v33+ properties
        enableCharts: storedOptions.enableCharts ?? gridApi.getGridOption('enableCharts'),
        masterDetail: storedOptions.masterDetail ?? gridApi.getGridOption('masterDetail'),
        // Convert deprecated properties to v33+ equivalents
        groupDisplayType: storedOptions.groupDisplayType ?? 
                         (storedOptions.groupUseEntireRow ? 'groupRows' : 'singleColumn') ?? 
                         gridApi.getGridOption('groupDisplayType'),
        suppressAggFuncInHeader: storedOptions.suppressAggFuncInHeader ?? gridApi.getGridOption('suppressAggFuncInHeader'),
        suppressColumnVirtualisation: storedOptions.suppressColumnVirtualisation ?? gridApi.getGridOption('suppressColumnVirtualisation'),
        suppressRowVirtualisation: storedOptions.suppressRowVirtualisation ?? gridApi.getGridOption('suppressRowVirtualisation'),
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
      
      // Clear any pending updates when dialog opens
      pendingUpdates.current = {};
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
        updateTimeoutRef.current = null;
      }
    }
  }, [open, gridApi]);

  // Handler for changes to grid settings - with debouncing
  const handleSettingChange = useCallback((category: string, option: string, value: any) => {
    // Store the update in our pending updates
    const key = `${category}.${option}`;
    pendingUpdates.current[key] = { category, option, value };
    
    // Clear existing timeout
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

  // Apply changes to grid - special handling for function strings and modern AG-Grid API
  const applyChanges = useCallback(() => {
    if (!gridApi || !hasChanges) return;
    
    // Save current grid state before applying changes
    const currentGridState = settingsController?.gridStateProvider?.extractGridState();
    
    // Flatten all settings into a single object
    const flattenedSettings: GridOptionsMap = {};
    
    // Keep track of which specific options have changed from their initial values
    const changedOptions = new Set<string>();
    
    // Special handling for Column Defaults to make sure alignments are preserved
    if (gridSettings.defaults?.defaultColDef) {
      
      // Important: directly capture alignment values before they get lost
      const defaultColDef = { ...gridSettings.defaults.defaultColDef };
      const verticalAlign = defaultColDef.verticalAlign;
      const horizontalAlign = defaultColDef.horizontalAlign;
      
      // Store these values explicitly in the flattened settings
      flattenedSettings.defaultColDef = defaultColDef;
      
      // Create special properties just for our processing 
      // These will be used later but won't be passed to AG Grid
      flattenedSettings._preservedVerticalAlign = verticalAlign;
      flattenedSettings._preservedHorizontalAlign = horizontalAlign;
      
      changedOptions.add('defaultColDef');
      
    }
    
    Object.entries(gridSettings).forEach(([category, categorySettings]) => {
      // Skip defaults since we already processed it
      if (category === 'defaults') return;
      
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
    
    
    // Process special cases for AG-Grid v33+ API
    if (flattenedSettings.rowSelection) {
      flattenedSettings.rowSelection = normalizeRowSelection(flattenedSettings.rowSelection);
    }
    
    if (flattenedSettings.cellSelection !== undefined) {
      flattenedSettings.cellSelection = normalizeCellSelection(flattenedSettings.cellSelection);
    }
    
    // Process alignment settings to regenerate cellStyle function for defaultColDef
    if (flattenedSettings.defaultColDef) {
      // Important: need to cast to any to access custom UI properties not in AG Grid's types
      const colDef = flattenedSettings.defaultColDef as any;
      
      // Get alignment from preserved values, not from colDef which may have lost them
      const verticalAlign = flattenedSettings._preservedVerticalAlign as 'start' | 'center' | 'end' | 'top' | 'middle' | 'bottom' | undefined;
      const horizontalAlign = flattenedSettings._preservedHorizontalAlign as 'left' | 'center' | 'right' | undefined;
      
      
      // Only create cellStyle if at least one alignment is specified
      if (verticalAlign || horizontalAlign) {
        // Create a function that returns the style object
        colDef.cellStyle = (params: any) => {
          // Create a style object for flexbox alignment
          const styleObj: any = { display: 'flex' };
          
          // Add vertical alignment
          if (verticalAlign) {
            // Map UI values to flexbox properties
            if (verticalAlign === 'top' || verticalAlign === 'start') {
              styleObj.alignItems = 'flex-start';
            } else if (verticalAlign === 'middle' || verticalAlign === 'center') {
              styleObj.alignItems = 'center';
            } else if (verticalAlign === 'bottom' || verticalAlign === 'end') {
              styleObj.alignItems = 'flex-end';
            } else {
              styleObj.alignItems = 'flex-start'; // Default to top alignment
            }
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
          } else if (params.colDef.type === 'numericColumn') {
            styleObj.justifyContent = 'flex-end'; // Right align numbers by default
          } else {
            styleObj.justifyContent = 'flex-start'; // Left align text by default
          }
          
          return styleObj;
        };
        
        // Test the cellStyle function to verify it works
        try {
          if (typeof colDef.cellStyle === 'function') {
            const testResult = colDef.cellStyle({ colDef: { type: undefined } });
          }
        } catch (e) {
        }
        
        // We DO NOT want to delete these properties yet - we need them for state persistence
        // They will be converted to cellStyle when needed but should be stored in settings
      } else {
        // If both alignments are unset, use default cellStyle from DEFAULT_GRID_OPTIONS
        colDef.cellStyle = DEFAULT_GRID_OPTIONS.defaultColDef?.cellStyle;
      }
    }
    
    // Apply each setting to the grid
    Object.entries(flattenedSettings).forEach(([option, value]) => {
      try {
        // Skip undefined values and initial properties
        if (value !== undefined && !INITIAL_PROPERTIES.includes(option) && option !== 'theme') {
          // Special handling for defaultColDef
          if (option === 'defaultColDef') {
            
            // Add the verticalAlign and horizontalAlign back to the colDef if needed
            if (flattenedSettings._preservedVerticalAlign) {
              const preservedVertical = flattenedSettings._preservedVerticalAlign;
              
              // Create a copy to avoid directly modifying the object
              const colDefWithAlignment = { ...value };
              
              // Create a cellStyle function if there isn't one already
              colDefWithAlignment.cellStyle = params => {
                const style = { display: 'flex' };
                
                // Apply vertical alignment
                if (preservedVertical === 'top') {
                  style.alignItems = 'flex-start';
                } else if (preservedVertical === 'middle') {
                  style.alignItems = 'center';
                } else if (preservedVertical === 'bottom') {
                  style.alignItems = 'flex-end';
                }
                
                // Default horizontal alignment based on numeric column
                if (params.colDef.type === 'numericColumn') {
                  style.justifyContent = 'flex-end'; // Right align numbers by default
                } else {
                  style.justifyContent = 'flex-start'; // Left align text by default
                }
                
                return style;
              };
              
              // Apply the updated colDef to the grid
              gridApi.setGridOption('defaultColDef', colDefWithAlignment);
            } else {
              // No alignment, apply normally
              gridApi.setGridOption('defaultColDef', value);
            }
            
            // Don't refresh here - we'll do a single refresh at the end
          }
          // Special handling for specific options
          else if (option === 'statusBar') {
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
      }
    });
    
    // If settings controller exists, store grid options in custom settings
    if (settingsController) {
      // Filter out initial properties that can't be updated at runtime
      const filteredSettings = { ...flattenedSettings };
      INITIAL_PROPERTIES.forEach(prop => delete filteredSettings[prop]);
      
      // Also remove our temporary preserved alignment properties
      delete filteredSettings._preservedVerticalAlign;
      delete filteredSettings._preservedHorizontalAlign;
      
      // Only persist options that have actually changed
      const changedSettings: GridOptionsMap = {};
      changedOptions.forEach(option => {
        if (filteredSettings[option] !== undefined) {
          changedSettings[option] = filteredSettings[option];
        }
      });
      
      settingsController.updateGridOptions(changedSettings);
    }
    
    // Restore the grid state after applying settings
    if (currentGridState && settingsController) {
      // Apply immediately - the grid state provider won't refresh
      settingsController.gridStateProvider?.applyGridState(currentGridState);
      
      // Single refresh after everything is applied
      requestAnimationFrame(() => {
        gridApi.refreshHeader();
        gridApi.refreshCells({ force: true });
      });
    }
    
    setHasChanges(false);
    
    // Close the dialog after applying changes
    onOpenChange(false);
  }, [gridApi, gridSettings, hasChanges, settingsController, onOpenChange, initialValues]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, []);

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
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
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