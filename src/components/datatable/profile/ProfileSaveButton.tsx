import * as React from "react";
import { Button } from "@/components/ui/button";
import { Save, Check, Loader2 } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface ProfileSaveButtonProps {
  onSave: () => Promise<void>;
  disabled?: boolean;
}

export function ProfileSaveButton({ onSave, disabled }: ProfileSaveButtonProps) {
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

  return (
    <Button 
      variant={saveSuccess ? "secondary" : "outline"}
      size="sm"
      onClick={handleSave}
      disabled={disabled || isSaving}
      className={cn(
        saveSuccess && "bg-green-100 border-green-300 text-green-800 hover:bg-green-200"
      )}
    >
      {isSaving ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : saveSuccess ? (
        <Check className="h-4 w-4 mr-2" />
      ) : (
        <Save className="h-4 w-4 mr-2" />
      )}
      {isSaving ? "Saving..." : saveSuccess ? "Saved!" : "Save Profile"}
    </Button>
  );
} 