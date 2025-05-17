import { useEffect, useRef } from 'react';
import { SettingsController } from '@/services/settings-controller';
import { ProfileManager } from '@/types/ProfileManager';

export function useAgGridProfileSync(
  gridReady: boolean,
  profileManager: ProfileManager | null,
  settingsController: SettingsController | null
) {
  // Only watch for profile selection changes, not profile content updates
  const activeProfileIdRef = useRef<string | null>(null);

  // Watch for activeProfile changes to properly handle fonts and other settings
  useEffect(() => {
    // Skip if grid not ready or no active profile
    if (!gridReady || !profileManager?.activeProfile || !settingsController) return;
    
    const currentProfileId = profileManager.activeProfile.id;
    
    // Only apply settings if the profile ID changed (meaning we switched profiles)
    // This avoids re-applying when just saving the current profile
    if (currentProfileId !== activeProfileIdRef.current) {
      activeProfileIdRef.current = currentProfileId;
      
      // Apply the selected profile's settings
      setTimeout(() => {
        if (settingsController && profileManager?.activeProfile) {
          // Add safety check for profileSettings itself first
          if (!profileManager.activeProfile.settings) {
            profileManager.activeProfile.settings = {
              toolbar: { fontFamily: 'monospace' },
              grid: {},
              custom: {}
            };
          }
          
          const profileSettings = profileManager.activeProfile.settings;
          
          // Add safety check for missing properties
          // If toolbar is missing, create a default one
          if (!profileSettings.toolbar) {
            profileSettings.toolbar = { fontFamily: 'monospace' };
          }
          if (!profileSettings.grid) {
            profileSettings.grid = {};
          }
          if (!profileSettings.custom) {
            profileSettings.custom = {};
          }
          
          // Settings are already applied by ProfileManager, just handle fonts
          
          // Also directly update the font if it exists in the profile
          if (profileSettings.toolbar?.fontFamily) {
            // Apply font directly via CSS
            document.documentElement.style.setProperty(
              "--ag-font-family", 
              profileSettings.toolbar.fontFamily
            );
          }
        }
      }, 50);
    }
  }, [gridReady, profileManager?.activeProfile?.id, settingsController]);

  return {
    activeProfileIdRef
  };
} 