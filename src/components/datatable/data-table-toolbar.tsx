import { ProfileSelector } from './profile/ProfileSelector';
import { ProfileSaveButton } from './profile/ProfileSaveButton';
import { ProfileDeleteButton } from './profile/ProfileDeleteButton';
import { ProfileManager } from './profile/ProfileManager';
import { useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { FontSelector } from './font-selector';

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
  onFontChange?: (font: string) => void;
  profileManager?: ProfileManagerInterface | null;
  className?: string;
}

export function DataTableToolbar<TData>({ 
  table, 
  onFontChange, 
  profileManager,
  className 
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
      console.error('Error saving profile:', error);
      toast({
        title: "Error Saving Profile",
        description: "Failed to save profile. Please try again or check console for details.",
        variant: "destructive",
        duration: 5000,
      });
    }
  }, [profileManager, toast]);

  return (
    <div className={`h-[60px] flex items-center justify-between gap-4 border-b border-border bg-muted/40 backdrop-blur-sm px-4 ${className || ''}`}>
      <div className="flex items-center gap-2">
        {profileManager && !profileManager.loading && profileManager.profiles && (
          <>
            <ProfileSelector 
              profiles={profileManager.profiles}
              activeProfile={profileManager.activeProfile}
              onSelectProfile={profileManager.selectProfile}
            />
            <ProfileSaveButton 
              onSave={onSaveProfile}
              disabled={!profileManager.activeProfile}
            />
            <ProfileDeleteButton 
              onDelete={handleDeleteProfile}
              disabled={!profileManager.activeProfile}
              profileName={profileManager.activeProfile?.name}
            />
            <ProfileManager 
              onCreate={handleCreateProfile}
            />
          </>
        )}
      </div>
      <div className="flex items-center gap-2">
        <FontSelector 
          onFontChange={onFontChange} 
        />
      </div>
    </div>
  );
} 