import * as React from "react";
import { Button } from "@/components/ui/button";
import { Save, Check, Loader2 } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { 
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from "@/components/ui/tooltip";
import { useToast } from "@/components/ui/use-toast";

interface ProfileSaveButtonProps {
  onSave: () => Promise<void>;
  disabled?: boolean;
  iconOnly?: boolean;
}

export function ProfileSaveButton({ onSave, disabled, iconOnly = false }: ProfileSaveButtonProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setSaveSuccess(false);
      
      // Show loading toast
      toast({
        title: "Saving profile...",
        description: "Please wait while we save your settings",
        duration: 2000,
      });
      
      await onSave();
      
      setSaveSuccess(true);
      
      // Show success toast
      toast({
        title: "Profile saved successfully",
        description: "Your grid settings have been saved",
        duration: 3000,
      });
      
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (error) {
      // Show error toast
      toast({
        title: "Failed to save profile",
        description: "There was an error saving your settings. Please try again.",
        variant: "destructive",
        duration: 4000,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const button = (
    <Button 
      variant={saveSuccess ? "secondary" : "outline"}
      size={iconOnly ? "icon" : "sm"}
      onClick={handleSave}
      disabled={disabled || isSaving}
      className={cn(
        iconOnly && "h-8 w-8",
        !iconOnly && "h-8",
        "border-border/60 bg-background/95 hover:bg-background hover:border-border shadow-sm transition-all",
        saveSuccess && !iconOnly && "bg-green-50 border-green-300 text-green-700 hover:bg-green-100",
        saveSuccess && iconOnly && "text-green-600 border-green-300 bg-green-50 hover:bg-green-100"
      )}
    >
      {isSaving ? (
        <Loader2 className={cn("animate-spin", iconOnly ? "h-3.5 w-3.5" : "h-4 w-4 mr-2")} />
      ) : saveSuccess ? (
        <Check className={cn(iconOnly ? "h-3.5 w-3.5" : "h-4 w-4 mr-2")} />
      ) : (
        <Save className={cn(iconOnly ? "h-3.5 w-3.5" : "h-4 w-4 mr-2")} />
      )}
      {!iconOnly && (isSaving ? "Saving..." : saveSuccess ? "Saved!" : "Save Profile")}
    </Button>
  );

  if (iconOnly) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          {button}
        </TooltipTrigger>
        <TooltipContent side="top" sideOffset={8}>
          {isSaving ? "Saving..." : saveSuccess ? "Saved!" : "Save Profile"}
        </TooltipContent>
      </Tooltip>
    );
  }

  return button;
} 