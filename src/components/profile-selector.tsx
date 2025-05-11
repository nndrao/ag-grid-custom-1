import { useState, useCallback } from 'react';
import { Check, ChevronsUpDown, Plus, Save, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useProfile } from '@/contexts/profile-context';
import { ProfileManager } from './profile-manager';
import React from 'react';

export const ProfileSelector = React.memo(function ProfileSelector() {
  const { profiles, currentProfileId, saveProfile, updateProfile, loadProfile } = useProfile();
  const [newProfileName, setNewProfileName] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [manageDialogOpen, setManageDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Only use profiles from context
  const displayProfiles = profiles;

  const currentProfile = displayProfiles.find(p => p.id === currentProfileId);

  // Create new profile
  const handleCreateProfile = useCallback(async () => {
    if (!newProfileName.trim()) {
      return;
    }
    setLoading(true);
    try {
      await saveProfile(newProfileName);
      setNewProfileName('');
      setCreateDialogOpen(false);
    } finally {
      setLoading(false);
    }
  }, [newProfileName, saveProfile]);

  // Update current profile
  const handleUpdateProfile = useCallback(async () => {
    if (!currentProfileId) return;
    setLoading(true);
    try {
      await updateProfile();
    } finally {
      setLoading(false);
    }
  }, [currentProfileId, updateProfile]);

  // Select profile
  const handleSelectProfile = useCallback(async (id: string) => {
    setLoading(true);
    try {
      await loadProfile(id);
    } finally {
      setLoading(false);
    }
  }, [loadProfile]);

  return (
    <div className="flex items-center gap-2">
      {/* Profile Selector Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-[200px] justify-between">
            {currentProfile ? currentProfile.name : 'Select profile'}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[200px]">
          <DropdownMenuLabel>Profiles</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {displayProfiles.length === 0 ? (
            <DropdownMenuItem disabled>No profiles saved</DropdownMenuItem>
          ) : (
            displayProfiles.map((profile) => (
              <DropdownMenuItem
                key={profile.id}
                onClick={() => handleSelectProfile(profile.id)}
                className="flex justify-between"
              >
                {profile.name}
                {profile.id === currentProfileId && (
                  <Check className="h-4 w-4" />
                )}
              </DropdownMenuItem>
            ))
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Update (Save) Current Profile Button */}
      <Button
        variant="outline"
        size="icon"
        onClick={handleUpdateProfile}
        disabled={!currentProfileId || loading}
        title="Save current profile"
      >
        <Save className="h-4 w-4" />
      </Button>

      {/* Create New Profile Button */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="icon" title="Create new profile" disabled={loading}>
            <Plus className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>New Profile</DialogTitle>
            <DialogDescription>
              Enter a name for your new profile.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="profile-name" className="text-right">
                Name
              </Label>
              <Input
                id="profile-name"
                value={newProfileName}
                onChange={(e) => setNewProfileName(e.target.value)}
                className="col-span-3"
                placeholder="My Profile"
                disabled={loading}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleCreateProfile} disabled={loading}>
              {loading ? 'Creating...' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manage Profiles Dialog */}
      <Dialog open={manageDialogOpen} onOpenChange={setManageDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="icon" disabled={loading}>
            <Settings className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Manage Profiles</DialogTitle>
            <DialogDescription>
              Rename or delete your saved grid profiles.
            </DialogDescription>
          </DialogHeader>
          <ProfileManager onClose={() => setManageDialogOpen(false)} />
        </DialogContent>
      </Dialog>
      {loading && (
        <span className="ml-2 text-xs text-muted-foreground">Loading...</span>
      )}
    </div>
  );
});
