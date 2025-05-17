import { useCallback, useMemo, useRef } from 'react';
import { Profile } from '@/types/profile.types';
import { SettingsController } from '@/services/settings-controller';
import { GridApi } from 'ag-grid-community';
import { useProfileManager2 } from './useProfileManager2';
import { applySettingsOptimized } from '@/components/datatable/grid-settings/apply-settings-optimized';

interface ProfileSnapshot {
  gridOptions: any;
  gridState: any;
  displaySettings: any;
  timestamp: number;
}

export function useOptimizedProfileManager(
  settingsController: SettingsController | null,
  gridApi: GridApi | null
) {
  // Use the base profile manager
  const baseManager = useProfileManager2(settingsController);
  
  // Cache for profile snapshots
  const snapshotCache = useRef<Map<string, ProfileSnapshot>>(new Map());
  
  // Queue for profile switch operations
  const switchQueue = useRef<Promise<void> | null>(null);
  
  // Optimized profile select with caching
  const selectProfile = useCallback(async (profileId: string) => {
    if (!gridApi || !settingsController) {
      return baseManager.selectProfile(profileId);
    }
    
    try {
      // Check cache first
      const cachedSnapshot = snapshotCache.current.get(profileId);
      const cacheAge = cachedSnapshot ? Date.now() - cachedSnapshot.timestamp : Infinity;
      
      // Use cache if it's fresh (less than 30 seconds old)
      if (cachedSnapshot && cacheAge < 30000) {
        // Apply cached settings directly
        const applyResult = await applySettingsOptimized(
          gridApi,
          cachedSnapshot.gridOptions,
          {},
          settingsController
        );
        
        if (applyResult.success) {
          // Update the active profile
          baseManager.activeProfile = baseManager.profiles.find(p => p.id === profileId) || null;
          
          // Apply grid state
          if (cachedSnapshot.gridState) {
            settingsController.gridStateProvider?.applyGridState(cachedSnapshot.gridState);
          }
          
          // Apply display settings
          if (cachedSnapshot.displaySettings) {
            await settingsController.applyProfileSettings({
              display: cachedSnapshot.displaySettings
            });
          }
          
          return;
        }
      }
      
      // Queue switch operations to prevent conflicts
      if (switchQueue.current) {
        await switchQueue.current;
      }
      
      const switchPromise = (async () => {
        // Save current state to cache
        const currentProfile = baseManager.activeProfile;
        if (currentProfile) {
          snapshotCache.current.set(currentProfile.id, {
            gridOptions: settingsController.getCurrentGridOptions(),
            gridState: settingsController.gridStateProvider?.extractGridState(),
            displaySettings: settingsController.getCurrentDisplaySettings(),
            timestamp: Date.now()
          });
        }
        
        // Perform the actual profile switch
        await baseManager.selectProfile(profileId);
        
        // Update cache for the new profile
        const newProfile = baseManager.profiles.find(p => p.id === profileId);
        if (newProfile) {
          snapshotCache.current.set(profileId, {
            gridOptions: newProfile.settings?.custom?.gridOptions || {},
            gridState: newProfile.settings?.custom?.gridState || {},
            displaySettings: newProfile.settings?.display || {},
            timestamp: Date.now()
          });
        }
      })();
      
      switchQueue.current = switchPromise;
      await switchPromise;
      switchQueue.current = null;
      
    } catch (error) {
      console.error('Optimized profile switch failed:', error);
      // Fallback to standard switch
      await baseManager.selectProfile(profileId);
    }
  }, [baseManager, gridApi, settingsController]);
  
  // Optimized save with differential updates
  const saveCurrentProfile = useCallback(async () => {
    if (!gridApi || !settingsController || !baseManager.activeProfile) {
      return baseManager.saveCurrentProfile();
    }
    
    try {
      // Get current settings
      const currentOptions = settingsController.getCurrentGridOptions();
      const currentState = settingsController.gridStateProvider?.extractGridState();
      
      // Check if anything has changed
      const cachedSnapshot = snapshotCache.current.get(baseManager.activeProfile.id);
      
      if (cachedSnapshot) {
        const optionsChanged = JSON.stringify(currentOptions) !== JSON.stringify(cachedSnapshot.gridOptions);
        const stateChanged = JSON.stringify(currentState) !== JSON.stringify(cachedSnapshot.gridState);
        
        if (!optionsChanged && !stateChanged) {
          // Nothing to save
          return;
        }
      }
      
      // Perform save
      await baseManager.saveCurrentProfile();
      
      // Update cache
      snapshotCache.current.set(baseManager.activeProfile.id, {
        gridOptions: currentOptions,
        gridState: currentState,
        displaySettings: settingsController.getCurrentDisplaySettings(),
        timestamp: Date.now()
      });
      
    } catch (error) {
      console.error('Optimized save failed:', error);
      // Fallback to standard save
      await baseManager.saveCurrentProfile();
    }
  }, [baseManager, gridApi, settingsController]);
  
  // Preload adjacent profiles for faster switching
  const preloadAdjacentProfiles = useCallback(() => {
    if (!baseManager.activeProfile || !settingsController) return;
    
    const profiles = baseManager.profiles;
    const currentIndex = profiles.findIndex(p => p.id === baseManager.activeProfile?.id);
    
    // Preload previous and next profiles
    [-1, 1].forEach(offset => {
      const targetIndex = currentIndex + offset;
      if (targetIndex >= 0 && targetIndex < profiles.length) {
        const profile = profiles[targetIndex];
        if (!snapshotCache.current.has(profile.id)) {
          snapshotCache.current.set(profile.id, {
            gridOptions: profile.settings?.custom?.gridOptions || {},
            gridState: profile.settings?.custom?.gridState || {},
            displaySettings: profile.settings?.display || {},
            timestamp: Date.now()
          });
        }
      }
    });
  }, [baseManager, settingsController]);
  
  // Return enhanced profile manager
  return useMemo(() => ({
    ...baseManager,
    selectProfile,
    saveCurrentProfile,
    preloadAdjacentProfiles,
    clearCache: () => snapshotCache.current.clear(),
    getCacheSize: () => snapshotCache.current.size
  }), [baseManager, selectProfile, saveCurrentProfile, preloadAdjacentProfiles]);
}