import { useCallback, useEffect, useState, useRef } from 'react';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
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

export type GridOptionsMap = IndexableGridOptions;

interface GridSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  gridApi: GridApi | null;
  settingsController: SettingsController | null;
  profileManager?: any;
}

// Optimized batch application strategies
const BATCH_STRATEGIES = {
  // Options that can be batched together
  visual: ['rowHeight', 'headerHeight', 'animateRows', 'domLayout'],
  selection: ['rowSelection', 'cellSelection', 'suppressRowDeselection'],
  grouping: ['groupDisplayType', 'groupDefaultExpanded', 'pivotMode'],
  
  // Options that require special handling
  special: ['defaultColDef', 'statusBar', 'sideBar'],
  
  // Options that should be applied immediately
  immediate: ['pagination', 'quickFilterText', 'loading']
};

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
  
  // Refs for batching and performance
  const pendingUpdates = useRef<Record<string, { category: string, option: string, value: any }>>({});
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const batchedOptions = useRef<Map<string, any>>(new Map());

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, []);

  // Load current grid settings when dialog opens
  useEffect(() => {
    if (open && gridApi) {
      const defaultOptions = DEFAULT_GRID_OPTIONS;
      const currentGridSettings = extractCurrentGridSettings(gridApi);
      const profileSettings = profileManager?.activeProfile?.settings;
      const storedOptions = profileSettings?.custom?.gridOptions || 
                            settingsController?.getCurrentGridOptions() || {};
      
      // Merge settings with stored options taking precedence
      let mergedSettings = { ...defaultOptions, ...currentGridSettings, ...storedOptions };
      mergedSettings = stripInvalidGridProps(mergedSettings);
      
      setInitialValues(mergedSettings);
      
      // Structure settings for dialog UI
      const currentSettings: GridSettingsState = {};
      
      // [Rest of the settings initialization code remains the same...]
      // Basic grid configuration
      currentSettings.basic = {
        rowHeight: mergedSettings.rowHeight,
        headerHeight: mergedSettings.headerHeight,
        rowModelType: mergedSettings.rowModelType,
      };
      
      // Column defaults
      const defaultColDef = mergedSettings.defaultColDef || DEFAULT_GRID_OPTIONS.defaultColDef;
      currentSettings.defaults = {
        defaultColDef: {
          ...defaultColDef,
          verticalAlign: defaultColDef?.verticalAlign,
          horizontalAlign: defaultColDef?.horizontalAlign
        }
      };
      
      // Selection options
      const rowSelection = mergedSettings.rowSelection as any;
      const cellSelection = mergedSettings.cellSelection as any;
      
      const normalizedRowMode = typeof rowSelection === 'object' && rowSelection?.mode ? 
        (rowSelection.mode === 'multiRow' ? 'multiple' : 
         rowSelection.mode === 'singleRow' ? 'single' : 
         rowSelection.mode) : 
        (typeof rowSelection === 'string' ? rowSelection : 'multiple');
      
      currentSettings.selection = {
        rowSelection: typeof rowSelection === 'object' ? {
          mode: normalizedRowMode,
          enableSelectionWithoutKeys: rowSelection.enableSelectionWithoutKeys !== undefined ? 
            rowSelection.enableSelectionWithoutKeys : !!mergedSettings.rowMultiSelectWithClick,
          enableClickSelection: rowSelection.enableClickSelection !== undefined ?
            rowSelection.enableClickSelection : !mergedSettings.suppressRowClickSelection,
          checkboxes: rowSelection.checkboxes !== undefined ?
            rowSelection.checkboxes : true,
          groupSelects: rowSelection.groupSelects || (mergedSettings.groupSelectsChildren ? 'descendants' : 'none')
        } : normalizedRowMode,
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
      };
      
      // [Continue with rest of category initialization...]
      
      setGridSettings(currentSettings);
      setHasChanges(false);
    }
  }, [open, gridApi, profileManager, settingsController]);

  // Optimized handler for changes to grid settings
  const handleSettingChange = useCallback((category: string, option: string, value: any) => {
    const key = `${category}.${option}`;
    pendingUpdates.current[key] = { category, option, value };
    
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }
    
    updateTimeoutRef.current = setTimeout(() => {
      setGridSettings(prev => {
        let newState = { ...prev };
        
        Object.values(pendingUpdates.current).forEach(({ category, option, value }) => {
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
      
      pendingUpdates.current = {};
      updateTimeoutRef.current = null;
      setHasChanges(true);
    }, 0);
  }, []);

  // Highly optimized apply changes function
  const applyChanges = useCallback(() => {
    if (!gridApi || !hasChanges) return;
    
    // Use a transaction to apply all changes at once
    const gridTransaction = gridApi.createUpdateTransaction?.() || {};
    
    // Pre-calculate all settings transformations
    const transformedSettings = preprocessSettings(gridSettings);
    
    // Batch options by type for optimal application
    const batches = categorizeSettingsBatches(transformedSettings);
    
    // Apply settings in optimized order
    // 1. Apply special settings first (these may affect other settings)
    batches.special.forEach(([key, value]) => {
      applySpecialSetting(gridApi, key, value);
    });
    
    // 2. Apply batched settings (can be done in parallel)
    const batchPromises: Promise<void>[] = [];
    
    // Visual settings batch
    if (batches.visual.length > 0) {
      batchPromises.push(applyBatchedSettings(gridApi, batches.visual));
    }
    
    // Selection settings batch
    if (batches.selection.length > 0) {
      batchPromises.push(applyBatchedSettings(gridApi, batches.selection));
    }
    
    // Grouping settings batch
    if (batches.grouping.length > 0) {
      batchPromises.push(applyBatchedSettings(gridApi, batches.grouping));
    }
    
    // 3. Apply immediate settings
    batches.immediate.forEach(([key, value]) => {
      gridApi.setGridOption(key, value);
    });
    
    // 4. Apply remaining settings
    batches.other.forEach(([key, value]) => {
      gridApi.setGridOption(key, value);
    });
    
    // Wait for all batches to complete
    Promise.all(batchPromises).then(() => {
      // Commit the transaction
      if (gridTransaction.commit) {
        gridTransaction.commit();
      }
      
      // Persist settings
      if (settingsController) {
        const changedSettings = extractChangedSettings(transformedSettings, initialValues);
        settingsController.updateGridOptions(changedSettings);
      }
      
      // Single optimized refresh
      performOptimizedRefresh(gridApi);
      
      setHasChanges(false);
      onOpenChange(false);
    });
  }, [gridApi, gridSettings, hasChanges, settingsController, onOpenChange, initialValues]);

  // [Rest of the component remains the same - just the UI parts]
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] h-[80vh] max-h-[700px] flex flex-col p-0 gap-0 overflow-hidden">
        <TooltipProvider>
        {/* [Rest of the UI code remains the same] */}
        </TooltipProvider>
      </DialogContent>
    </Dialog>
  );
}

