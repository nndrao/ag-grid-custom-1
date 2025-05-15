import { ProfileSettings, ToolbarSettings, GridSettings } from '@/types/profile.types';
import { GridStateProvider } from './gridStateProvider';
import { GridApi as AgGridApi, GridOptions, ManagedGridOptionKey, ColDef, ColumnState, RowSelectionOptions, CellSelectionOptions } from 'ag-grid-community';
import { DEFAULT_GRID_OPTIONS } from '@/components/datatable/config/default-grid-options';
import { deepClone } from '@/utils/deepClone';

// Default font to use across the application
export const DEFAULT_FONT_FAMILY = 'monospace';
export const DEFAULT_FONT_SIZE = 12;
export const HEADER_FONT_SIZE_OFFSET = 2;
export const DEFAULT_SPACING = 6;
export const MIN_FONT_SIZE = 6;

// Define a more specific type for grid options
export type GridOptionValue = string | number | boolean | object | null | undefined | Function | ColDef[];
export type GridOptionsMap = Partial<GridOptions>; // Use GridOptions for better type safety

export class SettingsController {
  private gridStateProvider: GridStateProvider;
  private currentToolbarSettings: Partial<ToolbarSettings> = {};
  private currentGridOptions: GridOptionsMap = {};
  private settingsChangeListeners: Array<(settings: Partial<ToolbarSettings>) => void> = [];
  private gridOptionsChangeListeners: Array<(options: GridOptionsMap) => void> = [];
  private pendingSettingsOperation: number | null = null;
  private isApplyingSettings = false;

  constructor(gridStateProvider: GridStateProvider) {
    this.gridStateProvider = gridStateProvider;
    
    // Always initialize with fresh default settings
    this.resetToDefaults();
  }

  /**
   * Reset internal state to default values
   * This is important when creating a new profile to avoid inheriting settings
   */
  resetToDefaults(): void {
    // Reset toolbar settings to default
    this.currentToolbarSettings = {
      fontFamily: DEFAULT_FONT_FAMILY,
      fontSize: DEFAULT_FONT_SIZE,
      spacing: DEFAULT_SPACING
    };
    
    // Reset grid options to default 
    this.currentGridOptions = deepClone(DEFAULT_GRID_OPTIONS);
    
    // Notify listeners about the reset
    this.settingsChangeListeners.forEach(listener => {
      listener(this.currentToolbarSettings);
    });
    
    this.gridOptionsChangeListeners.forEach(listener => {
      listener(this.currentGridOptions);
    });
  }

