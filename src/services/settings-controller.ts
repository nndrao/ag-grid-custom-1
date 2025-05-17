import { GridApi } from 'ag-grid-community';
import { GridStateProvider } from './gridStateProvider';
import { SettingsStore } from '@/stores/settings-store';
import { ProfileSettings } from '@/types/profile.types';

export const DEFAULT_FONT_FAMILY = 'monospace';
export const DEFAULT_FONT_SIZE = 12;
export const DEFAULT_SPACING = 6;
export const MIN_FONT_SIZE = 6;

/**
 * SettingsController acts as a mediator between the SettingsStore and AG-Grid
 * It handles applying settings to the grid and extracting current grid settings
 */
export class SettingsController {
  private gridApi: GridApi | null = null;
  public gridStateProvider: GridStateProvider;
  private settingsStore: SettingsStore;
  private isApplyingSettings = false;
  private pendingSettingsOperation: number | null = null;

  constructor(gridStateProvider: GridStateProvider) {
    this.gridStateProvider = gridStateProvider;
    this.settingsStore = SettingsStore.getInstance();
  }

  /**
   * Reset to default settings
   */
  public resetToDefaults(): void {
    this.settingsStore.resetToDefaults();
  }

  /**
   * Set the GridApi for grid operations
   */
  public setGridApi(api: GridApi): void {
    console.log("Setting grid API in SettingsController");
    this.gridApi = api;
    this.gridStateProvider.setGridApi(api);
  }

  /**
   * Update toolbar settings in the settings store
   */
  public updateToolbarSettings(settings: any): void {
    this.settingsStore.updateSettings('toolbar', settings);
  }

  /**
   * Update grid options in the settings store
   */
  public updateGridOptions(options: any): void {
    console.log("📝 Updating grid options in settings store:", options);
    
    // Ensure defaultColDef alignment properties are preserved
    if (options.defaultColDef) {
      const colDef = options.defaultColDef;
      
      // Preserve alignment properties for storage
      if (colDef.cellStyle && typeof colDef.cellStyle === 'function') {
        // Extract alignment from the cellStyle function test result
        const testResult = colDef.cellStyle({ colDef: { type: undefined } });
        console.log("📐 Extracting alignment from cellStyle:", testResult);
        
        // Store alignment metadata alongside the defaultColDef
        if (testResult && testResult.alignItems) {
          colDef.verticalAlign = testResult.alignItems === 'flex-start' ? 'top' :
                               testResult.alignItems === 'center' ? 'middle' :
                               testResult.alignItems === 'flex-end' ? 'bottom' : undefined;
        }
        if (testResult && testResult.justifyContent) {
          colDef.horizontalAlign = testResult.justifyContent === 'flex-start' ? 'left' :
                                 testResult.justifyContent === 'center' ? 'center' :
                                 testResult.justifyContent === 'flex-end' ? 'right' : undefined;
        }
      }
    }
    
    // Update the store with new options (this merges with existing options)
    this.settingsStore.updateSettings('gridOptions', options);
    
    // Apply grid options to the grid if API is available
    if (this.gridApi) {
      console.log("⚙️ Applying grid options to AG-Grid");
      this.applyGridOptions(this.gridApi, options);
    }
  }

