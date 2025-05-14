import * as React from "react";
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ProfileSelector } from "./ProfileSelector";
import { ProfileSaveButton } from "./ProfileSaveButton";
import { ProfileDeleteButton } from "./ProfileDeleteButton";
import { ProfileManager } from "./ProfileManager";
import { Profile } from "@/types/profile.types";

interface ProfileButtonGroupProps {
  profiles: Profile[];
  activeProfile: Profile | null;
  onSelectProfile: (profileId: string) => void;
  onSave: () => Promise<void>;
  onDelete: () => void;
  onCreate: (name: string) => Promise<void>;
}

export function ProfileButtonGroup({
  profiles,
  activeProfile,
  onSelectProfile,
  onSave,
  onDelete,
  onCreate
}: ProfileButtonGroupProps) {
  return (
    <TooltipProvider delayDuration={100}>
      <div className="flex items-center gap-1.5 bg-muted/60 rounded-md p-1 shadow-sm border border-border/30">
        <ProfileSelector 
          profiles={profiles}
          activeProfile={activeProfile}
          onSelectProfile={onSelectProfile}
          compact
        />
        <div className="h-6 border-l border-border/50 mx-0.5"></div>
        <div className="flex items-center gap-1 px-0.5">
          <ProfileSaveButton 
            onSave={onSave}
            disabled={!activeProfile}
            iconOnly
          />
          <ProfileDeleteButton 
            onDelete={onDelete}
            disabled={!activeProfile}
            profileName={activeProfile?.name}
            iconOnly
          />
          <ProfileManager 
            onCreate={onCreate}
            iconOnly
          />
        </div>
      </div>
    </TooltipProvider>
  );
} 