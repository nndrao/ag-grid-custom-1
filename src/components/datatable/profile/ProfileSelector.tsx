import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Profile } from "@/types/profile.types";

interface ProfileSelectorProps {
  profiles: Profile[];
  activeProfile: Profile | null;
  onSelectProfile: (profileId: string) => void;
}

export function ProfileSelector({ profiles, activeProfile, onSelectProfile }: ProfileSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">Profile:</span>
      <Select 
        value={activeProfile?.id || ""}
        onValueChange={onSelectProfile}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select profile" />
        </SelectTrigger>
        <SelectContent>
          {profiles.map((profile) => (
            <SelectItem key={profile.id} value={profile.id}>
              {profile.name}{profile.isDefault ? ' (Default)' : ''}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
} 