  /**
   * Apply grid options to the grid in an idempotent manner
   */
  private applyGridOptions(gridApi: GridApi, options: any): void {
    console.log("🔧 ApplyGridOptions called with:", options);
    
    // Define all runtime-changeable options
    const runtimeGridOptions = [
      'headerHeight', 'rowHeight', 'defaultColDef', 'autoGroupColumnDef',
      'rowClass', 'rowStyle', 'getRowClass', 'rowClassRules',
      'rowSelection', 'cellSelection', 'pagination',
      'paginationPageSize', 'domLayout', 'enableCellTextSelection',
      'animateRows', 'suppressRowTransform', 'suppressColumnVirtualisation',
      'suppressCellFocus', 'suppressMovableColumns', 'suppressFieldDotNotation',
      'floatingFiltersHeight', 'groupDefaultExpanded', 'groupIncludeFooter',
      'groupIncludeTotalFooter', 'suppressRowHoverHighlight',
      'suppressCopyRowsToClipboard', 'copyHeadersToClipboard',
      'clipboardDelimiter', 'suppressLastEmptyLineOnPaste',
      'sideBar', 'statusBar', 'enableRangeSelection', 'enableRangeHandle',
      'suppressMultiRangeSelection', 'rowGroupPanelShow',
      'pivotPanelShow', 'suppressContextMenu', 'preventDefaultOnContextMenu',
      'allowContextMenuWithControlKey', 'multiSortKey', 'alwaysShowHorizontalScroll',
      'alwaysShowVerticalScroll', 'suppressHorizontalScroll',
      'suppressScrollOnNewData', 'suppressClipboardPaste',
      'suppressClipboardCut', 'accentedSort', 'unSortIcon', 'suppressMultiSort',
      'autoSizePadding', 'skipHeaderOnAutoSize',
      'groupSelectsChildren', 'groupSelectsFiltered',
      'suppressRowClickSelection', 'suppressRowDeselection',
      'suppressAggFuncInHeader', 'suppressColumnMoveAnimation',
      'suppressDragLeaveHidesColumns', 'suppressRowGroupHidesColumns',
      'suppressMakeColumnVisibleAfterUnGroup'
    ];

    // Track applied options to avoid redundant updates
    const appliedOptions = new Set<string>();

    // Apply each valid option only if it has changed
    Object.keys(options).forEach(optionKey => {
      // Skip options that can't be changed at runtime
      if (!runtimeGridOptions.includes(optionKey)) {
        console.log(`⚠️ Skipping non-runtime option: ${optionKey}`);
        return;
      }

      // Skip if already applied
      if (appliedOptions.has(optionKey)) {
        return;
      }

      try {
        const currentValue = gridApi.getGridOption(optionKey);
        const newValue = options[optionKey];
        
        // Special handling for defaultColDef to ensure alignment is preserved
        if (optionKey === 'defaultColDef' && newValue) {
          const processedColDef = { ...newValue };
          
          // Reconstruct cellStyle if alignment properties exist
          if (processedColDef.verticalAlign || processedColDef.horizontalAlign) {
            console.log("🎨 Processing defaultColDef with alignment:", {
              vertical: processedColDef.verticalAlign,
              horizontal: processedColDef.horizontalAlign
            });
            
            processedColDef.cellStyle = (params: any) => {
              const styleObj: any = { display: 'flex' };
              
              // Apply vertical alignment
              if (processedColDef.verticalAlign === 'top') {
                styleObj.alignItems = 'flex-start';
              } else if (processedColDef.verticalAlign === 'middle') {
                styleObj.alignItems = 'center';
              } else if (processedColDef.verticalAlign === 'bottom') {
                styleObj.alignItems = 'flex-end';
              }
              
              // Apply horizontal alignment
              if (processedColDef.horizontalAlign === 'left') {
                styleObj.justifyContent = 'flex-start';
              } else if (processedColDef.horizontalAlign === 'center') {
                styleObj.justifyContent = 'center';
              } else if (processedColDef.horizontalAlign === 'right') {
                styleObj.justifyContent = 'flex-end';
              } else if (params.colDef.type === 'numericColumn') {
                styleObj.justifyContent = 'flex-end'; // Right align numbers by default
              } else {
                styleObj.justifyContent = 'flex-start'; // Left align text by default
              }
              
              return styleObj;
            };
          }
          
          gridApi.setGridOption(optionKey, processedColDef);
          appliedOptions.add(optionKey);
          console.log(`✅ Applied grid option: ${optionKey}`, processedColDef);
        } else {
          // Only apply if values are different
          if (JSON.stringify(currentValue) !== JSON.stringify(newValue)) {
            gridApi.setGridOption(optionKey, newValue);
            appliedOptions.add(optionKey);
            console.log(`✅ Applied grid option: ${optionKey}`, newValue);
          } else {
            console.log(`⏭️ Skipping unchanged option: ${optionKey}`);
          }
        }
      } catch (error) {
        console.error(`Error applying grid option ${optionKey}:`, error);
      }
    });

    // Don't refresh here - we'll do it once at the end of applyProfileSettings
    if (appliedOptions.size > 0) {
      console.log(`✅ Applied ${appliedOptions.size} grid options, refresh pending`);
    }
  }

  /**
   * Register a listener for toolbar settings changes
   */
  public onToolbarSettingsChange(listener: (settings: any) => void): () => void {
    return this.settingsStore.subscribe('toolbar', listener);
  }

  /**
   * Register a listener for grid options changes
   */
  public onGridOptionsChange(listener: (options: any) => void): () => void {
    return this.settingsStore.subscribe('gridOptions', listener);
  }

  /**
   * Get current toolbar settings from the store
   */
  public getCurrentToolbarSettings(): any {
    return this.settingsStore.getSettings('toolbar');
  }

  /**
   * Get current grid options from the store
   */
  public getCurrentGridOptions(): any {
    return this.settingsStore.getSettings('gridOptions');
  }

