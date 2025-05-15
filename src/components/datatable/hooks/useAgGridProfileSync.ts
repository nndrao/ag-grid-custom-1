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
            console.warn("⚠️ Profile has no settings object at all, creating default settings");
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
            console.warn("⚠️ Profile active in sync hook has no toolbar settings");
            profileSettings.toolbar = { fontFamily: 'monospace' };
          }
          if (!profileSettings.grid) {
            console.warn("⚠️ Profile active in sync hook has no grid settings");
            profileSettings.grid = {};
          }
          if (!profileSettings.custom) {
            profileSettings.custom = {};
          }
          
          // Apply settings to grid
          settingsController.applyProfileSettings(profileSettings);
          
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
  }, [gridReady, profileManager, settingsController]);

  return {
    activeProfileIdRef
  };
} 