// Helper functions for optimization

function stripInvalidGridProps(settings: any) {
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
  
  // Convert deprecated properties
  if (rest.rowSelection && typeof rest.rowSelection === 'string') {
    const mode = rest.rowSelection === 'single' ? 'singleRow' : 
                rest.rowSelection === 'multiple' ? 'multiRow' : rest.rowSelection;
    rest.rowSelection = { mode };
  }
  
  return rest;
}

function preprocessSettings(gridSettings: GridSettingsState): GridOptionsMap {
  const processed: GridOptionsMap = {};
  
  // Flatten all settings efficiently
  Object.entries(gridSettings).forEach(([category, categorySettings]) => {
    Object.entries(categorySettings).forEach(([option, value]) => {
      if (value !== undefined && option !== 'theme') {
        processed[option] = value;
      }
    });
  });
  
  // Process special cases
  if (processed.rowSelection) {
    processed.rowSelection = normalizeRowSelection(processed.rowSelection);
  }
  
  if (processed.cellSelection !== undefined) {
    processed.cellSelection = normalizeCellSelection(processed.cellSelection);
  }
  
  return processed;
}

function categorizeSettingsBatches(settings: GridOptionsMap) {
  const batches = {
    special: [] as Array<[string, any]>,
    visual: [] as Array<[string, any]>,
    selection: [] as Array<[string, any]>,
    grouping: [] as Array<[string, any]>,
    immediate: [] as Array<[string, any]>,
    other: [] as Array<[string, any]>
  };
  
  Object.entries(settings).forEach(([key, value]) => {
    if (BATCH_STRATEGIES.special.includes(key)) {
      batches.special.push([key, value]);
    } else if (BATCH_STRATEGIES.visual.includes(key)) {
      batches.visual.push([key, value]);
    } else if (BATCH_STRATEGIES.selection.includes(key)) {
      batches.selection.push([key, value]);
    } else if (BATCH_STRATEGIES.grouping.includes(key)) {
      batches.grouping.push([key, value]);
    } else if (BATCH_STRATEGIES.immediate.includes(key)) {
      batches.immediate.push([key, value]);
    } else {
      batches.other.push([key, value]);
    }
  });
  
  return batches;
}