  /**
   * Collect current settings for storing in a profile
   */
  public collectCurrentSettings(): ProfileSettings {
    // Get grid state from provider
    const gridState = this.gridStateProvider.extractGridState();
    console.log("Collected grid state:", gridState);
    
    // Get settings from the store
    const settings = {
      toolbar: this.settingsStore.getSettings('toolbar'),
      grid: gridState,
      custom: {
        gridOptions: this.settingsStore.getSettings('gridOptions')
      }
    };
    
    console.log("Collected all settings:", settings);
    return settings;
  }

  /**
   * Apply settings from a profile following the correct order:
   * 1. Default Grid Options
   * 2. Custom Grid Options
   * 3. All Grid States (column state, sort, filter, etc.)
   * 4. Toolbar Settings
   * 5. Column Settings and Styles
   */
  public applyProfileSettings(settings: ProfileSettings): void {
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
    
    try {
      console.log("📊 Applying profile settings:", settings);
      
      // Step 1: Apply toolbar settings first (includes themes, fonts, etc.)
      if (settings.toolbar) {
        this.settingsStore.updateAllToolbarSettings(settings.toolbar);
      }
      
      // Step 2: Process and apply default grid options with alignment reconstruction
      if (this.gridApi && settings.custom?.gridOptions?.defaultColDef) {
        const defaultColDef = { ...settings.custom.gridOptions.defaultColDef };
        
        // Reconstruct cellStyle function from stored alignment metadata
        if (defaultColDef.verticalAlign || defaultColDef.horizontalAlign) {
          console.log("🎨 Reconstructing cellStyle from alignment metadata:", {
            vertical: defaultColDef.verticalAlign,
            horizontal: defaultColDef.horizontalAlign
          });
          
          defaultColDef.cellStyle = (params: any) => {
            const styleObj: any = { display: 'flex' };
            
            // Apply vertical alignment
            if (defaultColDef.verticalAlign === 'top') {
              styleObj.alignItems = 'flex-start';
            } else if (defaultColDef.verticalAlign === 'middle') {
              styleObj.alignItems = 'center';
            } else if (defaultColDef.verticalAlign === 'bottom') {
              styleObj.alignItems = 'flex-end';
            }
            
            // Apply horizontal alignment
            if (defaultColDef.horizontalAlign === 'left') {
              styleObj.justifyContent = 'flex-start';
            } else if (defaultColDef.horizontalAlign === 'center') {
              styleObj.justifyContent = 'center';
            } else if (defaultColDef.horizontalAlign === 'right') {
              styleObj.justifyContent = 'flex-end';
            } else if (params.colDef.type === 'numericColumn') {
              styleObj.justifyContent = 'flex-end'; // Right align numbers by default
            } else {
              styleObj.justifyContent = 'flex-start'; // Left align text by default
            }
            
            return styleObj;
          };
        }
        
        this.gridApi.setGridOption('defaultColDef', defaultColDef);
      }
      
      // Step 3: Apply custom grid options (includes advanced configuration)
      if (this.gridApi && settings.custom?.gridOptions) {
        console.log("⚙️ Applying custom grid options:", settings.custom.gridOptions);
        
        // Update settings store first
        this.settingsStore.updateSettings('gridOptions', settings.custom.gridOptions);
        
        // Then apply to grid
        this.applyGridOptions(this.gridApi, settings.custom.gridOptions);
      }
      
      // Step 4: Apply all grid states (column, sort, filter, etc.)
      if (this.gridApi && settings.grid) {
        console.log("📋 Applying grid state:", settings.grid);
        this.gridStateProvider.applyGridState(settings.grid);
      }
      
      // Step 5: Apply column-specific settings and styles (from Column Settings dialog)
      if (this.gridApi && settings.custom?.columnDefs) {
        this.gridApi.setGridOption('columnDefs', settings.custom.columnDefs);
      }
      
      // Single grid refresh after all settings are applied
      if (this.gridApi) {
        // Use requestAnimationFrame for better performance
        requestAnimationFrame(() => {
          if (this.gridApi) {
            console.log("🔄 Single final grid refresh after all settings applied");
            this.gridApi.refreshHeader();
            this.gridApi.refreshCells({ force: true });
          }
        });
      }
    } finally {
      // Reset flag
      this.isApplyingSettings = false;
      
      // Check for pending operations
      if (this.pendingSettingsOperation !== null) {
        const timeoutId = this.pendingSettingsOperation;
        this.pendingSettingsOperation = null;
        clearTimeout(timeoutId);
      }
    }
  }
} 