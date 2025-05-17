import { GridSettings, ProfileSettings, ToolbarSettings } from '@/types/profile.types';
import { DEFAULT_GRID_OPTIONS } from '@/components/datatable/config/default-grid-options';
import { DEFAULT_FONT_FAMILY, DEFAULT_FONT_SIZE, DEFAULT_SPACING } from '@/services/settings-controller';
import { shallowClone } from '@/utils/deepClone';
import { shallowEqual, compareGridOptions } from '@/utils/comparison';
import { GridOptions } from 'ag-grid-community';
import { SingletonRegistry } from '@/lib/singleton-registry';

// Define settings categories interfaces
export interface ColumnSettings {
  [key: string]: any;
}

export interface FilterSettings {
  [key: string]: any;
}

export interface ThemeSettings {
  [key: string]: any;
}

export interface ExportSettings {
  [key: string]: any;
}

export interface SortSettings {
  [key: string]: any;
}

export interface GroupSettings {
  [key: string]: any;
}

export type SettingsCategory = 'column' | 'filter' | 'toolbar' | 'theme' | 'export' | 'sort' | 'group' | 'gridOptions';

export class SettingsStore {
  // Main settings categories
  private currentSettings: {
    column: ColumnSettings;
    filter: FilterSettings;
    toolbar: ToolbarSettings;
    theme: ThemeSettings;
    export: ExportSettings;
    sort: SortSettings;
    group: GroupSettings;
    gridOptions: Partial<GridOptions>;
    grid: GridSettings;
  };
  
  private listeners: Map<SettingsCategory, Array<(settings: any) => void>> = new Map();
  private lastUpdateTime: Map<SettingsCategory, number> = new Map();
  private updateThrottle = 50; // milliseconds
  
  // Private constructor
  constructor() {
    // Initialize with default settings
    this.currentSettings = {
      column: {},
      filter: {},
      toolbar: {
        fontFamily: DEFAULT_FONT_FAMILY,
        fontSize: DEFAULT_FONT_SIZE,
        spacing: DEFAULT_SPACING
      },
      theme: {},
      export: {},
      sort: {},
      group: {},
      gridOptions: shallowClone(DEFAULT_GRID_OPTIONS) as Partial<GridOptions>,
      grid: {}
    };
  }
  
  // Use singleton registry for better lifecycle management
  public static getInstance(options?: { reset?: boolean }): SettingsStore {
    return SingletonRegistry.getInstance(
      'SettingsStore',
      () => new SettingsStore(),
      options
    );
  }
  
  // Clear singleton instance (useful for testing)
  public static clearInstance(): void {
    SingletonRegistry.clearInstance('SettingsStore');
  }
  
  // Update settings for a specific category
  public updateSettings(category: SettingsCategory | 'gridOptions', settings: any): void {
    // Throttle updates
    const now = Date.now();
    const lastUpdate = this.lastUpdateTime.get(category as SettingsCategory) || 0;
    
    if (now - lastUpdate < this.updateThrottle) {
      // Queue the update
      setTimeout(() => this.updateSettings(category, settings), this.updateThrottle);
      return;
    }
    
    // Check if the settings have actually changed using optimized comparison
    const currentSettings = this.currentSettings[category as keyof typeof this.currentSettings];
    
    let hasChanged = false;
    
    // Use appropriate comparison based on category
    if (category === 'gridOptions') {
      // For grid options, check each key individually
      for (const key in settings) {
        if (!compareGridOptions(settings[key], currentSettings[key])) {
          hasChanged = true;
          break;
        }
      }
    } else {
      // For other settings, use shallow comparison
      hasChanged = Object.keys(settings).some(key => {
        return settings[key] !== currentSettings[key];
      });
    }
    
    if (!hasChanged) {
      // No changes, don't update or notify
      return;
    }
    
    // Apply updates
    this.currentSettings[category as keyof typeof this.currentSettings] = {
      ...currentSettings,
      ...settings
    };
    
    // Update throttle timestamp
    this.lastUpdateTime.set(category as SettingsCategory, now);
    
    // Notify listeners for this category
    this.notifyListeners(category, this.currentSettings[category as keyof typeof this.currentSettings]);
  }

