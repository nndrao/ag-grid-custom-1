import React from 'react';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { GridSettingsMenu } from './grid-settings/grid-settings-menu';
import { ProfileSelector } from './profile/ProfileSelector';
import { ProfileSaveButton } from './profile/ProfileSaveButton';
import { ProfileDeleteButton } from './profile/ProfileDeleteButton';
import { FontFamilySelector } from './profile/FontFamilySelector';
import { FontSizeSelector } from './profile/FontSizeSelector';
import { SpacingSelector } from './profile/SpacingSelector';
import { GridApi } from 'ag-grid-community';
import { ProfileManager } from './types/ProfileManager';
import { SettingsController } from './services/settings-controller';

interface DataTableToolbarProps<TData = any> {
  table: any; // This is legacy from TanStack Table but we keep it for compatibility
  profileManager?: any;
  settingsController?: any;
  gridApi?: GridApi | null;
  className?: string;
}

export function DataTableToolbar<TData>({
  table,
  profileManager,
  settingsController,
  gridApi,
  className = ''
}: DataTableToolbarProps<TData>) {
  
  const renderProfileManagement = () => {
    if (!profileManager) return null;
    
    return (
      <div className="flex items-center gap-1.5">
        <ProfileSelector 
          profiles={profileManager.profiles} 
          activeProfile={profileManager.activeProfile} 
          onSelectProfile={profileManager.selectProfile}
          loading={profileManager.loading}
        />
        <ProfileSaveButton 
          onSave={profileManager.saveCurrentProfile}
          activeProfile={profileManager.activeProfile}
          loading={profileManager.loading}
          iconOnly={true}
        />
        <ProfileDeleteButton 
          onDelete={profileManager.deleteProfile} 
          activeProfile={profileManager.activeProfile}
          loading={profileManager.loading}
          iconOnly={true}
        />
      </div>
    );
  };

  const hasValidToolbarElements = () => {
    return profileManager || settingsController || gridApi;
  };

  // Only render if we have at least one valid element to show
  if (!hasValidToolbarElements()) {
    return null;
  }

  return (
    <div className={cn(
      "flex items-center justify-between px-6 py-3",
      "bg-gradient-to-r from-background/95 to-background",
      "border-b border-border/50",
      "backdrop-blur-sm",
      "shadow-sm",
      "animate-in fade-in slide-in-from-top-1 duration-300",
      className
    )}>
      {/* Left Section - Profile Management */}
      <div className="flex items-center">
        {profileManager && renderProfileManagement()}
      </div>

      {/* Center Section - Display Settings */}
      <div className="flex items-center gap-4">
        {settingsController && (
          <>
            {profileManager && <Separator orientation="vertical" className="h-6 mr-2" />}
            <div className="flex items-center gap-2">
              <FontFamilySelector settingsController={settingsController} />
              <FontSizeSelector settingsController={settingsController} />
              <SpacingSelector settingsController={settingsController} />
            </div>
          </>
        )}
      </div>

      {/* Right Section - Grid Settings */}
      <div className="flex items-center gap-2">
        {gridApi && settingsController && (
          <GridSettingsMenu 
            gridApi={gridApi} 
            settingsController={settingsController} 
          />
        )}
      </div>
    </div>
  );
}