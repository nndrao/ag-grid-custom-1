import { GridApi, GridOptions } from 'ag-grid-community';
import { GridOptionsMap } from './grid-settings-dialog';
import { DEFAULT_GRID_OPTIONS, INITIAL_PROPERTIES, normalizeRowSelection, normalizeCellSelection } from '@/components/datatable/config/default-grid-options';

// Performance optimization flags
const OPTIMIZATION_FLAGS = {
  USE_BATCH_UPDATE: true,
  USE_TRANSACTION: true,
  DEFER_REFRESH: true,
  INCREMENTAL_UPDATE: true,
  CACHE_COMPUTED_VALUES: true
};

// Categories for optimized batch processing
const OPTION_CATEGORIES = {
  // Options that affect layout and require full refresh
  LAYOUT: ['rowHeight', 'headerHeight', 'floatingFiltersHeight', 'pivotHeaderHeight', 'pivotGroupHeaderHeight', 'groupHeaderHeight'],
  
  // Options that affect data display
  DATA: ['rowBuffer', 'valueCache', 'cellFlashDuration', 'getRowId'],
  
  // Options that affect selection behavior 
  SELECTION: ['rowSelection', 'cellSelection', 'suppressRowDeselection'],
  
  // Options that affect grouping
  GROUPING: ['groupDisplayType', 'groupDefaultExpanded', 'pivotMode', 'groupUseEntireRow'],
  
  // Options that can be applied without refresh
  NO_REFRESH: ['animateRows', 'suppressNoRowsOverlay', 'loading', 'quickFilterText'],
  
  // Options that require special handling
  SPECIAL: ['defaultColDef', 'statusBar', 'sideBar', 'theme'],
  
  // Options that affect column behavior
  COLUMNS: ['suppressMovableColumns', 'suppressColumnMoveAnimation', 'suppressAutoSize', 'suppressFieldDotNotation'],
  
  // Options that affect editing
  EDITING: ['editType', 'singleClickEdit', 'suppressClickEdit', 'enterMovesDown', 'enterMovesDownAfterEdit']
};

// Value cache for computed properties
const computedValueCache = new Map<string, any>();

export interface OptimizedApplyResult {
  success: boolean;
  appliedSettings: string[];
  errors: string[];
  performanceMetrics: {
    totalTime: number;
    preprocessTime: number;
    applyTime: number;
    refreshTime: number;
  };
}

/**
 * Highly optimized function to apply settings to AG-Grid
 */
export async function applySettingsOptimized(
  gridApi: GridApi,
  gridSettings: GridOptionsMap,
  initialValues: GridOptionsMap,
  settingsController?: any
): Promise<OptimizedApplyResult> {
  const startTime = performance.now();
  const result: OptimizedApplyResult = {
    success: true,
    appliedSettings: [],
    errors: [],
    performanceMetrics: {
      totalTime: 0,
      preprocessTime: 0,
      applyTime: 0,
      refreshTime: 0
    }
  };

  try {
    // Phase 1: Preprocess settings
    const preprocessStart = performance.now();
    const { flattenedSettings, changedOptions, categorizedSettings } = preprocessSettings(gridSettings, initialValues);
    result.performanceMetrics.preprocessTime = performance.now() - preprocessStart;

    // Phase 2: Apply settings in optimized batches
    const applyStart = performance.now();
    
    if (OPTIMIZATION_FLAGS.USE_BATCH_UPDATE) {
      await applyInBatches(gridApi, categorizedSettings, result);
    } else {
      await applyIndividually(gridApi, flattenedSettings, result);
    }
    
    result.performanceMetrics.applyTime = performance.now() - applyStart;

    // Phase 3: Persist changed settings
    if (settingsController && changedOptions.size > 0) {
      const changedSettings: GridOptionsMap = {};
      changedOptions.forEach(option => {
        if (flattenedSettings[option] !== undefined) {
          changedSettings[option] = flattenedSettings[option];
        }
      });
      settingsController.updateGridOptions(changedSettings);
    }

    // Phase 4: Perform optimized refresh
    const refreshStart = performance.now();
    if (OPTIMIZATION_FLAGS.DEFER_REFRESH) {
      await performDeferredRefresh(gridApi, categorizedSettings);
    } else {
      performImmediateRefresh(gridApi);
    }
    result.performanceMetrics.refreshTime = performance.now() - refreshStart;

  } catch (error) {
    result.success = false;
    result.errors.push(error instanceof Error ? error.message : 'Unknown error');
  }

  result.performanceMetrics.totalTime = performance.now() - startTime;
  return result;
}

/**
 * Preprocess settings for optimal application
 */
