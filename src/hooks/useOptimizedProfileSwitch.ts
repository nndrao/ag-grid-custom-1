import { useCallback, useRef, useMemo, useEffect } from 'react';
import { GridApi } from 'ag-grid-community';
import { ProfileManager } from '@/types/ProfileManager';
import { SettingsController } from '@/services/settings-controller';
import { applySettingsOptimized } from '@/components/datatable/grid-settings/apply-settings-optimized';
import { toast } from '@/components/ui/use-toast';

interface ProfileCache {
  gridOptions: any;
  gridState: any;
  timestamp: number;
}

interface ProfileSwitchResult {
  success: boolean;
  switchTime: number;
  fromProfile: string;
  toProfile: string;
}

export function useOptimizedProfileSwitch(
  gridApi: GridApi | null,
  profileManager: ProfileManager | null,
  settingsController: SettingsController | null
) {
  // Cache for profile data to avoid reloading
  const profileCache = useRef<Map<string, ProfileCache>>(new Map());
  
  // Track pending switches to prevent race conditions
  const pendingSwitchRef = useRef<Promise<ProfileSwitchResult> | null>(null);
  
  // Pre-calculate common settings transformations
  const commonTransforms = useMemo(() => ({
    rowSelection: (value: any) => {
      if (typeof value === 'string') {
        return { mode: value === 'single' ? 'singleRow' : 'multiRow' };
      }
      return value;
    },
    cellSelection: (value: any) => {
      return typeof value === 'boolean' ? value : !!value;
    }
  }), []);

  // Preload profiles in the background
  const preloadProfile = useCallback(async (profileId: string) => {
    if (!profileManager || !settingsController || !profileManager.profiles || profileCache.current.has(profileId)) {
      return;
    }

    try {
      // Find profile from the profiles array
      const profile = profileManager.profiles.find(p => p.id === profileId);
      if (!profile) return;

      const gridOptions = profile.settings?.custom?.gridOptions || {};
      const gridState = profile.settings?.custom?.gridState || {};
      
      profileCache.current.set(profileId, {
        gridOptions,
        gridState,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Failed to preload profile:', error);
    }
  }, [profileManager, settingsController]);

  // Optimized profile switch function
  const switchProfile = useCallback(async (targetProfileId: string): Promise<ProfileSwitchResult> => {
    const startTime = performance.now();
    const currentProfileId = profileManager?.activeProfile?.id || 'default';
    
    // Prevent concurrent switches
    if (pendingSwitchRef.current) {
      await pendingSwitchRef.current;
    }

    const switchPromise = (async () => {
      try {
        if (!gridApi || !profileManager || !settingsController || !profileManager.profiles) {
          throw new Error('Required dependencies not available');
        }

        // Check cache first
        let profileData = profileCache.current.get(targetProfileId);
        
        // Load from storage if not cached
        if (!profileData) {
          const profile = profileManager.profiles.find(p => p.id === targetProfileId);
          if (!profile) {
            throw new Error(`Profile ${targetProfileId} not found`);
          }
          
          profileData = {
            gridOptions: profile.settings?.custom?.gridOptions || {},
            gridState: profile.settings?.custom?.gridState || {},
            timestamp: Date.now()
          };
          
          profileCache.current.set(targetProfileId, profileData);
        }

        // Prepare optimized settings batch
        const settingsBatch = prepareSettingsBatch(profileData.gridOptions, commonTransforms);
        
        // Save current state before switching
        const currentState = settingsController.gridStateProvider?.extractGridState();
        if (currentState) {
          profileCache.current.set(currentProfileId, {
            gridOptions: settingsController.getCurrentGridOptions() || {},
            gridState: currentState,
            timestamp: Date.now()
          });
        }

        // Apply settings using optimized function
        const applyResult = await applySettingsOptimized(
          gridApi,
          settingsBatch,
          {},
          settingsController
        );

        if (!applyResult.success) {
          throw new Error(applyResult.errors.join(', '));
        }

        // Apply grid state if available
        if (profileData.gridState) {
          await applyGridStateOptimized(gridApi, profileData.gridState);
        }

        // Update active profile
        await profileManager.selectProfile(targetProfileId);

        const switchTime = performance.now() - startTime;

        // Preload adjacent profiles for faster switching
        preloadAdjacentProfiles(targetProfileId);

        return {
          success: true,
          switchTime,
          fromProfile: currentProfileId,
          toProfile: targetProfileId
        };

      } catch (error) {
        console.error('Profile switch failed:', error);
        return {
          success: false,
          switchTime: performance.now() - startTime,
          fromProfile: currentProfileId,
          toProfile: targetProfileId
        };
      }
    })();

    pendingSwitchRef.current = switchPromise;
    const result = await switchPromise;
    pendingSwitchRef.current = null;

    return result;
  }, [gridApi, profileManager, settingsController, commonTransforms, preloadProfile]);

  // Preload adjacent profiles for faster switching
  const preloadAdjacentProfiles = useCallback((currentProfileId: string) => {
    if (!profileManager || !profileManager.profiles) return;
    
    const allProfiles = profileManager.profiles;
    const currentIndex = allProfiles.findIndex(p => p.id === currentProfileId);
    
    // Preload previous and next profiles
    if (currentIndex > 0) {
      preloadProfile(allProfiles[currentIndex - 1].id);
    }
    if (currentIndex < allProfiles.length - 1) {
      preloadProfile(allProfiles[currentIndex + 1].id);
    }
  }, [profileManager, preloadProfile]);

  // Initialize cache with current profile
  useEffect(() => {
    if (profileManager && profileManager.activeProfile && profileManager.activeProfile.id && profileManager.profiles) {
      preloadProfile(profileManager.activeProfile.id);
      preloadAdjacentProfiles(profileManager.activeProfile.id);
    }
  }, [profileManager, preloadProfile, preloadAdjacentProfiles]);

  return {
    switchProfile,
    preloadProfile,
    clearCache: () => profileCache.current.clear()
  };
}

// Helper function to prepare settings batch
function prepareSettingsBatch(gridOptions: any, transforms: any): any {
  const batch: any = {};
  
  for (const [key, value] of Object.entries(gridOptions)) {
    // Apply transformations if available
    if (transforms[key]) {
      batch[key] = transforms[key](value);
    } else {
      batch[key] = value;
    }
  }
  
  return batch;
}

// Optimized grid state application
async function applyGridStateOptimized(gridApi: GridApi, gridState: any): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      // Apply state in batches
      const stateBatches = [
        () => gridApi.applyColumnState?.(gridState.columns),
        () => gridApi.setFilterModel?.(gridState.filters),
        () => gridApi.setSortModel?.(gridState.sort),
        () => {
          if (gridState.scroll) {
            gridApi.ensureIndexVisible?.(gridState.scroll.rowIndex);
            gridApi.ensureColumnVisible?.(gridState.scroll.columnId);
          }
        }
      ];

      // Apply each batch sequentially
      stateBatches.forEach(batch => {
        try {
          batch();
        } catch (error) {
          console.error('Failed to apply grid state batch:', error);
        }
      });

      resolve();
    });
  });
}

// Hook for instant profile switching with visual feedback
export function useInstantProfileSwitch(
  gridApi: GridApi | null,
  profileManager: ProfileManager | null,
  settingsController: SettingsController | null
) {
  const { switchProfile, preloadProfile } = useOptimizedProfileSwitch(
    gridApi,
    profileManager,
    settingsController
  );

  const instantSwitch = useCallback(async (profileId: string) => {
    // Show loading state immediately
    toast({
      title: "Switching Profile",
      description: "Loading profile settings...",
      duration: 1000
    });

    const result = await switchProfile(profileId);
    
    if (result.success) {
      toast({
        title: "Profile Switched",
        description: `Switched to profile in ${result.switchTime.toFixed(0)}ms`,
        variant: "default"
      });
    } else {
      toast({
        title: "Switch Failed",
        description: "Failed to switch profile",
        variant: "destructive"
      });
    }

    return result;
  }, [switchProfile]);

  return {
    instantSwitch,
    preloadProfile
  };
}