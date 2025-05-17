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
        return;
      }

      // Skip if already applied
      if (appliedOptions.has(optionKey)) {
        return;
      }

      try {
        const currentValue = gridApi.getGridOption(optionKey);
        const newValue = options[optionKey];
        
        // Only apply if values are different
        if (JSON.stringify(currentValue) !== JSON.stringify(newValue)) {
          gridApi.setGridOption(optionKey, newValue);
          appliedOptions.add(optionKey);
        }
      } catch (error) {
        console.error(`Error applying grid option ${optionKey}:`, error);
      }
    });

    // Only refresh if we applied any changes
    if (appliedOptions.size > 0) {
      gridApi.refreshCells({ force: true });
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
      // Step 1: Apply toolbar settings first (includes themes, fonts, etc.)
      if (settings.toolbar) {
        this.settingsStore.updateAllToolbarSettings(settings.toolbar);
      }
      
      // Step 2: Apply default grid options (base configuration)
      if (this.gridApi && settings.custom?.gridOptions?.defaultColDef) {
        this.gridApi.setGridOption('defaultColDef', settings.custom.gridOptions.defaultColDef);
      }
      
      // Step 3: Apply custom grid options (includes advanced configuration)
      if (this.gridApi && settings.custom?.gridOptions) {
        this.applyGridOptions(this.gridApi, settings.custom.gridOptions);
      }
      
      // Step 4: Apply all grid states (column, sort, filter, etc.)
      if (this.gridApi && settings.grid) {
        console.log("Applying grid state:", settings.grid);
        // Always apply grid state immediately since we check for grid API
        this.gridStateProvider.applyGridState(settings.grid);
      }
      
      // Step 5: Apply column-specific settings and styles (from Column Settings dialog)
      if (this.gridApi && settings.custom?.columnDefs) {
        this.gridApi.setGridOption('columnDefs', settings.custom.columnDefs);
      }
      
      // Force grid refresh after all settings are applied
      if (this.gridApi) {
        // Use setTimeout to ensure all settings have been applied
        setTimeout(() => {
          if (this.gridApi) {
            console.log("🔄 Final grid refresh after all settings applied");
            this.gridApi.refreshCells({ force: true });
            this.gridApi.refreshHeader();
          }
        }, 200);
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