function preprocessSettings(gridSettings: GridOptionsMap, initialValues: GridOptionsMap) {
  const flattenedSettings: GridOptionsMap = {};
  const changedOptions = new Set<string>();
  const categorizedSettings: Record<string, Array<[string, any]>> = {
    LAYOUT: [],
    DATA: [],
    SELECTION: [],
    GROUPING: [],
    NO_REFRESH: [],
    SPECIAL: [],
    COLUMNS: [],
    EDITING: [],
    OTHER: []
  };

  // Flatten and categorize settings
  Object.entries(gridSettings).forEach(([category, categorySettings]) => {
    if (typeof categorySettings === 'object' && categorySettings !== null) {
      Object.entries(categorySettings).forEach(([option, value]) => {
        if (value !== undefined && option !== 'theme') {
          flattenedSettings[option] = value;

          // Check if value has changed
          const initialValue = initialValues[option];
          if (JSON.stringify(initialValue) !== JSON.stringify(value)) {
            changedOptions.add(option);

            // Categorize the option
            let categorized = false;
            for (const [cat, options] of Object.entries(OPTION_CATEGORIES)) {
              if (options.includes(option)) {
                categorizedSettings[cat].push([option, value]);
                categorized = true;
                break;
              }
            }
            if (!categorized) {
              categorizedSettings.OTHER.push([option, value]);
            }
          }
        }
      });
    }
  });

  // Apply normalizations
  if (flattenedSettings.rowSelection) {
    flattenedSettings.rowSelection = normalizeRowSelection(flattenedSettings.rowSelection);
  }

  if (flattenedSettings.cellSelection !== undefined) {
    flattenedSettings.cellSelection = normalizeCellSelection(flattenedSettings.cellSelection);
  }

  return { flattenedSettings, changedOptions, categorizedSettings };
}

/**
 * Apply settings in optimized batches
 */
async function applyInBatches(
  gridApi: GridApi,
  categorizedSettings: Record<string, Array<[string, any]>>,
  result: OptimizedApplyResult
) {
  // Apply special settings first (they might affect others)
  for (const [option, value] of categorizedSettings.SPECIAL) {
    try {
      await applySpecialSetting(gridApi, option, value);
      result.appliedSettings.push(option);
    } catch (error) {
      result.errors.push(`Failed to apply ${option}: ${error}`);
    }
  }

  // Apply settings that don't require refresh
  const noRefreshBatch = categorizedSettings.NO_REFRESH;
  if (noRefreshBatch.length > 0) {
    await applyBatch(gridApi, noRefreshBatch, false);
  }

  // Apply layout settings as a batch
  const layoutBatch = [...categorizedSettings.LAYOUT, ...categorizedSettings.COLUMNS];
  if (layoutBatch.length > 0) {
    await applyBatch(gridApi, layoutBatch, true);
  }

  // Apply data and selection settings
  const dataBatch = [...categorizedSettings.DATA, ...categorizedSettings.SELECTION];
  if (dataBatch.length > 0) {
    await applyBatch(gridApi, dataBatch, true);
  }

  // Apply grouping settings
  if (categorizedSettings.GROUPING.length > 0) {
    await applyBatch(gridApi, categorizedSettings.GROUPING, true);
  }

  // Apply editing settings
  if (categorizedSettings.EDITING.length > 0) {
    await applyBatch(gridApi, categorizedSettings.EDITING, true);
  }

  // Apply remaining settings
  if (categorizedSettings.OTHER.length > 0) {
    await applyBatch(gridApi, categorizedSettings.OTHER, true);
  }
}

/**
 * Apply a batch of settings
 */
async function applyBatch(
  gridApi: GridApi,
  batch: Array<[string, any]>,
  requiresRefresh: boolean
): Promise<void> {
  return new Promise((resolve) => {
    const applyFn = () => {
      // Use transaction if available
      if (OPTIMIZATION_FLAGS.USE_TRANSACTION && gridApi.startUpdateTransaction) {
        gridApi.startUpdateTransaction();
      }

      batch.forEach(([option, value]) => {
        gridApi.setGridOption(option, value);
      });

      if (OPTIMIZATION_FLAGS.USE_TRANSACTION && gridApi.completeUpdateTransaction) {
        gridApi.completeUpdateTransaction();
      }

      resolve();
    };

    // Use requestIdleCallback for better performance
    if ('requestIdleCallback' in window) {
      requestIdleCallback(applyFn, { timeout: 50 });
    } else {
      setTimeout(applyFn, 0);
    }
  });
}

/**
 * Apply special settings that require custom handling
 */
