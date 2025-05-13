import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Profile } from "@/types/profile.types";
import { cn } from "@/lib/utils";
import { User } from "lucide-react";

interface ProfileSelectorProps {
  profiles: Profile[];
  activeProfile: Profile | null;
  onSelectProfile: (profileId: string) => void;
  compact?: boolean;
}

export const ProfileSelector = React.forwardRef<
  HTMLDivElement,
  ProfileSelectorProps
>(({ 
  profiles, 
  activeProfile, 
  onSelectProfile,
  compact = false
}, ref) => {
  return (
    <div className="flex items-center gap-1" ref={ref}>
      {!compact && <span className="text-sm text-muted-foreground">Profile:</span>}
      <Select 
        value={activeProfile?.id || ""}
        onValueChange={onSelectProfile}
      >
        <SelectTrigger className={cn(
          compact ? "w-[130px] h-8 text-xs" : "w-[180px]",
          "flex gap-1"
        )}>
          {compact && <User className="h-3.5 w-3.5 opacity-70" />}
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
});

ProfileSelector.displayName = "ProfileSelector"; 