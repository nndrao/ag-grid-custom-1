import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Profile } from "@/types/profile.types";
import { cn } from "@/lib/utils";
import { User } from "lucide-react";

interface ProfileSelectorProps {
  profiles: Profile[];
  activeProfile: Profile | null;
  onSelectProfile: (profileId: string) => void;
  compact?: boolean;
}

export function ProfileSelector({ 
  profiles, 
  activeProfile, 
  onSelectProfile,
  compact = false
}: ProfileSelectorProps) {
  return (
    <Select 
      value={activeProfile?.id || ""}
      onValueChange={onSelectProfile}
    >
      <SelectTrigger className={cn(
        compact ? "w-[130px] h-8 text-xs" : "w-[180px] h-8 text-xs",
        "flex items-center gap-2",
        "border-border/50",
        "bg-background/50",
        "hover:bg-accent/50",
        "transition-colors"
      )}>
        <User className="h-3.5 w-3.5 text-muted-foreground" />
        <SelectValue placeholder="Select profile" />
      </SelectTrigger>
      <SelectContent className="max-h-[300px]">
        {profiles.map((profile) => (
          <SelectItem 
            key={profile.id} 
            value={profile.id}
            className="flex items-center justify-between"
          >
            <span>{profile.name}</span>
            {profile.isDefault && (
              <Badge variant="outline" className="ml-2 text-xs px-1.5 py-0">
                Default
              </Badge>
            )}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
} 