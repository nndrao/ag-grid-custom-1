import { useState, useEffect, useCallback } from 'react';
import { ProfileManager } from '@/services/profile-manager';
import { SettingsController } from '@/services/settings-controller';
import { Profile } from '@/types/profile.types';
import { ProfileManager as ProfileManagerInterface } from '@/types/ProfileManager';

/**
 * Hook that provides profile management functionality using the new architecture
 */
export function useProfileManager2(settingsController: SettingsController | null): ProfileManagerInterface {
  const [profileManager, setProfileManager] = useState<ProfileManager | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [activeProfile, setActiveProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize the profile manager
  useEffect(() => {
    if (!settingsController) {
      setLoading(false);
      return;
    }

    const manager = new ProfileManager(settingsController);
    setProfileManager(manager);

    const initManager = async () => {
      try {
        setLoading(true);
        await manager.initialize();
        
        // Update state to trigger UI updates
        setProfiles(manager.profiles);
        setActiveProfile(manager.activeProfile);
      } finally {
        setLoading(false);
      }
    };

    initManager();
  }, [settingsController]);

  // Save current profile
  const saveCurrentProfile = useCallback(async () => {
    if (!profileManager) return;
    
    await profileManager.saveCurrentProfile();
    
    // Don't update state after saving - this can cause unnecessary re-renders
    // The profile content has been saved but the reference hasn't changed
  }, [profileManager]);

  // Select a profile
  const selectProfile = useCallback(async (profileId: string) => {
    if (!profileManager) return;
    
    await profileManager.selectProfile(profileId);
    
    // Update state to reflect changes
    setProfiles(profileManager.profiles);
    setActiveProfile(profileManager.activeProfile);
  }, [profileManager]);

  // Create a new profile
  const createProfile = useCallback(async (name: string) => {
    if (!profileManager) throw new Error('Profile manager not initialized');
    
    const newProfile = await profileManager.createProfile(name);
    
    // Update state to reflect changes
    setProfiles(profileManager.profiles);
    
    return newProfile;
  }, [profileManager]);

  // Delete a profile
  const deleteProfile = useCallback(async (profileId: string) => {
    if (!profileManager) return;
    
    await profileManager.deleteProfile(profileId);
    
    // Update state to reflect changes
    setProfiles(profileManager.profiles);
    setActiveProfile(profileManager.activeProfile);
  }, [profileManager]);

  // Return an object matching the ProfileManager interface
  return {
    profiles,
    activeProfile,
    loading,
    saveCurrentProfile,
    selectProfile,
    createProfile,
    deleteProfile
  };
} 