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

export function ProfileSaveButton({ onSave, disabled, iconOnly = false }: ProfileSaveButtonProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setSaveSuccess(false);
      await onSave();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (error) {
      console.error("Error in save button:", error);
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