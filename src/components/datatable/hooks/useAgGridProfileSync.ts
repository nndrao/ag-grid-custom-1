import { useEffect, useRef } from 'react';
import { SettingsController } from '@/services/settingsController';
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
          const profileSettings = profileManager.activeProfile.settings;
          
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