  updateToolbarSettings(settings: Partial<ToolbarSettings>): void {
    // Deep copy the incoming settings to avoid reference issues
    const validatedSettings = { ...settings };
    
    // Validate font size if provided
    if (validatedSettings.fontSize !== undefined) {
      // Ensure it's a valid number
      if (typeof validatedSettings.fontSize !== 'number' || 
          isNaN(validatedSettings.fontSize) || 
          validatedSettings.fontSize < MIN_FONT_SIZE) {
        console.warn(`Invalid font size value: ${validatedSettings.fontSize}, using default`);
        validatedSettings.fontSize = DEFAULT_FONT_SIZE;
      }
    }
    
    // Validate spacing if provided
    if (validatedSettings.spacing !== undefined) {
      // Ensure it's a valid number with minimum value
      if (typeof validatedSettings.spacing !== 'number' || 
          isNaN(validatedSettings.spacing) || 
          validatedSettings.spacing < 2) {
        console.warn(`Invalid spacing value: ${validatedSettings.spacing}, using default`);
        validatedSettings.spacing = DEFAULT_SPACING;
      }
    }
    
    // Update settings
    this.currentToolbarSettings = { ...this.currentToolbarSettings, ...validatedSettings };
    
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
    // Cancel any pending operations
    if (this.pendingSettingsOperation !== null) {
      clearTimeout(this.pendingSettingsOperation);
      this.pendingSettingsOperation = null;
    }
    
    // If already applying settings, queue this request
    if (this.isApplyingSettings) {
      this.pendingSettingsOperation = window.setTimeout(() => {
        this.pendingSettingsOperation = null;
        this.applyProfileSettings(settings);
      }, 100);
      return;
    }
    
    // Set flag to prevent concurrent updates
    this.isApplyingSettings = true;
    
    console.log("🔧 Starting profile settings application");
    
    // Check if this is a NEW profile with default settings only
    const isNewDefaultProfile = 
      settings.grid && Object.keys(settings.grid).length === 0 && 
      settings.custom?.gridOptions && 
      !settings.custom.gridOptions.hasBeenCustomized;
    
    if (isNewDefaultProfile) {
      console.log("🆕 Detected NEW profile with default settings - resetting to defaults");
      // Reset internal state first
      this.resetToDefaults();
      
      // Mark the grid options as having been customized to prevent future resets
      if (settings.custom?.gridOptions) {
        settings.custom.gridOptions.hasBeenCustomized = true;
      }
    }
    
    // Step 1: First collect all settings that need to be applied
    // This avoids making multiple changes to the grid state
    
    // Apply toolbar settings 
    if (settings.toolbar) {
      // Create a temp object with default toolbar settings as fallback
      const defaultedToolbarSettings = {
        fontFamily: DEFAULT_FONT_FAMILY,
        fontSize: DEFAULT_FONT_SIZE,
        spacing: DEFAULT_SPACING,
        ...settings.toolbar
      };
      
      // Check explicitly for undefined/null values and replace with defaults
      if (defaultedToolbarSettings.fontFamily === undefined || defaultedToolbarSettings.fontFamily === null) {
        defaultedToolbarSettings.fontFamily = DEFAULT_FONT_FAMILY;
      }
      
      if (defaultedToolbarSettings.fontSize === undefined || defaultedToolbarSettings.fontSize === null) {
        defaultedToolbarSettings.fontSize = DEFAULT_FONT_SIZE;
      }
      
      if (defaultedToolbarSettings.spacing === undefined || defaultedToolbarSettings.spacing === null) {
        defaultedToolbarSettings.spacing = DEFAULT_SPACING;
      }
      
      // Update with the properly defaulted settings
      this.updateToolbarSettings(defaultedToolbarSettings);
    } else {
      console.warn("⚠️ Profile has no toolbar settings, using defaults");
      this.updateToolbarSettings({
        fontFamily: DEFAULT_FONT_FAMILY,
        fontSize: DEFAULT_FONT_SIZE,
        spacing: DEFAULT_SPACING
      });
    }
    
    // Update internal grid options state
    if (settings.custom?.gridOptions) {
      console.log("🔧 Collecting custom grid options");
      this.updateGridOptions(settings.custom.gridOptions);
    }
    
    // Step 2: Apply the collected grid options to the grid in one batch
    const gridApiInstance = this.gridStateProvider.getGridApi();
    if (gridApiInstance) {
      // Use a single timeout to batch all changes
      window.setTimeout(() => {
        try {
          console.log("🔧 Applying grid options and settings to grid");
          
          // Prepare processed options for AG Grid v33+
          const processedOptions: GridOptionsMap = this.processGridOptions(settings.custom?.gridOptions || {});
          
          // Apply these options to the grid in one batch
          this.applyGridOptions(gridApiInstance, processedOptions);
          
          // After options are applied, apply grid state 
          // which includes column state, filters, etc.
          if (settings.grid) {
            this.gridStateProvider.applyGridState(settings.grid as GridSettings);
          }
          
          // Notify listeners with processed options
          this.gridOptionsChangeListeners.forEach(listener => {
            listener(this.currentGridOptions);
          });
          
          console.log("✅ Completed applying profile settings");
        } catch (error) {
          console.error("❌ Error applying profile settings:", error);
        } finally {
          // Reset flag to allow future updates
          this.isApplyingSettings = false;
          
          // If there's a pending operation, run it now
          if (this.pendingSettingsOperation !== null) {
            clearTimeout(this.pendingSettingsOperation);
            this.pendingSettingsOperation = null;
            // Re-run with a slight delay to prevent stack overflow
            setTimeout(() => {
              this.applyProfileSettings(settings);
            }, 50);
          }
        }
      }, 20);
    } else {
      console.warn("⚠️ No grid API available, settings will be applied when grid is ready");
      this.isApplyingSettings = false;
    }
  }
  
  // Process grid options for AG Grid v33+
  private processGridOptions(options: any): GridOptionsMap {
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
    ];

