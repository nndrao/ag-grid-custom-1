import { GridApi } from 'ag-grid-community';
import { GridStateProvider } from './gridStateProvider';
import { SettingsStore } from '@/stores/settings-store';
import { ProfileSettings } from '@/types/profile.types';

/**
 * SettingsController acts as a mediator between the SettingsStore and AG-Grid
 * It handles applying settings to the grid and extracting current grid settings
 */
export class SettingsController {
  private gridApi: GridApi | null = null;
  private gridStateProvider: GridStateProvider;
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
    this.settingsStore.updateSettings('gridOptions', options);
    
    // Apply grid options to the grid if API is available
    if (this.gridApi) {
      this.applyGridOptions(this.gridApi, options);
    }
  }

  /**
   * Apply grid options to the grid
   */
  private applyGridOptions(gridApi: GridApi, options: any): void {
    // Only apply settings that can be changed at runtime
    const runtimeGridOptions = [
      'headerHeight', 'rowHeight', 'defaultColDef', 'autoGroupColumnDef',
      'rowClass', 'rowStyle', 'getRowClass', 'rowClassRules',
      'rowSelection', 'cellSelection', 'pagination',
      'paginationPageSize', 'domLayout', 'enableCellTextSelection'
    ];

    // Apply each valid option
    Object.keys(options).forEach(optionKey => {
      if (runtimeGridOptions.includes(optionKey)) {
        try {
          gridApi.setGridOption(optionKey, options[optionKey]);
        } catch (error) {
          console.error(`Error applying grid option ${optionKey}:`, error);
        }
      }
    });

    // Refresh the grid to ensure changes take effect
    gridApi.refreshCells({ force: true });
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
    
    // Get settings from the store
    return {
      toolbar: this.settingsStore.getSettings('toolbar'),
      grid: gridState,
      custom: {
        gridOptions: this.settingsStore.getSettings('gridOptions')
      }
    };
  }

  /**
   * Apply settings from a profile
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
      // Apply settings to the store
      this.settingsStore.applyProfileSettings(settings);
      
      // Apply grid state if grid API is available
      if (this.gridApi && settings.grid) {
        this.gridStateProvider.applyGridState(settings.grid);
      }
      
      // Apply grid options if available
      if (this.gridApi && settings.custom?.gridOptions) {
        this.applyGridOptions(this.gridApi, settings.custom.gridOptions);
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