import React, { useState, useCallback } from 'react';
import { Check, ChevronsUpDown, Plus, Save, Settings, Loader2 } from 'lucide-react';
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
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useProfile } from '../contexts/profile-context';
import { ProfileManager } from './profile-manager';
import { useCurrentFont } from '../contexts/current-font-context';

export const ProfileSelector: React.FC = () => {
  const { 
    profiles, 
    currentProfileId, 
    saveNewProfile, 
    updateCurrentProfile, 
    loadProfile, 
    getActiveProfile 
  } = useProfile();
  const { currentGridFont } = useCurrentFont();

  const [newProfileName, setNewProfileName] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [manageDialogOpen, setManageDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const activeProfile = getActiveProfile();

  const handleCreateProfile = useCallback(async () => {
    if (!newProfileName.trim()) return;
    setIsLoading(true);
    try {
      await saveNewProfile(newProfileName.trim(), currentGridFont);
      setNewProfileName('');
      setCreateDialogOpen(false);
    } catch (error) {
      console.error("Error creating profile:", error);
      // TODO: Show error to user
    }
    setIsLoading(false);
  }, [newProfileName, currentGridFont, saveNewProfile]);

  const handleUpdateCurrent = useCallback(async () => {
    if (!currentProfileId) return;
    setIsLoading(true);
    try {
      await updateCurrentProfile(currentGridFont);
      // TODO: Show success feedback to user
    } catch (error) {
      console.error("Error updating profile:", error);
      // TODO: Show error to user
    }
    setIsLoading(false);
  }, [currentProfileId, currentGridFont, updateCurrentProfile]);

  const handleSelectProfile = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      await loadProfile(id);
    } catch (error) {
      console.error("Error loading profile:", error);
      // TODO: Show error to user
    }
    setIsLoading(false);
  }, [loadProfile]);

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-[200px] justify-between shrink-0" disabled={isLoading}>
            <span className="truncate">{activeProfile ? activeProfile.name : 'Select Profile'}</span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[200px]">
          <DropdownMenuLabel>Available Profiles</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {profiles.length === 0 ? (
            <DropdownMenuItem disabled>No profiles saved</DropdownMenuItem>
          ) : (
            profiles.map((profile) => (
              <DropdownMenuItem
                key={profile.id}
                onClick={() => handleSelectProfile(profile.id)}
                disabled={isLoading}
              >
                <span className="truncate flex-grow">{profile.name}</span>
                {profile.id === currentProfileId && (
                  <Check className="ml-2 h-4 w-4 shrink-0" />
                )}
              </DropdownMenuItem>
            ))
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <Button
        variant="outline"
        size="icon"
        onClick={handleUpdateCurrent}
        disabled={!currentProfileId || isLoading}
        title="Save current profile state"
      >
        {isLoading && !currentProfileId ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
      </Button>

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="icon" title="Create new profile" disabled={isLoading}>
            <Plus className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Profile</DialogTitle>
            <DialogDescription>
              Save the current grid layout and settings as a new profile.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new-profile-name" className="text-right">
                Name
              </Label>
              <Input
                id="new-profile-name"
                value={newProfileName}
                onChange={(e) => setNewProfileName(e.target.value)}
                className="col-span-3"
                placeholder="e.g., My Default View"
                disabled={isLoading}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isLoading}>Cancel</Button>
            </DialogClose>
            <Button type="submit" onClick={handleCreateProfile} disabled={isLoading || !newProfileName.trim()}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Create Profile
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={manageDialogOpen} onOpenChange={setManageDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="icon" title="Manage profiles" disabled={isLoading}>
            <Settings className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Manage Profiles</DialogTitle>
            <DialogDescription>
              Rename or delete your saved grid profiles.
            </DialogDescription>
          </DialogHeader>
          <ProfileManager onClose={() => setManageDialogOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}; 