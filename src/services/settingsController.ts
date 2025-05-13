import { ProfileSettings, ToolbarSettings } from '@/types/profile.types';
import { GridStateProvider } from './gridStateProvider';

export class SettingsController {
  private gridStateProvider: GridStateProvider;
  private currentToolbarSettings: Partial<ToolbarSettings> = {};
  private settingsChangeListeners: Array<(settings: Partial<ToolbarSettings>) => void> = [];

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

  // Collect current grid and toolbar settings
  collectCurrentSettings(): ProfileSettings {
    // Create a clean copy of all settings to avoid references that could trigger side effects
    return {
      toolbar: { ...this.currentToolbarSettings } as ToolbarSettings,
      grid: this.gridStateProvider.extractGridState(),
      custom: {}
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
      // Extract column widths from the grid state if available
      const columnWidths: Record<string, number> = {};
      
      // Get widths from columnState
      if (settings.grid.columnState) {
        settings.grid.columnState.forEach(col => {
          if (col.width !== undefined) {
            columnWidths[col.colId] = col.width;
          }
        });
      }
      
      // Get widths from columnSizingState (more specific)
      if (settings.grid.columnSizingState?.columnWidths) {
        Object.assign(columnWidths, settings.grid.columnSizingState.columnWidths);
      }
      
      console.log("🔧 Applying grid state with column info:", 
        Object.keys(columnWidths).length ? 
        `${Object.keys(columnWidths).length} column widths to preserve` : 
        "No column width information available");
      
      // Apply grid state
      setTimeout(() => {
        // Apply all grid state first
        this.gridStateProvider.applyGridState(settings.grid);
        
        // Then force the exact column widths
        if (Object.keys(columnWidths).length > 0 && this.gridStateProvider.getGridApi()) {
          setTimeout(() => {
            console.log("🔧 Forcing exact column widths:", columnWidths);
            const api = this.gridStateProvider.getGridApi();
            
            if (api) {
              const allColumns = api.getAllGridColumns();
              allColumns.forEach(col => {
                const colId = col.getColId();
                if (columnWidths[colId]) {
                  // Force the exact width for this column
                  col.setActualWidth(columnWidths[colId]);
                }
              });
              
              // Force refresh to reflect the restored widths
              api.refreshHeader();
            }
          }, 100);
        }
      }, 50);
    }
  }
} 