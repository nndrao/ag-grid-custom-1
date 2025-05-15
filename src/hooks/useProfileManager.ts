import { useState, useEffect, useCallback } from 'react';
import { Profile, ProfileSettings } from '@/types/profile.types';
import { ProfileStore } from '@/lib/profile-store';
import { DEFAULT_FONT_FAMILY, DEFAULT_FONT_SIZE, SettingsController } from '@/services/settingsController';
import { DEFAULT_GRID_OPTIONS } from '@/components/datatable/config/default-grid-options';
import { deepClone } from '@/utils/deepClone';

export const useProfileManager = (settingsController: SettingsController | null) => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [activeProfile, setActiveProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const store = ProfileStore.getInstance();

  // Extract loadProfiles to a separate function so it can be reused
  const loadProfiles = useCallback(async (applyActive = true) => {
    if (!settingsController) return;
    
    try {
      const loadedProfiles = await store.getAllProfiles();
      setProfiles(loadedProfiles);
      
      if (applyActive) {
        const activeId = await store.getActiveProfileId();
        if (activeId) {
          const active = loadedProfiles.find(p => p.id === activeId);
          if (active) {
            setActiveProfile(active);
            
            // Check if the profile has valid settings before applying
            if (active.settings) {
              // Ensure settings has all required properties
              if (!active.settings.toolbar) {
                active.settings.toolbar = {
                  fontFamily: DEFAULT_FONT_FAMILY,
                  fontSize: DEFAULT_FONT_SIZE
                };
                console.warn(`Fixing missing toolbar settings for profile: ${active.name}`);
              } else if (active.settings.toolbar.fontSize === undefined || active.settings.toolbar.fontSize === null) {
                // Ensure fontSize is set even if toolbar exists but fontSize is missing
                active.settings.toolbar.fontSize = DEFAULT_FONT_SIZE;
                console.warn(`Fixing missing font size in toolbar settings for profile: ${active.name}`);
              }
              
              // Similar check for other settings
              if (!active.settings.grid) {
                active.settings.grid = {};
                console.warn(`Fixing missing grid settings for profile: ${active.name}`);
              }
              if (!active.settings.custom) {
                active.settings.custom = {};
                console.warn(`Fixing missing custom settings for profile: ${active.name}`);
              }
              
              // Check if grid options have been set for this profile
              if (!active.settings.custom.gridOptions) {
                console.log(`No grid options found for profile: ${active.name}, applying defaults`);
                active.settings.custom.gridOptions = deepClone(DEFAULT_GRID_OPTIONS);
              }
              
              // Now apply settings
              settingsController.applyProfileSettings(active.settings);
            } else {
              console.warn(`Profile ${active.name} has no settings, creating default settings`);
              
              // Create default settings for this profile
              active.settings = {
                toolbar: { 
                  fontFamily: DEFAULT_FONT_FAMILY,
                  fontSize: DEFAULT_FONT_SIZE
                },
                grid: {},
                custom: {
                  gridOptions: deepClone(DEFAULT_GRID_OPTIONS)
                }
              };
              
              // Apply the default settings
              settingsController.applyProfileSettings(active.settings);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error loading profiles:', error);
    }
  }, [settingsController, store]);

  // Load profiles on mount
  useEffect(() => {
    if (!settingsController) {
      setLoading(false);
      return;
    }
    
    const initializeProfiles = async () => {
      try {
        await loadProfiles(true);
      } finally {
        setLoading(false);
      }
    };

    initializeProfiles();
  }, [settingsController, loadProfiles]);

  const saveCurrentProfile = useCallback(async () => {
    if (!activeProfile || !settingsController) return;

    // Just collect current settings without applying them
    const currentSettings = settingsController.collectCurrentSettings();
    
    // Create updated profile object
    const updatedProfile: Profile = {
      ...activeProfile,
      settings: currentSettings,
      metadata: {
        ...activeProfile.metadata,
        updatedAt: new Date()
      }
    };

    // Save to storage directly without triggering any state updates
    await store.saveProfile(updatedProfile);
    
    // IMPORTANT: Don't update React state at all
    // This change prevents any re-renders from happening when saving
    // The data will still be correct when profiles are loaded the next time
    
    // Instead of:
    // setActiveProfile(prev => {...})
    // setProfiles(prev => ...)
    
    // We just silently update the data in localStorage
  }, [activeProfile, settingsController]);

  const selectProfile = useCallback(async (profileId: string) => {
    if (!settingsController) return;
    
    try {
      // First, check if the profile exists in our list
      const profileExists = profiles.some(p => p.id === profileId);
      
      if (!profileExists) {
        console.error(`Profile with ID ${profileId} not found`);
        return;
      }
      
      // Reset controller to defaults first to avoid inheriting settings from previous profile
      settingsController.resetToDefaults();
      
      // Get all profiles from localStorage to ensure we have the latest version
      const allProfiles = await store.getAllProfiles();
      const freshProfile = allProfiles.find(p => p.id === profileId);
      
      if (!freshProfile) {
        console.error(`Profile with ID ${profileId} not found in localStorage`);
        return;
      }
      
      // Set the profile as active in localStorage
      await store.setActiveProfileId(profileId);
      
      // Update the profiles list in state with the fresh data
      setProfiles(allProfiles);
      setActiveProfile(freshProfile);
      
      // Check if the profile has valid settings before applying
      if (freshProfile.settings) {
        // Ensure settings has all required properties
        if (!freshProfile.settings.toolbar) {
          freshProfile.settings.toolbar = {
            fontFamily: DEFAULT_FONT_FAMILY,
            fontSize: DEFAULT_FONT_SIZE
          };
          console.warn(`Fixing missing toolbar settings for profile: ${freshProfile.name}`);
        } else if (freshProfile.settings.toolbar.fontSize === undefined || freshProfile.settings.toolbar.fontSize === null) {
          // Ensure fontSize is set even if toolbar exists but fontSize is missing
          freshProfile.settings.toolbar.fontSize = DEFAULT_FONT_SIZE;
          console.warn(`Fixing missing font size in toolbar settings for profile: ${freshProfile.name}`);
        }
        
        if (!freshProfile.settings.grid) {
          freshProfile.settings.grid = {};
          console.warn(`Fixing missing grid settings for profile: ${freshProfile.name}`);
        }
        if (!freshProfile.settings.custom) {
          freshProfile.settings.custom = {};
          console.warn(`Fixing missing custom settings for profile: ${freshProfile.name}`);
        }
        
        // Check if grid options have been set for this profile
        if (!freshProfile.settings.custom.gridOptions) {
          console.log(`No grid options found for profile: ${freshProfile.name}, applying defaults`);
          freshProfile.settings.custom.gridOptions = deepClone(DEFAULT_GRID_OPTIONS);
        }
        
        // Apply the fresh settings
        console.log(`Applying latest settings for profile: ${freshProfile.name}`);
        settingsController.applyProfileSettings(freshProfile.settings);
      } else {
        console.warn(`Profile ${freshProfile.name} has no settings, creating default settings`);
        
        // Create default settings for this profile
        freshProfile.settings = {
          toolbar: { 
            fontFamily: DEFAULT_FONT_FAMILY,
            fontSize: DEFAULT_FONT_SIZE
          },
          grid: {},
          custom: {
            gridOptions: deepClone(DEFAULT_GRID_OPTIONS)
          }
        };
        
        // Apply the default settings
        settingsController.applyProfileSettings(freshProfile.settings);
      }
    } catch (error) {
      console.error('Error selecting profile:', error);
    }
  }, [profiles, settingsController]);

  const createProfile = useCallback(async (profileName: string) => {
    if (!settingsController) {
      console.error('Cannot create profile: settingsController is null');
      return;
    }
    
    try {
      console.log('Creating profile with default font size:', DEFAULT_FONT_SIZE);
      
      // Start with default toolbar settings
      const defaultToolbarSettings = {
        fontFamily: DEFAULT_FONT_FAMILY,
        fontSize: DEFAULT_FONT_SIZE
      };
      
      console.log('Default toolbar settings:', defaultToolbarSettings);
      
      // Create default grid settings with pristine DEFAULT_GRID_OPTIONS
      // Important: Reset the grid controller's state first to avoid inheriting settings
      settingsController.resetToDefaults();
      
      // Get a fresh copy of default grid options
      const defaultGridOptions = deepClone(DEFAULT_GRID_OPTIONS);
      
      // Add special flag to identify this as a new default profile
      // This will be used to detect if settings should be reset when profile is selected
      defaultGridOptions.hasBeenCustomized = false;
      
      // Create a completely fresh settings object with default grid options
      const defaultSettings: ProfileSettings = {
        toolbar: defaultToolbarSettings,
        grid: {}, // Empty grid state (columns will use defaults)
        custom: {
          gridOptions: defaultGridOptions
        }
      };
      
      console.log('Created default settings for new profile:', defaultSettings);
      
      // Create a uniqueId for the profile
      const profileId = `profile-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      
      // Create the new profile with default settings
      const newProfile: Profile = {
        id: profileId,
        name: profileName,
        isDefault: false,
        settings: defaultSettings,
        metadata: {
          createdAt: new Date(),
          updatedAt: new Date(),
          version: '1.0'
        }
      };
      
      // Save the profile
      await store.saveProfile(newProfile);
      
      // Add to local state (without refreshing the grid)
      setProfiles(prevProfiles => [...prevProfiles, newProfile]);
      
      // Make it active and apply the default settings to reset the grid
      setActiveProfile(newProfile);
      await store.setActiveProfileId(newProfile.id);
      
      // Important: Apply the default settings to reset the grid
      settingsController.applyProfileSettings(defaultSettings);
      
      return newProfile;
    } catch (error) {
      console.error('Error creating profile:', error);
      throw error;
    }
  }, [settingsController, store]);

  const deleteProfile = useCallback(async (profileId: string) => {
    await store.deleteProfile(profileId);
    setProfiles(prev => prev.filter(p => p.id !== profileId));
    
    if (activeProfile?.id === profileId) {
      setActiveProfile(null);
      await store.setActiveProfileId('');
    }
  }, [activeProfile]);

  return {
    profiles,
    activeProfile,
    loading,
    saveCurrentProfile,
    selectProfile,
    createProfile,
    deleteProfile
  };
}; 