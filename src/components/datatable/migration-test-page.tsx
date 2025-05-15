import React, { useEffect, useRef } from 'react';
import { SettingsController } from '@/services/settings-controller';
import { GridStateProvider } from '@/services/gridStateProvider';
import { SettingsStore } from '@/stores/settings-store';
import { TestNewSettings } from './test-new-settings';
import { useProfileManager2 } from '@/hooks/useProfileManager2';
import { Button } from '@/components/ui/button';

/**
 * A standalone test page for the new settings architecture
 * This allows testing without modifying the main application
 */
export function MigrationTestPage() {
  const gridStateProvider = useRef(new GridStateProvider());
  const settingsControllerRef = useRef<SettingsController | null>(null);

  // Initialize settings controller once
  useEffect(() => {
    if (!settingsControllerRef.current) {
      settingsControllerRef.current = new SettingsController(gridStateProvider.current);
    }
  }, []);

  // Use the new profile manager hook
  const profileManager = useProfileManager2(settingsControllerRef.current);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="bg-white p-4 rounded-md shadow-md mb-6">
        <h1 className="text-2xl font-bold mb-4">Settings Architecture Migration Test</h1>
        <p className="mb-4">
          This page allows testing the new settings architecture without modifying the main application.
        </p>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <h2 className="text-lg font-semibold mb-2">Profile Management</h2>
            <div className="space-y-2">
              <p><strong>Active Profile:</strong> {profileManager.activeProfile?.name || 'None'}</p>
              <p><strong>Loading:</strong> {profileManager.loading ? 'Yes' : 'No'}</p>
              <p><strong>Profile Count:</strong> {profileManager.profiles.length}</p>
              
              <div className="flex flex-wrap gap-2 mt-2">
                <Button 
                  size="sm" 
                  onClick={() => profileManager.createProfile('New Test Profile')}
                >
                  Create Profile
                </Button>
                
                {profileManager.profiles.map(profile => (
                  <div key={profile.id} className="flex gap-2 items-center">
                    <Button
                      size="sm"
                      variant={profileManager.activeProfile?.id === profile.id ? "default" : "outline"}
                      onClick={() => profileManager.selectProfile(profile.id)}
                    >
                      {profile.name}
                    </Button>
                    
                    {!profile.isDefault && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => profileManager.deleteProfile(profile.id)}
                      >
                        Delete
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div>
            <h2 className="text-lg font-semibold mb-2">Settings Store</h2>
            <p>The SettingsStore is a singleton that holds all settings:</p>
            <div className="mt-2">
              <Button
                size="sm"
                onClick={() => {
                  // Reset settings to defaults
                  SettingsStore.getInstance().resetToDefaults();
                }}
              >
                Reset Settings
              </Button>
            </div>
          </div>
        </div>
        
        <TestNewSettings />
      </div>
    </div>
  );
} 