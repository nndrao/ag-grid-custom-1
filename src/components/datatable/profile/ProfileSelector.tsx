import * as React from "react";
import { useState, useEffect, useCallback } from "react";
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
import { useInstantProfileSwitch } from "@/hooks/useOptimizedProfileSwitch";

interface ProfileSelectorProps {
  profiles: Profile[];
  activeProfile: Profile | null;
  onSelectProfile: (profileId: string) => void;
  loading?: boolean;
  compact?: boolean;
  gridApi?: any;
  profileManager?: any;
  settingsController?: any;
}

export function ProfileSelector({ 
  profiles, 
  activeProfile, 
  onSelectProfile,
  loading = false,
  compact = false,
  gridApi,
  profileManager,
  settingsController
}: ProfileSelectorProps) {
  const { toast } = useToast();
  const [isChanging, setIsChanging] = useState(false);
  
  // Use optimized profile switching if dependencies are available
  const { instantSwitch, preloadProfile } = useInstantProfileSwitch(
    gridApi,
    profileManager,
    settingsController
  );
  
  // Preload profiles on mount for instant switching
  useEffect(() => {
    // Ensure profileManager has the right interface (array of profiles)
    if (profileManager && profiles && profiles.length > 0) {
      // Only preload if we have the optimized interface available
      if (preloadProfile) {
        // Preload all profiles in the background
        profiles.forEach((profile, index) => {
          setTimeout(() => preloadProfile(profile.id), index * 100);
        });
      }
    }
  }, [profiles, profileManager, preloadProfile]);
  
  const handleProfileChange = useCallback(async (profileId: string) => {
    setIsChanging(true);
    
    const selectedProfile = profiles.find(p => p.id === profileId);
    const profileName = selectedProfile?.name || 'profile';
    
    try {
      if (gridApi && profileManager && settingsController) {
        // Use optimized switching
        const result = await instantSwitch(profileId);
        
        if (result.success) {
          // Call the original callback for any additional logic
          await onSelectProfile(profileId);
        } else {
          throw new Error('Profile switch failed');
        }
      } else {
        // Fallback to standard switching
        toast({
          title: "Loading profile...",
          description: `Switching to ${profileName}`,
          duration: 2000,
        });
        
        await onSelectProfile(profileId);
        
        toast({
          title: "Profile loaded",
          description: `Successfully switched to ${profileName}`,
          duration: 3000,
        });
      }
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
  }, [gridApi, profileManager, settingsController, instantSwitch, onSelectProfile, profiles, toast]);
  
  return (
    <Select 
      value={activeProfile?.id || ""}
      onValueChange={handleProfileChange}
      disabled={loading || isChanging}
    >
      <SelectTrigger className={cn(
        compact ? "w-[130px] h-8 text-xs" : "w-[180px] h-8 text-xs",
        "flex items-center gap-2",
        "border-border/60",
        "bg-background/95",
        "hover:bg-background hover:border-border",
        "shadow-sm",
        "transition-all",
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