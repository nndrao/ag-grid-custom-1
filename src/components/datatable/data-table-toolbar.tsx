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
          gridApi={gridApi}
          profileManager={profileManager}
          settingsController={settingsController}
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
      "bg-gradient-to-r from-muted/40 to-background/80",
      "border-b border-border",
      "backdrop-blur-md",
      "shadow-md",
      "relative",
      "before:absolute before:inset-0",
      "before:bg-gradient-to-r before:from-primary/5 before:to-transparent",
      "before:pointer-events-none",
      "dark:bg-gradient-to-r dark:from-muted/20 dark:to-background/60",
      "animate-in fade-in slide-in-from-top-1 duration-300",
      className
    )}>
      {/* Left Section - Profile Management */}
      <div className="flex items-center relative z-10">
        {profileManager && renderProfileManagement()}
      </div>

      {/* Center Section - Display Settings */}
      <div className="flex items-center gap-4 relative z-10">
        {settingsController && (
          <>
            {profileManager && <Separator orientation="vertical" className="h-6 mr-2 bg-border/50" />}
            <div className="flex items-center gap-2">
              <FontFamilySelector settingsController={settingsController} />
              <FontSizeSelector settingsController={settingsController} />
              <SpacingSelector settingsController={settingsController} />
            </div>
          </>
        )}
      </div>

      {/* Right Section - Grid Settings */}
      <div className="flex items-center gap-2 relative z-10">
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