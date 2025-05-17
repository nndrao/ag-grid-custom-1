import { useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { SettingsController } from '@/services/settings-controller';
import { ProfileButtonGroup } from './profile/ProfileButtonGroup';
import { TooltipProvider } from '@/components/ui/tooltip';
import { GridSettingsMenu } from './grid-settings/grid-settings-menu';
import { GridApi } from 'ag-grid-community';
import { FontFamilySelector } from './profile/FontFamilySelector';
import { FontSizeSelector } from './profile/FontSizeSelector';
import { SpacingSelector } from './profile/SpacingSelector';
import { SettingsManager } from './grid-settings/settings-manager';

interface ProfileManagerInterface {
  profiles: any[];
  activeProfile: any;
  loading: boolean;
  saveCurrentProfile: () => Promise<void>;
  selectProfile: (profileId: string) => Promise<void>;
  createProfile: (name: string) => Promise<any>;
  deleteProfile: (profileId: string) => Promise<void>;
}

interface DataTableToolbarProps<TData> {
  table: any;
  profileManager?: ProfileManagerInterface | null;
  className?: string;
  settingsController?: SettingsController | null;
  gridApi?: GridApi | null;
}

export function DataTableToolbar<TData>({ 
  table, 
  profileManager,
  className,
  settingsController,
  gridApi
}: DataTableToolbarProps<TData>) {
  const { toast } = useToast();
  
  const handleCreateProfile = useCallback(async (name: string) => {
    if (profileManager) {
      await profileManager.createProfile(name);
    }
  }, [profileManager]);

  const handleDeleteProfile = useCallback(async () => {
    if (profileManager && profileManager.activeProfile) {
      await profileManager.deleteProfile(profileManager.activeProfile.id);
    }
  }, [profileManager]);

  const onSaveProfile = useCallback(async () => {
    if (!profileManager || !profileManager.activeProfile) return;
    
    try {
      // Add a small delay to ensure all grid state is settled
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Save current settings without re-applying them
      await profileManager.saveCurrentProfile();
      
      // Show enhanced success message
      toast({
        title: "Profile Saved Successfully",
        description: `Profile "${profileManager.activeProfile.name}" has been updated with your current grid settings and preferences.`,
        variant: "default",
        className: "bg-green-50 border-green-200",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Error Saving Profile",
        description: "Failed to save profile. Please try again or check console for details.",
        variant: "destructive",
        duration: 5000,
      });
    }
  }, [profileManager, toast]);

  return (
    <TooltipProvider>
      <div className={`h-[60px] flex items-center border-b border-border bg-muted/40 backdrop-blur-sm px-4 relative z-10 ${className || ''}`}>
        <div className="flex items-center gap-2 flex-shrink-0">
          {profileManager && !profileManager.loading && profileManager.profiles && (
            <ProfileButtonGroup
              profiles={profileManager.profiles}
              activeProfile={profileManager.activeProfile}
              onSelectProfile={profileManager.selectProfile}
              onSave={onSaveProfile}
              onDelete={handleDeleteProfile}
              onCreate={handleCreateProfile}
            />
          )}
        </div>
        
        {/* Empty space in the middle */}
        <div className="flex-grow"></div>
        
        {/* Font Controls */}
        {settingsController && (
          <div className="flex items-center gap-3 mr-4">
            <FontFamilySelector settingsController={settingsController} />
            <FontSizeSelector settingsController={settingsController} />
            <SpacingSelector settingsController={settingsController} />
          </div>
        )}
        
        {/* Grid settings menu on the right */}
        <div className="flex items-center gap-2 ml-auto flex-shrink-0">
          {gridApi && (
            <GridSettingsMenu 
              gridApi={gridApi} 
              settingsController={settingsController || null} 
            />
          )}
          <SettingsManager 
            gridApi={gridApi} 
            settingsController={settingsController} 
          />
        </div>
      </div>
    </TooltipProvider>
  );
} 