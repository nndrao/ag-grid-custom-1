import * as React from "react";
import { useState, useEffect } from "react";
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
import { User, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface ProfileSelectorProps {
  profiles: Profile[];
  activeProfile: Profile | null;
  onSelectProfile: (profileId: string) => void;
  loading?: boolean;
  compact?: boolean;
}

export function ProfileSelector({ 
  profiles, 
  activeProfile, 
  onSelectProfile,
  loading = false,
  compact = false
}: ProfileSelectorProps) {
  const { toast } = useToast();
  const [isChanging, setIsChanging] = useState(false);
  
  const handleProfileChange = async (profileId: string) => {
    setIsChanging(true);
    
    const selectedProfile = profiles.find(p => p.id === profileId);
    const profileName = selectedProfile?.name || 'profile';
    
    toast({
      title: "Loading profile...",
      description: `Switching to ${profileName}`,
      duration: 2000,
    });
    
    try {
      await onSelectProfile(profileId);
      
      toast({
        title: "Profile loaded",
        description: `Successfully switched to ${profileName}`,
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Failed to load profile",
        description: "There was an error loading the profile. Please try again.",
        variant: "destructive",
        duration: 4000,
      });
    } finally {
      setIsChanging(false);
    }
  };
  
  return (
    <Select 
      value={activeProfile?.id || ""}
      onValueChange={handleProfileChange}
      disabled={loading || isChanging}
    >
      <SelectTrigger className={cn(
        compact ? "w-[130px] h-8 text-xs" : "w-[180px] h-8 text-xs",
        "flex items-center gap-2",
        "border-border/50",
        "bg-background/50",
        "hover:bg-accent/50",
        "transition-colors",
        (loading || isChanging) && "opacity-60"
      )}>
        {loading || isChanging ? (
          <Loader2 className="h-3.5 w-3.5 text-muted-foreground animate-spin" />
        ) : (
          <User className="h-3.5 w-3.5 text-muted-foreground" />
        )}
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