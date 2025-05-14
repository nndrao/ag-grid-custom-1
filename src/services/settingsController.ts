import { ProfileSettings, ToolbarSettings, GridSettings } from '@/types/profile.types';
import { GridStateProvider } from './gridStateProvider';
import { GridApi as AgGridApi, GridOptions, ManagedGridOptionKey, ColDef, ColumnState, RowSelectionOptions, CellSelectionOptions } from 'ag-grid-community';

// Define a more specific type for grid options
export type GridOptionValue = string | number | boolean | object | null | undefined | Function | ColDef[];
export type GridOptionsMap = Partial<GridOptions>; // Use GridOptions for better type safety

export class SettingsController {
  private gridStateProvider: GridStateProvider;
  private currentToolbarSettings: Partial<ToolbarSettings> = {};
  private currentGridOptions: GridOptionsMap = {};
  private settingsChangeListeners: Array<(settings: Partial<ToolbarSettings>) => void> = [];
  private gridOptionsChangeListeners: Array<(options: GridOptionsMap) => void> = [];

  constructor(gridStateProvider: GridStateProvider) {
    this.gridStateProvider = gridStateProvider;
  }

  updateToolbarSettings(settings: Partial<ToolbarSettings>): void {
    this.currentToolbarSettings = { ...this.currentToolbarSettings, ...settings };
    
    // Notify any listeners about the settings change
    this.settingsChangeListeners.forEach(listener => {
      listener(this.currentToolbarSettings);
    });
  }

  // Method to register a listener for settings changes
  onToolbarSettingsChange(listener: (settings: Partial<ToolbarSettings>) => void): () => void {
    this.settingsChangeListeners.push(listener);
    
    // Return a function to unregister the listener
    return () => {
      this.settingsChangeListeners = this.settingsChangeListeners.filter(l => l !== listener);
    };
  }

  getCurrentToolbarSettings(): Partial<ToolbarSettings> {
    return { ...this.currentToolbarSettings };
  }

  // Update grid options
  updateGridOptions(options: GridOptionsMap): void {
    this.currentGridOptions = { ...this.currentGridOptions, ...options };
    
    // Notify any listeners about the options change
    this.gridOptionsChangeListeners.forEach(listener => {
      listener(this.currentGridOptions);
    });
  }

  // Method to register a listener for grid options changes
  onGridOptionsChange(listener: (options: GridOptionsMap) => void): () => void {
    this.gridOptionsChangeListeners.push(listener);
    
    // Return a function to unregister the listener
    return () => {
      this.gridOptionsChangeListeners = this.gridOptionsChangeListeners.filter(l => l !== listener);
    };
  }

  getCurrentGridOptions(): GridOptionsMap {
    return { ...this.currentGridOptions };
  }

  // Collect current grid and toolbar settings
  collectCurrentSettings(): ProfileSettings {
    // Create a clean copy of all settings to avoid references that could trigger side effects
    return {
      toolbar: { ...this.currentToolbarSettings } as ToolbarSettings,
      grid: this.gridStateProvider.extractGridState(),
      custom: {
        gridOptions: { ...this.currentGridOptions }
      }
    };
  }

