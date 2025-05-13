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

interface ProfileSaveButtonProps {
  onSave: () => Promise<void>;
  disabled?: boolean;
  iconOnly?: boolean;
}

export const ProfileSaveButton = React.forwardRef<
  HTMLButtonElement,
  ProfileSaveButtonProps
>(({ onSave, disabled, iconOnly = false }, ref) => {
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setSaveSuccess(false);
      await onSave();
      
      // Show success state briefly
      setSaveSuccess(true);
      
      // Reset success state after showing feedback
      setTimeout(() => {
        setSaveSuccess(false);
      }, 2000);
    } catch (error) {
      // Error handling is done in the parent component
      console.error("Error in save button:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // Create button element with ref
  const renderButton = () => (
    <Button 
      variant={saveSuccess ? "secondary" : "outline"}
      size={iconOnly ? "icon" : "sm"}
      onClick={handleSave}
      disabled={disabled || isSaving}
      ref={ref}
      className={cn(
        iconOnly && "h-7 w-7",
        saveSuccess && !iconOnly && "bg-green-100 border-green-300 text-green-800 hover:bg-green-200",
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
          {renderButton()}
        </TooltipTrigger>
        <TooltipContent side="top">
          {isSaving ? "Saving..." : saveSuccess ? "Saved!" : "Save Profile"}
        </TooltipContent>
      </Tooltip>
    );
  }

  return renderButton();
});

ProfileSaveButton.displayName = "ProfileSaveButton"; 