async function applySpecialSetting(gridApi: GridApi, option: string, value: any): Promise<void> {
  switch (option) {
    case 'defaultColDef':
      // Handle alignment properties specially
      if (value && (value.verticalAlign || value.horizontalAlign)) {
        const cacheKey = `cellStyle_${value.verticalAlign}_${value.horizontalAlign}`;
        let cellStyle = computedValueCache.get(cacheKey);
        
        if (!cellStyle && OPTIMIZATION_FLAGS.CACHE_COMPUTED_VALUES) {
          cellStyle = createOptimizedCellStyle(value.verticalAlign, value.horizontalAlign);
          computedValueCache.set(cacheKey, cellStyle);
        }
        
        const colDefWithStyle = { ...value, cellStyle };
        gridApi.setGridOption('defaultColDef', colDefWithStyle);
      } else {
        gridApi.setGridOption('defaultColDef', value);
      }
      break;

    case 'statusBar':
      // Optimize statusBar setting
      if (!value || value === false || (value.statusPanels && value.statusPanels.length === 0)) {
        gridApi.setGridOption('statusBar', false);
      } else {
        gridApi.setGridOption('statusBar', value);
      }
      break;

    case 'sideBar':
      // Optimize sideBar setting
      if (value === false || value === '' || value === 'none') {
        gridApi.setGridOption('sideBar', false);
      } else {
        gridApi.setGridOption('sideBar', value);
      }
      break;

    default:
      gridApi.setGridOption(option, value);
  }
}

/**
 * Create optimized cell style function
 */
function createOptimizedCellStyle(verticalAlign: string, horizontalAlign: string) {
  // Pre-compute style object
  const baseStyle: any = { display: 'flex' };
  
  if (verticalAlign) {
    if (verticalAlign === 'top' || verticalAlign === 'start') {
      baseStyle.alignItems = 'flex-start';
    } else if (verticalAlign === 'middle' || verticalAlign === 'center') {
      baseStyle.alignItems = 'center';
    } else if (verticalAlign === 'bottom' || verticalAlign === 'end') {
      baseStyle.alignItems = 'flex-end';
    }
  }

  // Return optimized function
  return (params: any) => {
    const style = { ...baseStyle };
    
    if (horizontalAlign) {
      style.justifyContent = horizontalAlign === 'left' ? 'flex-start' :
                            horizontalAlign === 'center' ? 'center' :
                            horizontalAlign === 'right' ? 'flex-end' : 'flex-start';
    } else if (params.colDef?.type === 'numericColumn') {
      style.justifyContent = 'flex-end';
    } else {
      style.justifyContent = 'flex-start';
    }
    
    return style;
  };
}

/**
 * Perform deferred refresh based on what changed
 */
async function performDeferredRefresh(
  gridApi: GridApi,
  categorizedSettings: Record<string, Array<[string, any]>>
): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      // Determine what needs to be refreshed
      const needsHeaderRefresh = categorizedSettings.LAYOUT.length > 0 || 
                                categorizedSettings.COLUMNS.length > 0;
      const needsCellRefresh = categorizedSettings.DATA.length > 0 || 
                              categorizedSettings.SELECTION.length > 0 ||
                              categorizedSettings.GROUPING.length > 0 ||
                              categorizedSettings.EDITING.length > 0;

      // Perform minimal necessary refresh
      if (needsHeaderRefresh && gridApi.refreshHeader) {
        gridApi.refreshHeader();
      }

      if (needsCellRefresh && gridApi.refreshCells) {
        // Use incremental refresh if possible
        if (OPTIMIZATION_FLAGS.INCREMENTAL_UPDATE) {
          gridApi.refreshCells({
            force: false,
            suppressFlash: true
          });
        } else {
          gridApi.refreshCells({
            force: true,
            suppressFlash: true
          });
        }
      }

      resolve();
    });
  });
}

/**
 * Perform immediate refresh (fallback)
 */
function performImmediateRefresh(gridApi: GridApi) {
  if (gridApi.refreshHeader) {
    gridApi.refreshHeader();
  }
  
  if (gridApi.refreshCells) {
    gridApi.refreshCells({
      force: true,
      suppressFlash: false
    });
  }
}

/**
 * Apply settings individually (fallback)
 */
async function applyIndividually(
  gridApi: GridApi,
  settings: GridOptionsMap,
  result: OptimizedApplyResult
) {
  for (const [option, value] of Object.entries(settings)) {
    try {
      if (!INITIAL_PROPERTIES.includes(option)) {
        await applySpecialSetting(gridApi, option, value);
        result.appliedSettings.push(option);
      }
    } catch (error) {
      result.errors.push(`Failed to apply ${option}: ${error}`);
    }
  }
}