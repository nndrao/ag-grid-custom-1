import React from 'react';
import { ThemeToggle } from './theme/theme-toggle';
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
      <>
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
        />
        <ProfileDeleteButton 
          onDelete={profileManager.deleteProfile} 
          activeProfile={profileManager.activeProfile}
          loading={profileManager.loading}
        />
      </>
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
    <div className={`flex items-center gap-3 p-4 ${className}`}>
      {/* Profile Management */}
      <div className="flex items-center gap-2">
        {renderProfileManagement()}
      </div>

      {/* Toolbar Settings */}
      {settingsController && (
        <div className="flex items-center gap-2">
          <FontFamilySelector settingsController={settingsController} />
          <FontSizeSelector settingsController={settingsController} />
          <SpacingSelector settingsController={settingsController} />
        </div>
      )}

      {/* Grid Settings */}
      {gridApi && settingsController && (
        <div className="ml-auto flex items-center gap-2">
          <GridSettingsMenu 
            gridApi={gridApi} 
            settingsController={settingsController} 
          />
          <ThemeToggle />
        </div>
      )}
    </div>
  );
}