  // Update all toolbar settings at once (replaces entire toolbar section)
  public updateAllToolbarSettings(settings: ToolbarSettings): void {
    // Check if settings actually changed
    if (shallowEqual(this.currentSettings.toolbar, settings)) {
      return;
    }
    
    this.currentSettings.toolbar = settings;
    this.notifyListeners('toolbar', this.currentSettings.toolbar);
  }
  
  // Get all settings
  public getAllSettings(): ProfileSettings {
    return {
      toolbar: { ...this.currentSettings.toolbar },
      grid: { ...this.currentSettings.grid },
      custom: {
        gridOptions: { ...this.currentSettings.gridOptions }
      }
    };
  }
  
  // Get settings for a specific category
  public getSettings(category: SettingsCategory | 'gridOptions'): any {
    return { ...this.currentSettings[category as keyof typeof this.currentSettings] };
  }
  
  // Subscribe to changes for a specific category
  public subscribe(category: SettingsCategory, listener: (settings: any) => void): () => void {
    if (!this.listeners.has(category)) {
      this.listeners.set(category, []);
    }
    
    const categoryListeners = this.listeners.get(category) || [];
    categoryListeners.push(listener);
    this.listeners.set(category, categoryListeners);
    
    // Return unsubscribe function
    return () => {
      const updatedListeners = (this.listeners.get(category) || [])
        .filter(l => l !== listener);
      this.listeners.set(category, updatedListeners);
    };
  }
  
  // Reset all settings to defaults
  public resetToDefaults(): void {
    this.currentSettings = {
      column: {},
      filter: {},
      toolbar: {
        fontFamily: DEFAULT_FONT_FAMILY,
        fontSize: DEFAULT_FONT_SIZE,
        spacing: DEFAULT_SPACING
      },
      theme: {},
      export: {},
      sort: {},
      group: {},
      gridOptions: shallowClone(DEFAULT_GRID_OPTIONS) as Partial<GridOptions>,
      grid: {}
    };
    
    // Notify all listeners
    Array.from(this.listeners.keys()).forEach(category => {
      this.notifyListeners(category, this.currentSettings[category]);
    });
  }
  
  // Apply settings from a profile
  public applyProfileSettings(settings: ProfileSettings): void {
    if (settings.toolbar && !shallowEqual(this.currentSettings.toolbar, settings.toolbar)) {
      this.updateSettings('toolbar', settings.toolbar);
    }
    
    if (settings.grid) {
      this.currentSettings.grid = { ...settings.grid };
    }
    
    if (settings.custom?.gridOptions) {
      // Check if gridOptions have actually changed
      const currentGridOptions = this.currentSettings.gridOptions;
      const newGridOptions = settings.custom.gridOptions;
      
      let hasGridOptionsChanged = false;
      for (const key in newGridOptions) {
        if (!compareGridOptions(newGridOptions[key], currentGridOptions[key])) {
          hasGridOptionsChanged = true;
          break;
        }
      }
      
      if (hasGridOptionsChanged) {
        this.currentSettings.gridOptions = { ...settings.custom.gridOptions };
        // Notify listeners about grid options changes
        this.notifyListeners('gridOptions', this.currentSettings.gridOptions);
      }
    }
  }
  
  // Private helper to notify listeners
  private notifyListeners(category: SettingsCategory | string, settings: any): void {
    const categoryListeners = this.listeners.get(category as SettingsCategory) || [];
    categoryListeners.forEach(listener => {
      try {
        // Use setTimeout to prevent blocking
        setTimeout(() => listener(settings), 0);
      } catch (error) {
        console.error('Error in settings listener:', error);
      }
    });
  }
  
  // Clean up method for proper lifecycle management
  public dispose(): void {
    this.listeners.clear();
    this.lastUpdateTime.clear();
  }
}