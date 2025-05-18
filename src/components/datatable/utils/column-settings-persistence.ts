import { ColDef } from 'ag-grid-community';
import { ProfileStore } from '@/lib/profile-store';

export class ColumnSettingsPersistence {
  private static profileStore = ProfileStore.getInstance();
  
  /**
   * Save column definitions to the active profile's custom settings
   */
  static saveColumnSettings(columnDefs: ColDef[]) {
    try {
      console.log('ColumnSettingsPersistence: Saving column definitions', columnDefs?.length);
      
      const activeProfile = this.profileStore.getActiveProfile();
      if (!activeProfile) {
        console.warn('No active profile to save column settings');
        return false;
      }
      
      // Update the profile with new column settings
      const updatedProfile = {
        ...activeProfile,
        settings: {
          ...activeProfile.settings,
          custom: {
            ...activeProfile.settings.custom,
            columnDefs: columnDefs
          }
        }
      };
      
      // Save to profile store
      this.profileStore.updateProfile(activeProfile.id, updatedProfile);
      console.log('ColumnSettingsPersistence: Column settings saved successfully');
      
      return true;
    } catch (error) {
      console.error('ColumnSettingsPersistence: Error saving column settings', error);
      return false;
    }
  }
  
  /**
   * Get saved column definitions from the active profile
   */
  static getColumnSettings(): ColDef[] | null {
    try {
      const activeProfile = this.profileStore.getActiveProfile();
      if (!activeProfile) {
        return null;
      }
      
      return activeProfile.settings?.custom?.columnDefs || null;
    } catch (error) {
      console.error('ColumnSettingsPersistence: Error getting column settings', error);
      return null;
    }
  }
  
  /**
   * Clear column settings from the active profile
   */
  static clearColumnSettings() {
    try {
      const activeProfile = this.profileStore.getActiveProfile();
      if (!activeProfile) {
        return false;
      }
      
      // Remove column settings
      const updatedProfile = {
        ...activeProfile,
        settings: {
          ...activeProfile.settings,
          custom: {
            ...activeProfile.settings.custom,
            columnDefs: undefined
          }
        }
      };
      
      this.profileStore.updateProfile(activeProfile.id, updatedProfile);
      return true;
    } catch (error) {
      console.error('ColumnSettingsPersistence: Error clearing column settings', error);
      return false;
    }
  }
}