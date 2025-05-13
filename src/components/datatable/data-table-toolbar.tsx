import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Download, Filter, RefreshCw, Settings } from 'lucide-react';
import { Cross2Icon } from "@radix-ui/react-icons";
import { FontSelector } from './font-selector'; // Updated path
import { ProfileSelector } from './profile/ProfileSelector';
import { ProfileSaveButton } from './profile/ProfileSaveButton';
import { ProfileDeleteButton } from './profile/ProfileDeleteButton';
import { ProfileManager } from './profile/ProfileManager';
import { useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast'; // Fixed import path

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
  const isFiltered = table ? table.getState().columnFilters.length > 0 : false;
  const { toast } = useToast(); // Use the hook at component level
  
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
      
      // Show success message
      toast({
        title: "Profile Saved",
        description: "Your grid profile has been successfully updated.",
      });
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "Error",
        description: "Failed to save profile. Please try again.",
        variant: "destructive"
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