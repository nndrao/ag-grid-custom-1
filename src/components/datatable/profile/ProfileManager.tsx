import * as React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { 
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from "@/components/ui/tooltip";

interface ProfileManagerProps {
  onCreate: (name: string) => Promise<void>;
  iconOnly?: boolean;
}

export function ProfileManager({ onCreate, iconOnly = false }: ProfileManagerProps) {
  const [open, setOpen] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (!profileName.trim()) return;
    
    setCreating(true);
    try {
      await onCreate(profileName);
      setOpen(false);
      setProfileName("");
    } catch (error) {
      console.error('Error creating profile:', error);
    } finally {
      setCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <DialogTrigger asChild>
            <Button 
              variant="outline" 
              size={iconOnly ? "icon" : "sm"}
              className={cn(iconOnly && "h-7 w-7")}
            >
              <Plus className={cn(iconOnly ? "h-3.5 w-3.5" : "h-4 w-4 mr-2")} />
              {!iconOnly && "New Profile"}
            </Button>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent side="top">
          Create New Profile
        </TooltipContent>
      </Tooltip>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Profile</DialogTitle>
          <DialogDescription>
            Create a new profile to save your current grid and toolbar settings.
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
              className="col-span-3"
              placeholder="My Profile"
            />
          </div>
        </div>
        <DialogFooter>
          <Button 
            type="submit" 
            onClick={handleCreate}
            disabled={!profileName.trim() || creating}
          >
            {creating ? "Creating..." : "Create Profile"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 