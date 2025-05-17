import { GridApi } from 'ag-grid-community';
import { GridSettingsState } from './grid-settings-dialog';
import { DEFAULT_GRID_OPTIONS, extractCurrentGridSettings } from '@/components/datatable/config/default-grid-options';

// Optimized settings loading from profile
export interface LoadSettingsResult {
  settings: GridSettingsState;
  loadTime: number;
  settingsCount: number;
}

/**
 * Optimized function to load settings from profile into the dialog
 */
export async function loadSettingsOptimized(
  gridApi: GridApi | null,
  profileManager: any,
  settingsController: any
): Promise<LoadSettingsResult> {
  const startTime = performance.now();
  const result: LoadSettingsResult = {
    settings: {},
    loadTime: 0,
    settingsCount: 0
  };

  if (!gridApi) {
    return result;
  }

  // Use Promise.all to load multiple data sources in parallel
  const [defaultOptions, currentGridSettings, profileData] = await Promise.all([
    // Load default options
    Promise.resolve(DEFAULT_GRID_OPTIONS),
    
    // Extract current grid settings
    new Promise<any>((resolve) => {
      requestIdleCallback(() => {
        resolve(extractCurrentGridSettings(gridApi));
      });
    }),
    
    // Load profile data
    new Promise<any>((resolve) => {
      const profileSettings = profileManager?.activeProfile?.settings;
      const storedOptions = profileSettings?.custom?.gridOptions || 
                            settingsController?.getCurrentGridOptions() || {};
      resolve(storedOptions);
    })
  ]);

  // Merge settings efficiently using spread operator
  const mergedSettings = { ...defaultOptions, ...currentGridSettings, ...profileData };
  
  // Process settings in parallel batches
  const processingTasks = [
    // Basic settings
    processBasicSettings(mergedSettings),
    
    // Selection settings
    processSelectionSettings(mergedSettings),
    
    // Visual settings
    processVisualSettings(mergedSettings),
    
    // Grouping settings
    processGroupingSettings(mergedSettings),
    
    // Data settings
    processDataSettings(mergedSettings),
    
    // Column settings
    processColumnSettings(mergedSettings),
    
    // Advanced settings
    processAdvancedSettings(mergedSettings)
  ];

  // Wait for all processing to complete
  const processedCategories = await Promise.all(processingTasks);
  
  // Combine all categories into final settings
  processedCategories.forEach(category => {
    Object.assign(result.settings, category);
  });

  // Count total settings
  Object.values(result.settings).forEach(category => {
    result.settingsCount += Object.keys(category).length;
  });

  result.loadTime = performance.now() - startTime;
  return result;
}

// Optimized processing functions for each category
async function processBasicSettings(settings: any): Promise<GridSettingsState> {
  return new Promise((resolve) => {
    requestIdleCallback(() => {
      resolve({
        basic: {
          rowHeight: settings.rowHeight,
          headerHeight: settings.headerHeight,
          rowModelType: settings.rowModelType,
        }
      });
    });
  });
}

