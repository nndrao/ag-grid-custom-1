import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ProfileCreateButtonProps {
  onCreate: (name: string) => Promise<any>;
  onSelectProfile?: (profileId: string) => Promise<void>;
  loading?: boolean;
  iconOnly?: boolean;
}

export function ProfileCreateButton({ 
  onCreate,
  onSelectProfile,
  loading = false,
  iconOnly = true 
}: ProfileCreateButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [profileName, setProfileName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  const handleCreate = async () => {
    if (!profileName.trim()) {
      toast({
        title: "Profile name required",
        description: "Please enter a name for the new profile.",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    try {
      const newProfile = await onCreate(profileName.trim());
      toast({
        title: "Profile created",
        description: `Successfully created profile "${profileName}"`,
      });
      setIsOpen(false);
      setProfileName('');
      
      // Automatically switch to the new profile if we have the method
      if (onSelectProfile && newProfile?.id) {
        await onSelectProfile(newProfile.id);
      }
    } catch (error) {
      toast({
        title: "Failed to create profile",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const button = iconOnly ? (
    <Button
      size="icon"
      variant="outline"
      className="h-8 w-8"
      onClick={() => setIsOpen(true)}
      disabled={loading}
    >
      <Plus className="h-4 w-4" />
    </Button>
  ) : (
    <Button
      size="sm"
      variant="outline"
      onClick={() => setIsOpen(true)}
      disabled={loading}
    >
      <Plus className="h-4 w-4 mr-2" />
      New Profile
    </Button>
  );

  return (
    <>
      {iconOnly ? (
        <Tooltip>
          <TooltipTrigger asChild>
            {button}
          </TooltipTrigger>
          <TooltipContent>
            <p>Create new profile</p>
          </TooltipContent>
        </Tooltip>
      ) : (
        button
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Profile</DialogTitle>
            <DialogDescription>
              Enter a name for your new profile. The profile will start with the current settings.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                placeholder="My Profile"
                className="col-span-3"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleCreate();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsOpen(false)}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreate}
              disabled={isCreating || !profileName.trim()}
            >
              {isCreating ? 'Creating...' : 'Create Profile'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}