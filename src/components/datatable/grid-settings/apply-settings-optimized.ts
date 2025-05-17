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
 * Define properties that should be applied at the column level, not grid level
 */
const COLUMN_DEF_PROPERTIES = [
  'sortable', 'resizable', 'filter', 'editable', 'flex', 'minWidth', 'maxWidth',
  'enableValue', 'enableRowGroup', 'enablePivot', 'sortingOrder', 
  'checkboxSelection', 'headerCheckboxSelection', 'cellStyle',
  'cellEditor', 'cellRenderer'
];

/**
 * Define properties that are part of rowSelection object in v33+
 */
const ROW_SELECTION_PROPERTIES = [
  'mode', 'enableSelectionWithoutKeys', 'enableClickSelection', 'checkboxes',
  'groupSelects', 'copySelectedRows', 'enableDeselection', 'enableMultiSelectWithClick'
];

/**
 * Transform deprecated properties to their v32+ equivalents
 */
function transformDeprecatedProperties(option: string, value: any): [string, any] | null {
  switch (option) {
    case 'rowMultiSelectWithClick':
      // Convert to rowSelection.enableSelectionWithoutKeys
      return ['rowSelection', { 
        mode: 'multiRow',
        enableSelectionWithoutKeys: value 
      }];
    
    case 'suppressRowClickSelection':
      // Convert to rowSelection.enableClickSelection (inverse)
      return ['rowSelection', {
        mode: 'singleRow',
        enableClickSelection: !value
      }];
    
    case 'suppressCellSelection':
      // Convert to cellSelection = false
      return ['cellSelection', false];
    
    case 'enableRangeSelection':
      // Convert to cellSelection = true
      return ['cellSelection', value];
    
    case 'groupRemoveSingleChildren':
      // Convert to groupHideParentOfSingleChild
      return ['groupHideParentOfSingleChild', value];
    
    case 'suppressCopyRowsToClipboard':
      // Convert to rowSelection.copySelectedRows (inverse)
      // Note: This should be merged with existing rowSelection object
      return ['rowSelection', {
        copySelectedRows: !value  // Inverted because it's "suppress"
      }];
    
    default:
      // Not a deprecated property
      return null;
  }
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

  // Process settings with proper nesting
  Object.entries(gridSettings).forEach(([category, categorySettings]) => {
    if (typeof categorySettings === 'object' && categorySettings !== null) {
      // Handle category-based structure from grid settings dialog
      switch (category) {
        case 'defaults':
          // This category contains defaultColDef settings
          if (categorySettings.defaultColDef) {
            const colDef: any = {};
            Object.entries(categorySettings.defaultColDef).forEach(([prop, value]) => {
              // Only include valid column definition properties
              if (COLUMN_DEF_PROPERTIES.includes(prop) || prop === 'cellStyle') {
                colDef[prop] = value;
              }
            });
            if (Object.keys(colDef).length > 0) {
              flattenedSettings.defaultColDef = colDef;
              changedOptions.add('defaultColDef');
              categorizedSettings.SPECIAL.push(['defaultColDef', colDef]);
            }
          }
          break;

        case 'selection':
          // Handle selection tab settings
          Object.entries(categorySettings).forEach(([option, value]) => {
            // Skip initial properties that cannot be updated at runtime
            if (INITIAL_PROPERTIES.includes(option)) {
              return;
            }
            
            // Check for deprecated properties first
            const transformed = transformDeprecatedProperties(option, value);
            
            if (transformed) {
              const [newOption, newValue] = transformed;
              
              // Skip if the transformed option is an initial property
              if (INITIAL_PROPERTIES.includes(newOption)) {
                return;
              }
              
              // For rowSelection, merge with existing value if present
              if (newOption === 'rowSelection' && flattenedSettings.rowSelection) {
                flattenedSettings.rowSelection = {
                  ...flattenedSettings.rowSelection,
                  ...newValue
                };
              } else if (newOption === 'cellSelection' && typeof flattenedSettings.cellSelection === 'object') {
                flattenedSettings.cellSelection = {
                  ...flattenedSettings.cellSelection,
                  ...newValue
                };
              } else {
                flattenedSettings[newOption] = newValue;
              }
              
              changedOptions.add(newOption);
              categorizedSettings.SELECTION.push([newOption, flattenedSettings[newOption]]);
            } else if (option === 'rowSelection') {
              // rowSelection is an object in v33+
              const normalizedRowSelection = normalizeRowSelection(value);
              flattenedSettings.rowSelection = normalizedRowSelection;
              changedOptions.add('rowSelection');
              categorizedSettings.SELECTION.push(['rowSelection', normalizedRowSelection]);
            } else if (option === 'cellSelection') {
              flattenedSettings.cellSelection = normalizeCellSelection(value);
              changedOptions.add('cellSelection');
              categorizedSettings.SELECTION.push(['cellSelection', flattenedSettings.cellSelection]);
            } else if (!ROW_SELECTION_PROPERTIES.includes(option) && !COLUMN_DEF_PROPERTIES.includes(option)) {
              // Other selection options like suppressRowDeselection
              flattenedSettings[option] = value;
              changedOptions.add(option);
              categorizedSettings.SELECTION.push([option, value]);
            }
          });
          break;

        default:
          // Process all other categories
          Object.entries(categorySettings).forEach(([option, value]) => {
            // Skip nested properties that shouldn't be at grid level
            if (COLUMN_DEF_PROPERTIES.includes(option) || 
                ROW_SELECTION_PROPERTIES.includes(option) ||
                /^\d+$/.test(option)) { // Skip numeric indices
              return;
            }

            if (value !== undefined && option !== 'theme') {
              // Skip initial properties that cannot be updated at runtime
              if (INITIAL_PROPERTIES.includes(option)) {
                return;
              }
              
              // Check for deprecated properties first
              const transformed = transformDeprecatedProperties(option, value);
              
              if (transformed) {
                const [newOption, newValue] = transformed;
                
                // Skip if the transformed option is an initial property
                if (INITIAL_PROPERTIES.includes(newOption)) {
                  return;
                }
                
                // For rowSelection, merge with existing value if present
                if (newOption === 'rowSelection' && flattenedSettings.rowSelection) {
                  flattenedSettings.rowSelection = {
                    ...flattenedSettings.rowSelection,
                    ...newValue
                  };
                } else {
                  flattenedSettings[newOption] = newValue;
                }
                
                changedOptions.add(newOption);
                
                // Categorize the transformed option
                if (newOption === 'rowSelection' || newOption === 'cellSelection') {
                  categorizedSettings.SELECTION.push([newOption, flattenedSettings[newOption]]);
                } else {
                  categorizedSettings.OTHER.push([newOption, newValue]);
                }
              } else {
                // Not a deprecated property, process normally
                flattenedSettings[option] = value;

                // Check if value has changed
                const initialValue = initialValues[option];
                const hasChanged = JSON.stringify(initialValue) !== JSON.stringify(value);
                
                // Always include statusBar and sideBar for special handling
                if (hasChanged || option === 'statusBar' || option === 'sideBar') {
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
            }
          });
          break;
      }
    }
  });

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
        try {
          // Skip initial properties
          if (INITIAL_PROPERTIES.includes(option)) {
            console.warn(`Skipping initial property '${option}' - cannot be updated at runtime`);
            return;
          }
          
          gridApi.setGridOption(option, value);
        } catch (error) {
          console.error(`Failed to apply setting '${option}':`, error);
        }
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
        
        // Remove alignment properties before passing to AG-Grid
        const { verticalAlign, horizontalAlign, ...cleanedValue } = value;
        const colDefWithStyle = { ...cleanedValue, cellStyle };
        gridApi.setGridOption('defaultColDef', colDefWithStyle);
      } else {
        gridApi.setGridOption('defaultColDef', value);
      }
      break;

    case 'statusBar':
      // Handle statusBar using updateGridOptions for proper UI update
      if (!value || value === false || (value?.statusPanels && value.statusPanels.length === 0)) {
        gridApi.updateGridOptions({ statusBar: null });
      } else {
        gridApi.updateGridOptions({ statusBar: value });
      }
      break;

    case 'sideBar':
      // Handle sideBar using updateGridOptions for proper UI update
      if (value === false || value === '' || value === 'none') {
        gridApi.updateGridOptions({ sideBar: false });
      } else {
        gridApi.updateGridOptions({ sideBar: value });
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