async function processSelectionSettings(settings: any): Promise<GridSettingsState> {
  return new Promise((resolve) => {
    requestIdleCallback(() => {
      const rowSelection = settings.rowSelection;
      const cellSelection = settings.cellSelection;
      
      const normalizedRowMode = typeof rowSelection === 'object' && rowSelection?.mode ? 
        (rowSelection.mode === 'multiRow' ? 'multiple' : 
         rowSelection.mode === 'singleRow' ? 'single' : 
         rowSelection.mode) : 
        (typeof rowSelection === 'string' ? rowSelection : 'multiple');

      resolve({
        selection: {
          rowSelection: typeof rowSelection === 'object' ? {
            mode: normalizedRowMode,
            enableSelectionWithoutKeys: rowSelection.enableSelectionWithoutKeys ?? !!settings.rowMultiSelectWithClick,
            enableClickSelection: rowSelection.enableClickSelection ?? !settings.suppressRowClickSelection,
            checkboxes: rowSelection.checkboxes ?? true,
            groupSelects: rowSelection.groupSelects || (settings.groupSelectsChildren ? 'descendants' : 'none')
          } : normalizedRowMode,
          rowMultiSelectWithClick: typeof rowSelection === 'object' && 'enableSelectionWithoutKeys' in rowSelection ? 
            !!rowSelection.enableSelectionWithoutKeys : 
            !!settings.rowMultiSelectWithClick,
          suppressRowClickSelection: typeof rowSelection === 'object' && 'enableClickSelection' in rowSelection ? 
            !rowSelection.enableClickSelection : 
            !!settings.suppressRowClickSelection,
          suppressCellSelection: typeof cellSelection === 'boolean' ? 
            !cellSelection : 
            (typeof cellSelection === 'object' ? false : true),
          enableRangeSelection: typeof cellSelection === 'boolean' ? 
            cellSelection : 
            !!cellSelection,
        }
      });
    });
  });
}

async function processVisualSettings(settings: any): Promise<GridSettingsState> {
  return new Promise((resolve) => {
    requestIdleCallback(() => {
      resolve({
        appearance: {
          theme: settings.theme,
          animateRows: settings.animateRows,
          alwaysShowVerticalScroll: settings.alwaysShowVerticalScroll,
          domLayout: settings.domLayout,
        },
        sorting: {
          sortingOrder: settings.sortingOrder,
          multiSortKey: settings.multiSortKey,
          accentedSort: settings.accentedSort,
          enableAdvancedFilter: settings.enableAdvancedFilter,
          quickFilterText: settings.quickFilterText,
          cacheQuickFilter: settings.cacheQuickFilter,
          excludeChildrenWhenTreeDataFiltering: settings.excludeChildrenWhenTreeDataFiltering,
        },
        pagination: {
          pagination: settings.pagination,
          paginationPageSize: settings.paginationPageSize,
          paginationAutoPageSize: settings.paginationAutoPageSize,
          suppressPaginationPanel: settings.suppressPaginationPanel,
          paginationPageSizeSelector: settings.paginationPageSizeSelector,
        }
      });
    });
  });
}

async function processGroupingSettings(settings: any): Promise<GridSettingsState> {
  return new Promise((resolve) => {
    requestIdleCallback(() => {
      resolve({
        grouping: {
          groupUseEntireRow: settings.groupUseEntireRow,
          groupSelectsChildren: settings.groupSelectsChildren,
          groupRemoveSingleChildren: settings.groupRemoveSingleChildren,
          pivotMode: settings.pivotMode,
          pivotPanelShow: settings.pivotPanelShow,
          groupDefaultExpanded: settings.groupDefaultExpanded,
          rowGroupPanelShow: settings.rowGroupPanelShow,
          groupDisplayType: settings.groupDisplayType ?? 'singleColumn',
        },
        editing: {
          editType: settings.editType ?? 'none',
          singleClickEdit: settings.singleClickEdit,
          suppressClickEdit: settings.suppressClickEdit,
          enterMovesDown: settings.enterMovesDown,
          enterMovesDownAfterEdit: settings.enterMovesDownAfterEdit,
          undoRedoCellEditing: settings.undoRedoCellEditing,
          undoRedoCellEditingLimit: settings.undoRedoCellEditingLimit,
        }
      });
    });
  });
}

async function processDataSettings(settings: any): Promise<GridSettingsState> {
  return new Promise((resolve) => {
    requestIdleCallback(() => {
      resolve({
        data: {
          rowBuffer: settings.rowBuffer,
          valueCache: settings.valueCache,
          cellFlashDuration: settings.cellFlashDuration ?? settings.enableCellChangeFlash,
          getRowId: settings.getRowId ?? settings.getRowNodeId,
        },
        clipboard: {
          enableCellTextSelection: settings.enableCellTextSelection,
          suppressCopyRowsToClipboard: settings.suppressCopyRowsToClipboard,
          suppressCopySingleCellRanges: settings.suppressCopySingleCellRanges,
          clipboardDelimiter: settings.clipboardDelimiter,
          csvFilename: settings.csvFilename ?? settings.exporterCsvFilename,
          excelFilename: settings.excelFilename ?? settings.exporterExcelFilename,
        }
      });
    });
  });
}