  // Apply settings from a profile
  applyProfileSettings(settings: ProfileSettings): void {
    console.log("🔧 Applying profile settings:", settings);
    
    // Apply toolbar settings first (non-grid related)
    if (settings.toolbar) {
      this.updateToolbarSettings(settings.toolbar);
    } else {
      // If toolbar settings are missing, use an empty object to avoid errors
      console.warn("⚠️ Profile has no toolbar settings, using defaults");
    }
    
    // Apply grid settings
    if (settings.grid) {
      const columnWidthsToApply: { key: string; newWidth: number }[] = [];
      
      // Get widths from columnState
      if (settings.grid.columnState) {
        settings.grid.columnState.forEach((col: ColumnState) => {
          if (col.colId && col.width !== undefined) {
            columnWidthsToApply.push({ key: col.colId, newWidth: col.width });
          }
        });
      }
      
      // Get widths from columnSizingState (more specific)
      const gridSettingsWithPotentialSizing = settings.grid as any; // Keep `any` for this specific community-driven property
      if (gridSettingsWithPotentialSizing.columnSizingState?.columnWidths) {
        Object.entries(gridSettingsWithPotentialSizing.columnSizingState.columnWidths).forEach(([key, value]) => {
          // Remove if already present from columnState to prioritize columnSizingState
          const existingIndex = columnWidthsToApply.findIndex(c => c.key === key);
          if (existingIndex > -1) columnWidthsToApply.splice(existingIndex, 1);
          columnWidthsToApply.push({ key, newWidth: value as number });
        });
      }
      
      console.log("🔧 Applying grid state with column info:", 
        columnWidthsToApply.length ? 
        `${columnWidthsToApply.length} column widths to preserve` : 
        "No column width information available");
      
      // Apply grid state
      setTimeout(() => {
        // Apply all grid state first
        this.gridStateProvider.applyGridState(settings.grid as GridSettings);
        
        // Then force the exact column widths
        const gridApiInstance = this.gridStateProvider.getGridApi();
        if (columnWidthsToApply.length > 0 && gridApiInstance) {
          const columnApi = gridApiInstance.columnApi; // Corrected: Access columnApi directly
          if (columnApi) {
            setTimeout(() => {
              console.log("🔧 Forcing exact column widths:", columnWidthsToApply);
              columnApi.setColumnWidths(columnWidthsToApply);
              gridApiInstance.refreshHeader(); // Refresh header after width changes
            }, 100);
          }
        }
      }, 50);
    }
    
    // Apply custom grid options if available
    if (settings.custom?.gridOptions) {
      const processedOptions: GridOptionsMap = {};
      const initialProperties: Array<keyof GridOptions> = [
        'rowModelType',
        'cacheQuickFilter',
        'paginationPageSizeSelector',
        'pivotPanelShow',
        'undoRedoCellEditing',
        'undoRedoCellEditingLimit',
        'suppressAutoSize',
        'valueCache',
        // suppressLoadingOverlay is handled by the 'loading' property now
      ];

      Object.entries(settings.custom.gridOptions).forEach(([option, value]) => {
        if (value === undefined) return;
        const optKey = option as keyof GridOptions;

        const ensureRowSelectionObject = (currentSelection: GridOptions['rowSelection']): Partial<RowSelectionOptions> => {
          if (typeof currentSelection === 'object' && currentSelection !== null) {
            return currentSelection;
          }
          // If it's a string ('single' or 'multiple') or undefined, start fresh with a mode
          return { mode: currentSelection === 'singleRow' ? 'singleRow' : 'multiRow' };
        };

        switch (optKey) {
          case 'rowMultiSelectWithClick':
            processedOptions.rowSelection = { 
              ...ensureRowSelectionObject(processedOptions.rowSelection), 
              enableSelectionWithoutKeys: value as boolean 
            };
            break;
          case 'suppressRowClickSelection':
            processedOptions.rowSelection = { 
              ...ensureRowSelectionObject(processedOptions.rowSelection), 
              enableClickSelection: !(value as boolean) 
            };
            break;
          case 'enableRangeSelection':
            processedOptions.cellSelection = value as boolean;
            break;
          case 'enableRangeHandle':
            processedOptions.cellSelection = typeof processedOptions.cellSelection === 'object' && processedOptions.cellSelection !== null 
                                              ? { ...processedOptions.cellSelection, handle: value as boolean } 
                                              : { handle: value as boolean }; // This might still need adjustment based on CellSelectionOptions['handle'] type
            break;
          case 'suppressRowDeselection':
            processedOptions.rowSelection = { 
              ...ensureRowSelectionObject(processedOptions.rowSelection), 
              enableClickSelection: !(value as boolean) 
            };
            break;
          case 'defaultColDef':
            // Special handling for defaultColDef to ensure cell alignment properties work properly
            if (typeof value === 'object' && value !== null) {
              const colDef = value as any;
              
              // Process vertical and horizontal alignment
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
              }
              
              processedOptions.defaultColDef = colDef;
            }
            break;
          case 'groupSelectsChildren':
            processedOptions.rowSelection = { 
              ...ensureRowSelectionObject(processedOptions.rowSelection), 
              groupSelectsChildren: value as boolean // Assuming groupSelectsChildren is a valid boolean prop for RowSelectionOptions
            };
            break;
          case 'groupRemoveSingleChildren':
            processedOptions.groupHideParentOfSingleChild = value as boolean;
            break;
          case 'suppressCopyRowsToClipboard':
            processedOptions.rowSelection = { 
              ...ensureRowSelectionObject(processedOptions.rowSelection), 
              copySelectedRows: !(value as boolean) 
            };
            break;
          case 'suppressCopySingleCellRanges':
            processedOptions.rowSelection = { 
              ...ensureRowSelectionObject(processedOptions.rowSelection), 
              copySelectedRows: !(value as boolean) 
            };
            break;
          case 'suppressLoadingOverlay': // Deprecated
            processedOptions.loading = !(value as boolean); // Modern equivalent
            break;
          default:
            (processedOptions as any)[optKey] = value;
            break;
        }
      });

      // Update our internal reference with processed options
      this.currentGridOptions = { ...processedOptions };
      
      // Apply to grid if possible
      const gridApiInstance = this.gridStateProvider.getGridApi();
      if (gridApiInstance) {
        setTimeout(() => {
          try {
            // Utility: list of AG Grid v33+ invalid/deprecated options
            const INVALID_GRID_OPTIONS = [
              'verticalAlign',
              'horizontalAlign',
              'immutableData',
              'suppressCellSelection',
              'groupIncludeFooter',
              'suppressPropertyNamesCheck',
              'suppressBrowserResizeObserver',
              'debug',
              'stopEditingWhenCellsLoseFocus',
              'sortingOrder', // only allow on defaultColDef
              // add more as needed
            ];
            function isInvalidGridOption(optKey: string, value: any): boolean {
              if (INVALID_GRID_OPTIONS.includes(optKey)) {
                // sortingOrder is only valid on defaultColDef
                if (optKey === 'sortingOrder') {
                  return true;
                }
                return true;
              }
              // Check for colDef/defaultColDef
              if (optKey === 'defaultColDef' && value && typeof value === 'object') {
                // Remove verticalAlign/horizontalAlign from colDef
                if ('verticalAlign' in value) delete value.verticalAlign;
                if ('horizontalAlign' in value) delete value.horizontalAlign;
                if ('sortingOrder' in value && !Array.isArray(value.sortingOrder)) delete value.sortingOrder;
              }
              if (optKey === 'colDefs' && Array.isArray(value)) {
                value.forEach((col: any) => {
                  if ('verticalAlign' in col) delete col.verticalAlign;
                  if ('horizontalAlign' in col) delete col.horizontalAlign;
                  if ('sortingOrder' in col && !Array.isArray(col.sortingOrder)) delete col.sortingOrder;
                });
              }
              return false;
            }
            // Actually apply only valid grid options
            Object.entries(this.currentGridOptions).forEach(([option, value]) => {
              const optKey = option as string;
              if (value !== undefined && !initialProperties.includes(optKey as keyof GridOptions)) {
                if(optKey !== 'theme' && !isInvalidGridOption(optKey, value)){
                  gridApiInstance.setGridOption(optKey, value);
                }
              }
            });
          } catch (error) {
            console.error('Error applying grid options:', error);
          }
        }, 100);
      }
      
      // Notify listeners with processed options
      this.gridOptionsChangeListeners.forEach(listener => {
        listener(this.currentGridOptions);
      });
    }
  }
} 