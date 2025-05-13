import * as React from "react";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";

interface ProfileSaveButtonProps {
  onSave: () => void;
  disabled?: boolean;
}

export function ProfileSaveButton({ onSave, disabled }: ProfileSaveButtonProps) {
  return (
    <Button 
      variant="outline" 
      size="sm"
      onClick={onSave}
      disabled={disabled}
    >
      <Save className="h-4 w-4 mr-2" />
      Save Profile
    </Button>
  );
} 