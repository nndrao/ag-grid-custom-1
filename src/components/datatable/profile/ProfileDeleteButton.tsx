import * as React from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from "@/components/ui/tooltip";

interface ProfileDeleteButtonProps {
  onDelete: () => void;
  disabled?: boolean;
  profileName?: string;
  iconOnly?: boolean;
}

export const ProfileDeleteButton = React.forwardRef<
  HTMLButtonElement,
  ProfileDeleteButtonProps
>(({ onDelete, disabled, profileName, iconOnly = false }, ref) => {
  // Create button element with ref
  const renderButton = () => (
    <Button 
      variant="outline" 
      size={iconOnly ? "icon" : "sm"}
      disabled={disabled}
      className={cn(iconOnly && "h-7 w-7")}
      ref={ref}
    >
      <Trash2 className={cn(iconOnly ? "h-3.5 w-3.5" : "h-4 w-4 mr-2")} />
      {!iconOnly && "Delete"}
    </Button>
  );

  // Wrap with AlertDialog
  const renderTrigger = () => {
    if (iconOnly) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            {renderButton()}
          </TooltipTrigger>
          <TooltipContent side="top">
            Delete Profile
          </TooltipContent>
        </Tooltip>
      );
    }
    
    return renderButton();
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {renderTrigger()}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Profile</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete the profile "{profileName}"? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onDelete}>Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
});

ProfileDeleteButton.displayName = "ProfileDeleteButton"; 