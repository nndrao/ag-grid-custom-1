import { Profile, ProfileSettings } from '@/types/profile.types';
import { ProfileStore } from '@/lib/profile-store';
import { SettingsStore } from '@/stores/settings-store';
import { SettingsController } from './settings-controller';

/**
 * ProfileManager handles loading, saving, and switching between profiles
 * It integrates with SettingsStore and SettingsController to apply and collect settings
 */
export class ProfileManager {
  private settingsStore: SettingsStore;
  private settingsController: SettingsController;
  private store: ProfileStore;
  private _profiles: Profile[] = [];
  private _activeProfile: Profile | null = null;
  private _loading: boolean = true;
  private previousProfileIdRef: string | null = null;

  constructor(settingsController: SettingsController) {
    this.settingsController = settingsController;
    this.settingsStore = SettingsStore.getInstance();
    this.store = ProfileStore.getInstance();
  }

  /**
   * Initialize the profile manager by loading profiles
   */
  public async initialize(): Promise<void> {
    try {
      await this.loadProfiles(true);
    } finally {
      this._loading = false;
    }
  }

  /**
   * Load all profiles and optionally apply the active one
   */
  public async loadProfiles(applyActive = true): Promise<void> {
    try {
      this._loading = true;
      const loadedProfiles = await this.store.getAllProfiles();
      this._profiles = loadedProfiles;
      
      if (applyActive) {
        const activeId = await this.store.getActiveProfileId();
        if (activeId) {
          if (this.previousProfileIdRef === activeId) {
            return;
          }
          this.previousProfileIdRef = activeId;
          
          const active = loadedProfiles.find(p => p.id === activeId);
          if (active) {
            this._activeProfile = active;
            
            // Ensure active profile has necessary settings structure
            if (!active.settings) {
              active.settings = {
                toolbar: {},
                grid: {},
                custom: { gridOptions: {} }
              };
            }
            
            // Apply profile settings
            this.settingsController.applyProfileSettings(active.settings);
          }
        }
      }
    } catch (error) {
    } finally {
      this._loading = false;
    }
  }

  /**
   * Save the current settings to the active profile
   */
  public async saveCurrentProfile(): Promise<void> {
    if (!this._activeProfile) return;

    const currentSettings = this.settingsController.collectCurrentSettings();
    
    const updatedProfile: Profile = {
      ...this._activeProfile,
      settings: currentSettings,
      metadata: {
        ...this._activeProfile.metadata,
        updatedAt: new Date()
      }
    };

    await this.store.saveProfile(updatedProfile);
    // Update local profile instance without triggering re-renders
    this._activeProfile = updatedProfile;
  }

  /**
   * Switch to a different profile
   */
  public async selectProfile(profileId: string): Promise<void> {
    if (this.previousProfileIdRef === profileId) {
      return;
    }
    
    try {
      const profileExists = this._profiles.some(p => p.id === profileId);
      
      if (!profileExists) {
        return;
      }
      
      this.settingsController.resetToDefaults();
      
      const allProfiles = await this.store.getAllProfiles();
      const freshProfile = allProfiles.find(p => p.id === profileId);
      
      if (!freshProfile) {
        return;
      }
      
      this.previousProfileIdRef = profileId;
      
      await this.store.setActiveProfileId(profileId);
      
      this._profiles = allProfiles;
      this._activeProfile = freshProfile;
      
      // Ensure profile has necessary settings structure
      if (!freshProfile.settings) {
        freshProfile.settings = {
          toolbar: {},
          grid: {},
          custom: { gridOptions: {} }
        };
      }
      
      // Apply profile settings
      this.settingsController.applyProfileSettings(freshProfile.settings);
    } catch (error) {
    }
  }

  /**
   * Create a new profile with the given name
   */
  public async createProfile(name: string): Promise<Profile> {
    try {
      // Check if a profile with this name already exists
      const existingProfile = this._profiles.find(
        p => p.name.toLowerCase() === name.toLowerCase()
      );
      
      if (existingProfile) {
        throw new Error(`A profile named "${name}" already exists`);
      }
      
      // Create a new profile using the current settings
      const currentSettings = this.settingsController.collectCurrentSettings();
      
      const newProfile = await this.store.createProfile(name, currentSettings);
      
      // Reload profiles to ensure they're up to date
      await this.loadProfiles(false);
      
      return newProfile;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete a profile
   */
  public async deleteProfile(profileId: string): Promise<void> {
    try {
      await this.store.deleteProfile(profileId);
      
      // If active profile was deleted, select a different one
      if (this._activeProfile?.id === profileId) {
        this._activeProfile = null;
        this.previousProfileIdRef = null;
        
        // Find a different profile to select
        const allProfiles = await this.store.getAllProfiles();
        if (allProfiles.length > 0) {
          await this.selectProfile(allProfiles[0].id);
        }
      }
      
      // Reload profiles
      await this.loadProfiles(false);
    } catch (error) {
      throw error;
    }
  }

  // Getters for state access

  get profiles(): Profile[] {
    return this._profiles;
  }
  
  get activeProfile(): Profile | null {
    return this._activeProfile;
  }
  
  get loading(): boolean {
    return this._loading;
  }
} 