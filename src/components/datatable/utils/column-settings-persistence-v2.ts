import { ColDef } from 'ag-grid-community';
import { ProfileStore } from '@/lib/profile-store';
import { ColumnSettingsMap, ProfileCustomSettings } from '../column-settings/types';

export class ColumnSettingsPersistenceV2 {
  private static profileStore = ProfileStore.getInstance();
  
  /**
   * Save column settings map to the active profile
   */
  static async saveColumnSettings(
    columnSettings: ColumnSettingsMap,
    additionalData?: {
      columnOrder?: string[];
      hiddenColumns?: string[];
      columnState?: any[];
    }
  ): Promise<boolean> {
    try {
      console.log('ColumnSettingsPersistenceV2: Saving column settings', columnSettings);
      
      const activeProfileId = await this.profileStore.getActiveProfileId();
      if (!activeProfileId) {
        console.warn('No active profile ID');
        return false;
      }
      
      const profiles = await this.profileStore.getAllProfiles();
      const activeProfile = profiles.find(p => p.id === activeProfileId);
      
      if (!activeProfile) {
        console.warn('No active profile found');
        return false;
      }
      
      const customSettings: ProfileCustomSettings = {
        columnSettings,
        ...additionalData
      };
      
      // Update the profile with new column settings
      const updatedProfile = {
        ...activeProfile,
        settings: {
          ...activeProfile.settings,
          custom: customSettings
        }
      };
      
      // Save to profile store
      await this.profileStore.saveProfile(updatedProfile);
      console.log('ColumnSettingsPersistenceV2: Column settings saved successfully');
      
      return true;
    } catch (error) {
      console.error('ColumnSettingsPersistenceV2: Error saving column settings', error);
      return false;
    }
  }
  
  /**
   * Get saved column settings map from the active profile
   */
  static async getColumnSettings(): Promise<ProfileCustomSettings | null> {
    try {
      const activeProfileId = await this.profileStore.getActiveProfileId();
      if (!activeProfileId) {
        return null;
      }
      
      const profiles = await this.profileStore.getAllProfiles();
      const activeProfile = profiles.find(p => p.id === activeProfileId);
      
      if (!activeProfile) {
        return null;
      }
      
      const customSettings = activeProfile.settings?.custom as ProfileCustomSettings;
      
      // Ensure we have a valid structure
      if (!customSettings || typeof customSettings !== 'object') {
        return null;
      }
      
      // Return the custom settings with a default structure
      return {
        columnSettings: customSettings.columnSettings || {},
        columnOrder: customSettings.columnOrder || [],
        hiddenColumns: customSettings.hiddenColumns || [],
        columnState: customSettings.columnState || [],
        sortModel: customSettings.sortModel || [],
        filterModel: customSettings.filterModel || {}
      };
    } catch (error) {
      console.error('ColumnSettingsPersistenceV2: Error getting column settings', error);
      return null;
    }
  }
  
  /**
   * Clear column settings from the active profile
   */
  static async clearColumnSettings(): Promise<boolean> {
    try {
      const activeProfileId = await this.profileStore.getActiveProfileId();
      if (!activeProfileId) {
        return false;
      }
      
      const profiles = await this.profileStore.getAllProfiles();
      const activeProfile = profiles.find(p => p.id === activeProfileId);
      
      if (!activeProfile) {
        return false;
      }
      
      // Remove column settings
      const updatedProfile = {
        ...activeProfile,
        settings: {
          ...activeProfile.settings,
          custom: {}
        }
      };
      
      await this.profileStore.saveProfile(updatedProfile);
      return true;
    } catch (error) {
      console.error('ColumnSettingsPersistenceV2: Error clearing column settings', error);
      return false;
    }
  }
  
  /**
   * Export column settings to JSON
   */
  static exportSettings(): string | null {
    try {
      const settings = this.getColumnSettings();
      if (!settings) {
        return null;
      }
      
      return JSON.stringify(settings, null, 2);
    } catch (error) {
      console.error('ColumnSettingsPersistenceV2: Error exporting settings', error);
      return null;
    }
  }
  
  /**
   * Import column settings from JSON
   */
  static importSettings(jsonString: string): boolean {
    try {
      const settings = JSON.parse(jsonString) as ProfileCustomSettings;
      
      // Validate the structure
      if (!settings.columnSettings || typeof settings.columnSettings !== 'object') {
        throw new Error('Invalid settings structure');
      }
      
      // Save the imported settings
      return this.saveColumnSettings(
        settings.columnSettings,
        {
          columnOrder: settings.columnOrder,
          hiddenColumns: settings.hiddenColumns,
          columnState: settings.columnState
        }
      );
    } catch (error) {
      console.error('ColumnSettingsPersistenceV2: Error importing settings', error);
      return false;
    }
  }
}