async function processColumnSettings(settings: any): Promise<GridSettingsState> {
  return new Promise((resolve) => {
    requestIdleCallback(() => {
      const defaultColDef = settings.defaultColDef || DEFAULT_GRID_OPTIONS.defaultColDef;
      
      resolve({
        columns: {
          suppressDragLeaveHidesColumns: settings.suppressDragLeaveHidesColumns,
          suppressMovableColumns: settings.suppressMovableColumns,
          suppressFieldDotNotation: settings.suppressFieldDotNotation,
          suppressAutoSize: settings.suppressAutoSize,
        },
        defaults: {
          defaultColDef: {
            ...defaultColDef,
            verticalAlign: defaultColDef?.verticalAlign,
            horizontalAlign: defaultColDef?.horizontalAlign
          }
        },
        sizing: {
          headerHeight: settings.headerHeight,
          rowHeight: settings.rowHeight,
          floatingFiltersHeight: settings.floatingFiltersHeight,
          pivotHeaderHeight: settings.pivotHeaderHeight,
          pivotGroupHeaderHeight: settings.pivotGroupHeaderHeight,
          groupHeaderHeight: settings.groupHeaderHeight,
          suppressAutoSize: settings.suppressAutoSize,
          suppressSizeToFit: settings.suppressSizeToFit,
          suppressColumnVirtualisation: settings.suppressColumnVirtualisation,
          suppressRowVirtualisation: settings.suppressRowVirtualisation,
        }
      });
    });
  });
}

async function processAdvancedSettings(settings: any): Promise<GridSettingsState> {
  return new Promise((resolve) => {
    requestIdleCallback(() => {
      resolve({
        advanced: {
          enableCharts: settings.enableCharts,
          masterDetail: settings.masterDetail,
          suppressAggFuncInHeader: settings.suppressAggFuncInHeader,
          suppressColumnVirtualisation: settings.suppressColumnVirtualisation,
          suppressRowVirtualisation: settings.suppressRowVirtualisation,
        },
        ui: {
          suppressContextMenu: settings.suppressContextMenu,
          suppressMenuHide: settings.suppressMenuHide,
          suppressMovableColumns: settings.suppressMovableColumns,
          suppressColumnMoveAnimation: settings.suppressColumnMoveAnimation,
          loading: settings.loading,
          suppressNoRowsOverlay: settings.suppressNoRowsOverlay,
          sideBar: settings.sideBar,
          statusBar: settings.statusBar
        }
      });
    });
  });
}

/**
 * Cache for loaded settings to avoid redundant processing
 */
const settingsCache = new Map<string, { data: GridSettingsState, timestamp: number }>();
const CACHE_TTL = 5000; // 5 seconds

export function getCachedSettings(profileId: string): GridSettingsState | null {
  const cached = settingsCache.get(profileId);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  return null;
}

export function setCachedSettings(profileId: string, settings: GridSettingsState) {
  settingsCache.set(profileId, {
    data: settings,
    timestamp: Date.now()
  });
}

/**
 * Preload settings in the background for faster dialog opening
 */
export function preloadSettings(gridApi: GridApi, profileManager: any, settingsController: any) {
  if (!gridApi || !profileManager?.activeProfile?.id) return;
  
  // Check cache first
  const cached = getCachedSettings(profileManager.activeProfile.id);
  if (cached) return;
  
  // Load in background
  loadSettingsOptimized(gridApi, profileManager, settingsController).then(result => {
    setCachedSettings(profileManager.activeProfile.id, result.settings);
  });
}