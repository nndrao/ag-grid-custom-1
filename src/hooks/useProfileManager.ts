import { useState, useEffect, useCallback, useRef } from 'react';
import { Profile, ProfileSettings } from '@/types/profile.types';
import { ProfileStore } from '@/lib/profile-store';
import { DEFAULT_FONT_FAMILY, DEFAULT_FONT_SIZE, DEFAULT_SPACING, SettingsController } from '@/services/settingsController';
import { DEFAULT_GRID_OPTIONS } from '@/components/datatable/config/default-grid-options';
import { deepClone } from '@/utils/deepClone';

export const useProfileManager = (settingsController: SettingsController | null) => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [activeProfile, setActiveProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const previousProfileIdRef = useRef<string | null>(null);

  const store = ProfileStore.getInstance();

  const loadProfiles = useCallback(async (applyActive = true) => {
    if (!settingsController) return;
    
    try {
      const loadedProfiles = await store.getAllProfiles();
      setProfiles(loadedProfiles);
      
      if (applyActive) {
        const activeId = await store.getActiveProfileId();
        if (activeId) {
          if (previousProfileIdRef.current === activeId) {
            return;
          }
          previousProfileIdRef.current = activeId;
          
          const active = loadedProfiles.find(p => p.id === activeId);
          if (active) {
            setActiveProfile(active);
            
            if (active.settings) {
              if (!active.settings.toolbar) {
                active.settings.toolbar = {
                  fontFamily: DEFAULT_FONT_FAMILY,
                  fontSize: DEFAULT_FONT_SIZE,
                  spacing: DEFAULT_SPACING
                };
              } else {
                if (active.settings.toolbar.fontSize === undefined || active.settings.toolbar.fontSize === null) {
                  active.settings.toolbar.fontSize = DEFAULT_FONT_SIZE;
                }
                if (active.settings.toolbar.spacing === undefined || active.settings.toolbar.spacing === null) {
                  active.settings.toolbar.spacing = DEFAULT_SPACING;
                }
              }
              
              if (!active.settings.grid) {
                active.settings.grid = {};
              }
              if (!active.settings.custom) {
                active.settings.custom = {};
              }
              
              if (!active.settings.custom.gridOptions) {
                active.settings.custom.gridOptions = deepClone(DEFAULT_GRID_OPTIONS);
              }
              
              settingsController.applyProfileSettings(active.settings);
            } else {
              active.settings = {
                toolbar: { 
                  fontFamily: DEFAULT_FONT_FAMILY,
                  fontSize: DEFAULT_FONT_SIZE,
                  spacing: DEFAULT_SPACING
                },
                grid: {},
                custom: {
                  gridOptions: deepClone(DEFAULT_GRID_OPTIONS)
                }
              };
              
              settingsController.applyProfileSettings(active.settings);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error loading profiles:', error);
    }
  }, [settingsController, store]);

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

    const currentSettings = settingsController.collectCurrentSettings();
    
    const updatedProfile: Profile = {
      ...activeProfile,
      settings: currentSettings,
      metadata: {
        ...activeProfile.metadata,
        updatedAt: new Date()
      }
    };

    await store.saveProfile(updatedProfile);
    
    // IMPORTANT: Don't update React state at all
    // This change prevents any re-renders from happening when saving
    // The data will still be correct when profiles are loaded the next time
  }, [activeProfile, settingsController]);

  const selectProfile = useCallback(async (profileId: string) => {
    if (!settingsController) return;
    
    if (previousProfileIdRef.current === profileId) {
      return;
    }
    
    try {
      const profileExists = profiles.some(p => p.id === profileId);
      
      if (!profileExists) {
        console.error(`Profile with ID ${profileId} not found`);
        return;
      }
      
      settingsController.resetToDefaults();
      
      const allProfiles = await store.getAllProfiles();
      const freshProfile = allProfiles.find(p => p.id === profileId);
      
      if (!freshProfile) {
        console.error(`Profile with ID ${profileId} not found in localStorage`);
        return;
      }
      
      previousProfileIdRef.current = profileId;
      
      await store.setActiveProfileId(profileId);
      
      setProfiles(allProfiles);
      setActiveProfile(freshProfile);
      
      if (freshProfile.settings) {
        if (!freshProfile.settings.toolbar) {
          freshProfile.settings.toolbar = {
            fontFamily: DEFAULT_FONT_FAMILY,
            fontSize: DEFAULT_FONT_SIZE,
            spacing: DEFAULT_SPACING
          };
        } else {
          if (freshProfile.settings.toolbar.fontSize === undefined || freshProfile.settings.toolbar.fontSize === null) {
            freshProfile.settings.toolbar.fontSize = DEFAULT_FONT_SIZE;
          }
          if (freshProfile.settings.toolbar.spacing === undefined || freshProfile.settings.toolbar.spacing === null) {
            freshProfile.settings.toolbar.spacing = DEFAULT_SPACING;
          }
        }
        
        if (!freshProfile.settings.grid) {
          freshProfile.settings.grid = {};
        }
        if (!freshProfile.settings.custom) {
          freshProfile.settings.custom = {};
        }
        
        if (!freshProfile.settings.custom.gridOptions) {
          freshProfile.settings.custom.gridOptions = deepClone(DEFAULT_GRID_OPTIONS);
        }
        
        console.log(`Applying latest settings for profile: ${freshProfile.name}`);
        settingsController.applyProfileSettings(freshProfile.settings);
      } else {
        freshProfile.settings = {
          toolbar: { 
            fontFamily: DEFAULT_FONT_FAMILY,
            fontSize: DEFAULT_FONT_SIZE,
            spacing: DEFAULT_SPACING
          },
          grid: {},
          custom: {
            gridOptions: deepClone(DEFAULT_GRID_OPTIONS)
          }
        };
        
        settingsController.applyProfileSettings(freshProfile.settings);
      }
    } catch (error) {
      console.error('Error selecting profile:', error);
    }
  }, [profiles, settingsController, store]);

  const createProfile = useCallback(async (profileName: string) => {
    if (!settingsController) {
      console.error('Cannot create profile: settingsController is null');
      return;
    }
    
    try {
      console.log('Creating profile with default font size:', DEFAULT_FONT_SIZE);
      
      const defaultToolbarSettings = {
        fontFamily: DEFAULT_FONT_FAMILY,
        fontSize: DEFAULT_FONT_SIZE,
        spacing: DEFAULT_SPACING
      };
      
      console.log('Default toolbar settings:', defaultToolbarSettings);
      
      settingsController.resetToDefaults();
      
      const defaultGridOptions = deepClone(DEFAULT_GRID_OPTIONS);
      
      defaultGridOptions.hasBeenCustomized = false;
      
      const defaultSettings: ProfileSettings = {
        toolbar: defaultToolbarSettings,
        grid: {},
        custom: {
          gridOptions: defaultGridOptions
        }
      };
      
      console.log('Created default settings for new profile:', defaultSettings);
      
      const profileId = `profile-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      
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
      
      await store.saveProfile(newProfile);
      
      setProfiles(prevProfiles => [...prevProfiles, newProfile]);
      
      setActiveProfile(newProfile);
      await store.setActiveProfileId(newProfile.id);
      
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