    Object.entries(options).forEach(([option, value]) => {
      if (value === undefined) return;
      const optKey = option as keyof GridOptions;

      const ensureRowSelectionObject = (currentSelection: GridOptions['rowSelection']): any => {
        if (typeof currentSelection === 'object' && currentSelection !== null) {
          return currentSelection;
        }
        // If it's a string or undefined, start fresh with a mode
        return { 
          mode: typeof currentSelection === 'string' && 
                ['singleRow', 'multiRow'].includes(currentSelection) ? 
                currentSelection : 'multiRow' 
        };
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
          // Handle safely for AG Grid v33+
          if (typeof processedOptions.cellSelection === 'boolean') {
            // Convert boolean to object
            processedOptions.cellSelection = { 
              suppressMultiRanges: false,
              enableHeaderHighlight: true
            };
          } 
          // Add handle property as a simple boolean for now
          // AG Grid will handle the proper conversion internally
          if (typeof processedOptions.cellSelection === 'object') {
            (processedOptions.cellSelection as any).handle = value;
          }
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
            
            // Ensure fontSize is always a number (for calculations later)
            if (colDef.fontSize && typeof colDef.fontSize === 'string') {
              // Extract numeric value if it's a string with 'px'
              const numericValue = parseInt(colDef.fontSize.replace('px', ''), 10);
              if (!isNaN(numericValue)) {
                colDef.fontSize = numericValue;
              }
            }
            
            // Process vertical and horizontal alignment
            const verticalAlign = colDef.verticalAlign as 'start' | 'center' | 'end' | 'top' | 'middle' | 'bottom' | undefined;
            const horizontalAlign = colDef.horizontalAlign as 'left' | 'center' | 'right' | undefined;
            
            // Only create cellStyle if at least one alignment is specified
            if (verticalAlign || horizontalAlign) {
              // Create a function that returns the style object
              colDef.cellStyle = (params: any) => {
                const styleObj: any = { display: 'flex' };
                
                // Add vertical alignment - mapping UI values to CSS flexbox values
                if (verticalAlign) {
                  // Map 'top'/'middle'/'bottom' to flexbox alignItems values
                  if (verticalAlign === 'top' || verticalAlign === 'start') {
                    styleObj.alignItems = 'flex-start';
                  } else if (verticalAlign === 'middle' || verticalAlign === 'center') {
                    styleObj.alignItems = 'center';
                  } else if (verticalAlign === 'bottom' || verticalAlign === 'end') {
                    styleObj.alignItems = 'flex-end';
                  } else {
                    styleObj.alignItems = 'center'; // Default to center
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
                    default:
                      styleObj.justifyContent = 'flex-start'; // Default to left
                  }
                } else if (params.colDef.type === 'numericColumn') {
                  styleObj.justifyContent = 'flex-end'; // Right align numbers by default
                } else {
                  styleObj.justifyContent = 'flex-start'; // Left align text by default
                }
                
                return styleObj;
              };
              
              // Keep vertical/horizontal values for UI state
              // These properties aren't used by AG Grid but are needed to restore UI state
              processedOptions.defaultColDef = {
                ...colDef,
                verticalAlign,
                horizontalAlign
              };
            } else {
              processedOptions.defaultColDef = colDef;
            }
          }
          break;
        case 'groupSelectsChildren':
          try {
            // Handle differently for AG Grid v33+
            (processedOptions as any).rowSelection = { 
              ...ensureRowSelectionObject(processedOptions.rowSelection)
            };
            // Set the property directly on the options object instead
            (processedOptions as any).groupSelectsChildren = value;
          } catch (e) {
            console.error("Error setting groupSelectsChildren:", e);
          }
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

    return processedOptions;
  }
  
  // Apply grid options to the grid in one batch
  private applyGridOptions(gridApi: AgGridApi, options: GridOptionsMap): void {
    // List of invalid/deprecated options in AG Grid v33+
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
    ];
    
    const initialProperties: Array<keyof GridOptions> = [
      'rowModelType',
      'cacheQuickFilter',
      'paginationPageSizeSelector',
      'pivotPanelShow',
      'undoRedoCellEditing',
      'undoRedoCellEditingLimit',
      'suppressAutoSize',
      'valueCache',
    ];
    
    // Filter out invalid options
    const isInvalidGridOption = (optKey: string, value: any): boolean => {
      if (INVALID_GRID_OPTIONS.includes(optKey)) {
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
    };
    
    // Collect all option updates for one batch operation
    const optionsToApply = new Map<string, any>();
    
    console.log("🔄 Collecting grid options for batch update");
    
    // Special handling for key options
    if (options.defaultColDef) {
      optionsToApply.set('defaultColDef', options.defaultColDef);
    }
    
    if (options.rowSelection) {
      optionsToApply.set('rowSelection', options.rowSelection);
    }
    
    if (options.cellSelection !== undefined) {
      optionsToApply.set('cellSelection', options.cellSelection);
    }
    
    // Collect remaining options
    Object.entries(options).forEach(([optKey, value]) => {
      // Skip special options already handled
      if (['defaultColDef', 'rowSelection', 'cellSelection'].includes(optKey)) {
        return;
      }
      
      // Skip initial properties and invalid options
      if (value !== undefined && 
          !initialProperties.includes(optKey as any) && 
          optKey !== 'theme' && 
          !isInvalidGridOption(optKey, value)) {
        optionsToApply.set(optKey, value);
      }
    });
    
    // Now apply all options in one batch transaction
    console.log("🔄 Applying all grid options in single batch");
    try {
      // Set transaction flag - use 'as any' to bypass type checking
      (gridApi as any).setGridOption('suppressColumnStateEvents', true);
      
      // Apply all options at once
      optionsToApply.forEach((value, key) => {
        try {
          // Use 'as any' to bypass type checking for dynamic keys
          (gridApi as any).setGridOption(key, value);
        } catch (e) {
          console.error(`Error setting grid option ${key}:`, e);
        }
      });
      
      // Only do a single refresh after all options are applied
      console.log("🔄 Single refresh after applying all options");
      
      // Reset transaction flag - use 'as any' to bypass type checking
      (gridApi as any).setGridOption('suppressColumnStateEvents', false);
      
      // Force a single refresh after all options are applied
      gridApi.refreshHeader();
      gridApi.refreshCells({ force: true });
    } catch (error) {
      console.error('Error applying grid options:', error);
    }
  }
} 