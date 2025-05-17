import { GridSettings, ProfileSettings, ToolbarSettings } from '@/types/profile.types';
import { DEFAULT_GRID_OPTIONS } from '@/components/datatable/config/default-grid-options';
import { DEFAULT_FONT_FAMILY, DEFAULT_FONT_SIZE, DEFAULT_SPACING } from '@/services/settings-controller';
import { deepClone } from '@/utils/deepClone';
import { GridOptions } from 'ag-grid-community';

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
  private static instance: SettingsStore;
  
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
  
  // Private constructor for singleton pattern
  private constructor() {
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
      gridOptions: deepClone(DEFAULT_GRID_OPTIONS),
      grid: {}
    };
  }
  
  // Singleton pattern
  public static getInstance(): SettingsStore {
    if (!SettingsStore.instance) {
      SettingsStore.instance = new SettingsStore();
    }
    return SettingsStore.instance;
  }
  
  // Update settings for a specific category
  public updateSettings(category: SettingsCategory | 'gridOptions', settings: any): void {
    // Check if the settings have actually changed
    const currentSettings = this.currentSettings[category as keyof typeof this.currentSettings];
    const hasChanged = Object.keys(settings).some(key => {
      return JSON.stringify(settings[key]) !== JSON.stringify(currentSettings[key]);
    });
    
    if (!hasChanged) {
      // No changes, don't update or notify
      return;
    }
    
    this.currentSettings[category as keyof typeof this.currentSettings] = {
      ...currentSettings,
      ...settings
    };
    
    // Notify listeners for this category
    this.notifyListeners(category, this.currentSettings[category as keyof typeof this.currentSettings]);
  }

  // Update all toolbar settings at once (replaces entire toolbar section)
  public updateAllToolbarSettings(settings: ToolbarSettings): void {
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
      gridOptions: deepClone(DEFAULT_GRID_OPTIONS),
      grid: {}
    };
    
    // Notify all listeners
    Array.from(this.listeners.keys()).forEach(category => {
      this.notifyListeners(category, this.currentSettings[category]);
    });
  }
  
  // Apply settings from a profile
  public applyProfileSettings(settings: ProfileSettings): void {
    if (settings.toolbar) {
      this.updateSettings('toolbar', settings.toolbar);
    }
    
    if (settings.grid) {
      this.currentSettings.grid = { ...settings.grid };
    }
    
    if (settings.custom?.gridOptions) {
      // Check if gridOptions have actually changed
      const currentGridOptions = this.currentSettings.gridOptions;
      const newGridOptions = settings.custom.gridOptions;
      
      const hasGridOptionsChanged = Object.keys(newGridOptions).some(key => {
        return JSON.stringify(newGridOptions[key]) !== JSON.stringify(currentGridOptions[key]);
      });
      
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
        listener(settings);
      } catch (error) {
      }
    });
  }
} 