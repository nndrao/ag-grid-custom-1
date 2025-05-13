import { useCallback, useEffect, useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { FontSelector } from './font-selector';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { SettingsController } from '@/services/settingsController';
import { ProfileButtonGroup } from './profile/ProfileButtonGroup';
import { TooltipProvider } from '@/components/ui/tooltip';

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
  settingsController?: SettingsController | null;
}

// Default values for AG Grid spacing and font size
const DEFAULT_SPACING = 6;
const DEFAULT_FONT_SIZE = 14;

export function DataTableToolbar<TData>({ 
  table, 
  onFontChange, 
  profileManager,
  className,
  settingsController
}: DataTableToolbarProps<TData>) {
  const { toast } = useToast();
  const [spacing, setSpacing] = useState(DEFAULT_SPACING);
  const [fontSize, setFontSize] = useState(DEFAULT_FONT_SIZE);
  
  // Initialize values from settingsController on mount
  useEffect(() => {
    if (settingsController) {
      const currentSettings = settingsController.getCurrentToolbarSettings();
      if (currentSettings.spacing) {
        setSpacing(currentSettings.spacing);
        document.documentElement.style.setProperty("--ag-spacing", `${currentSettings.spacing}px`);
      }
      if (currentSettings.fontSize) {
        setFontSize(currentSettings.fontSize);
        document.documentElement.style.setProperty("--ag-font-size", `${currentSettings.fontSize}px`);
      }
    }
  }, [settingsController]);

  // Subscribe to settings changes
  useEffect(() => {
    if (!settingsController) return;

    const unsubscribe = settingsController.onToolbarSettingsChange((settings) => {
      if (settings.spacing !== undefined) {
        setSpacing(settings.spacing);
        document.documentElement.style.setProperty("--ag-spacing", `${settings.spacing}px`);
      }
      if (settings.fontSize !== undefined) {
        setFontSize(settings.fontSize);
        document.documentElement.style.setProperty("--ag-font-size", `${settings.fontSize}px`);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [settingsController]);
  
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

  // Handle spacing change
  const handleSpacingChange = useCallback((value: number[]) => {
    const newSpacing = value[0];
    setSpacing(newSpacing);
    document.documentElement.style.setProperty("--ag-spacing", `${newSpacing}px`);
    if (settingsController) {
      settingsController.updateToolbarSettings({ spacing: newSpacing });
    }
  }, [settingsController]);

  // Handle font size change
  const handleFontSizeChange = useCallback((value: number[]) => {
    const newFontSize = value[0];
    setFontSize(newFontSize);
    document.documentElement.style.setProperty("--ag-font-size", `${newFontSize}px`);
    if (settingsController) {
      settingsController.updateToolbarSettings({ fontSize: newFontSize });
    }
  }, [settingsController]);

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
        
        {/* Sliders in the middle */}
        <div className="flex items-center gap-4 mx-4 flex-grow">
          <div className="flex items-center gap-2 w-40">
            <Label className="whitespace-nowrap text-xs">Spacing:</Label>
            <Slider
              className="w-24"
              defaultValue={[spacing]}
              value={[spacing]}
              max={20}
              min={2}
              step={1}
              onValueChange={handleSpacingChange}
            />
            <span className="text-xs w-6 text-muted-foreground">{spacing}px</span>
          </div>
          <div className="flex items-center gap-2 w-40">
            <Label className="whitespace-nowrap text-xs">Font Size:</Label>
            <Slider
              className="w-24"
              defaultValue={[fontSize]}
              value={[fontSize]}
              max={20}
              min={8}
              step={1}
              onValueChange={handleFontSizeChange}
            />
            <span className="text-xs w-6 text-muted-foreground">{fontSize}px</span>
          </div>
        </div>
        
        {/* Font selector on the right */}
        <div className="flex items-center gap-2 ml-auto flex-shrink-0">
          <FontSelector 
            onFontChange={onFontChange}
            compact
          />
        </div>
      </div>
    </TooltipProvider>
  );
} 