async function applyBatchedSettings(gridApi: GridApi, batch: Array<[string, any]>) {
  return new Promise<void>((resolve) => {
    // Use requestIdleCallback for better performance
    const callback = () => {
      batch.forEach(([key, value]) => {
        gridApi.setGridOption(key, value);
      });
      resolve();
    };
    
    if ('requestIdleCallback' in window) {
      requestIdleCallback(callback);
    } else {
      setTimeout(callback, 0);
    }
  });
}

function applySpecialSetting(gridApi: GridApi, key: string, value: any) {
  switch (key) {
    case 'defaultColDef':
      // Special handling for defaultColDef
      if (value && (value.verticalAlign || value.horizontalAlign)) {
        const colDefWithStyle = { ...value };
        colDefWithStyle.cellStyle = createCellStyleFunction(value.verticalAlign, value.horizontalAlign);
        gridApi.setGridOption('defaultColDef', colDefWithStyle);
      } else {
        gridApi.setGridOption('defaultColDef', value);
      }
      break;
      
    case 'statusBar':
      // Special handling for statusBar
      if (value === false || !value.statusPanels || value.statusPanels.length === 0) {
        gridApi.setGridOption('statusBar', false);
      } else {
        gridApi.setGridOption('statusBar', value);
      }
      break;
      
    case 'sideBar':
      // Special handling for sideBar
      if (value === false || value === '' || value === 'none') {
        gridApi.setGridOption('sideBar', false);
      } else {
        gridApi.setGridOption('sideBar', value);
      }
      break;
      
    default:
      gridApi.setGridOption(key, value);
  }
}

function createCellStyleFunction(verticalAlign: string, horizontalAlign: string) {
  return (params: any) => {
    const style: any = { display: 'flex' };
    
    if (verticalAlign) {
      if (verticalAlign === 'top' || verticalAlign === 'start') {
        style.alignItems = 'flex-start';
      } else if (verticalAlign === 'middle' || verticalAlign === 'center') {
        style.alignItems = 'center';
      } else if (verticalAlign === 'bottom' || verticalAlign === 'end') {
        style.alignItems = 'flex-end';
      }
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
    } else if (params.colDef.type === 'numericColumn') {
      style.justifyContent = 'flex-end';
    } else {
      style.justifyContent = 'flex-start';
    }
    
    return style;
  };
}

function extractChangedSettings(current: GridOptionsMap, initial: GridOptionsMap): GridOptionsMap {
  const changed: GridOptionsMap = {};
  
  Object.entries(current).forEach(([key, value]) => {
    if (JSON.stringify(value) !== JSON.stringify(initial[key])) {
      changed[key] = value;
    }
  });
  
  return changed;
}

function performOptimizedRefresh(gridApi: GridApi) {
  // Use requestAnimationFrame for smooth refresh
  requestAnimationFrame(() => {
    // Only refresh what's needed
    if (gridApi.refreshHeader) {
      gridApi.refreshHeader();
    }
    
    // Use partial refresh instead of full refresh when possible
    if (gridApi.refreshCells) {
      gridApi.refreshCells({ 
        force: false, // Only refresh changed cells
        suppressFlash: true // Avoid flashing
      });
    }
  });
}