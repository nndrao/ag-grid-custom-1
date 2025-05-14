import { CellSelectionOptions, ColDef, GridOptions, RowSelectionOptions } from 'ag-grid-community';

/**
 * A utility type that allows indexing with strings while maintaining proper typing
 */
export type IndexableGridOptions = GridOptions & {
  [key: string]: any;
};

/**
 * AG-Grid v33+ uses different row selection enum values
 */
export const ROW_SELECTION_MODE_MAP = {
  'multiple': 'multiRow',
  'single': 'singleRow'
} as const;

/**
 * Default grid options used when no settings have been persisted.
 * These match the defaults in the Grid Settings dialog.
 */
export const DEFAULT_GRID_OPTIONS: GridOptions = {
  // Basic grid configuration
  rowHeight: 30,  // Default row height
  headerHeight: 40,  // Default header height
  rowModelType: 'clientSide',  // Default row model
  
  // Default column definitions
  defaultColDef: {
    sortable: true,
    resizable: true,
    filter: true,
    editable: false,
    flex: 1,
    minWidth: 100,
    enableValue: true,
    enableRowGroup: true,
    enablePivot: true,
    sortingOrder: ['asc', 'desc', null], // AG Grid v33+ sorting order
    cellStyle: () => ({ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }), // Alignment via flex
  },

  // Selection options
  rowSelection: {
    mode: 'multiRow', // AG-Grid v33+ uses multiRow instead of multiple
    enableSelectionWithoutKeys: false, // Maps to rowMultiSelectWithClick
    enableClickSelection: true, // Maps to !suppressRowClickSelection
    copySelectedRows: true // Maps to !suppressCopyRowsToClipboard
  },
  enableRangeSelection: false, // AG-Grid v33+ property for cell selection

  // Sorting & Filtering options
  multiSortKey: 'ctrl',  // Default multi-sort key
  accentedSort: false,  // Default accented sort
  enableAdvancedFilter: false,  // Default advanced filter
  quickFilterText: '',  // Default quick filter text
  
  // Pagination options
  pagination: false,  // Default pagination
  paginationAutoPageSize: false,  // Default pagination auto page size
  paginationPageSize: 100,  // Default pagination page size
  
  // Grouping & Pivoting options
  groupDefaultExpanded: 0,  // Default group expanded level
  groupDisplayType: 'groupRows',  // Default group display type
  // groupIncludeFooter removed: not supported in AG Grid v33+
  // If needed, use groupRowRendererParams or similar supported options
  groupHideOpenParents: false,  // Default group hide open parents
  groupHideParentOfSingleChild: false,  // Maps to groupRemoveSingleChildren

  // Editing options
  editType: 'fullRow',  // Default edit type - AG-Grid v33+ uses fullRow
  readOnlyEdit: false,  // Default read-only edit
  singleClickEdit: false,  // Default single click edit
  // stopEditingWhenCellsLoseFocus removed: initial-only property, not supported for runtime update
  
  // Styling & Appearance options
  rowClass: '',  // Default row class
  rowClassRules: {},  // Default row class rules
  suppressMenuHide: false,  // Default suppress menu hide
  
  // Column features
  suppressMovableColumns: false,  // Default suppress movable columns
  suppressColumnMoveAnimation: false,  // Default suppress column move animation
  suppressAutoSize: false,  // Default suppress auto size
  autoSizePadding: 4,  // Default auto size padding
  
  // UI components
  sideBar: false,  // Default side bar
  statusBar: { statusPanels: [] },  // Default status bar with empty panels
  
  // Data rendering
  rowBuffer: 20,  // Default row buffer
  valueCache: false,  // Default value cache
  
  // Clipboard & Export
  enableCellTextSelection: true,  // Default enable cell text selection
  suppressCopyRowsToClipboard: false,  // Default suppress copy rows to clipboard
  
  // Advanced features
  // suppressPropertyNamesCheck removed: not supported in AG Grid v33+
  // suppressBrowserResizeObserver removed: not supported in AG Grid v33+
  // debug removed: initial-only property, not supported for runtime update
  
  // Localization & Accessibility
  pivotHeaderHeight: 56,  // Default pivot header height
  
  // Loading settings
  loading: false,  // Hide loading overlay by default (replaces deprecated suppressLoadingOverlay)
};

/**
 * Properties that cannot be updated at runtime through the setGridOption API.
 * These require a grid rebuild.
 */
export const INITIAL_PROPERTIES = [
  'rowModelType',
  'cacheQuickFilter',
  'paginationPageSizeSelector',
  'pivotPanelShow',
  'undoRedoCellEditing',
  'undoRedoCellEditingLimit',
  'suppressAutoSize',
  'valueCache'
  // Note: suppressLoadingOverlay removed from this list to allow runtime updates
];

/**
 * Helper function to extract current settings from grid API
 */
export function extractCurrentGridSettings(gridApi: any): IndexableGridOptions {
  if (!gridApi) return { ...DEFAULT_GRID_OPTIONS };
  
  const currentSettings: IndexableGridOptions = {};
  
  // Extract each property from the grid API or use default
  Object.keys(DEFAULT_GRID_OPTIONS).forEach(key => {
    const gridValue = gridApi.getGridOption(key);
    if (gridValue !== undefined) {
      currentSettings[key] = gridValue;
    } else {
      currentSettings[key] = DEFAULT_GRID_OPTIONS[key as keyof GridOptions];
    }
  });
  
  return currentSettings;
}

/**
 * Helper function to convert legacy row selection to AG-Grid v33+ format
 */
export function normalizeRowSelection(selection: any): any {
  // Handle string format from older versions
  if (typeof selection === 'string') {
    // Convert 'multiple' to 'multiRow' and 'single' to 'singleRow'
    const mode = selection === 'multiple' ? 'multiRow' : 
               selection === 'single' ? 'singleRow' : selection;
    return { mode };
  }
  
  // Already an object, make sure mode is correct
  if (selection && typeof selection === 'object') {
    const result = { ...selection };
    if (result.mode === 'multiple') result.mode = 'multiRow';
    if (result.mode === 'single') result.mode = 'singleRow';
    return result;
  }
  
  // Default
  return { mode: 'multiRow' };
}

/**
 * Helper function to convert legacy cell selection to AG-Grid v33+ format
 */
export function normalizeCellSelection(selection: any): any {
  // Handle boolean format
  if (typeof selection === 'boolean') {
    return selection;
  }
  
  // Already an object
  if (selection && typeof selection === 'object') {
    return selection;
  }
  
  // Default
  return false;
}
