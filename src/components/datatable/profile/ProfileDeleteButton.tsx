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

export function ProfileDeleteButton({ onDelete, disabled, profileName, iconOnly = false }: ProfileDeleteButtonProps) {
  return (
    <AlertDialog>
      <Tooltip>
        <TooltipTrigger asChild>
          <AlertDialogTrigger asChild>
            <Button 
              variant="outline" 
              size={iconOnly ? "icon" : "sm"}
              disabled={disabled}
              className={cn(iconOnly && "h-7 w-7")}
            >
              <Trash2 className={cn(iconOnly ? "h-3.5 w-3.5" : "h-4 w-4 mr-2")} />
              {!iconOnly && "Delete"}
            </Button>
          </AlertDialogTrigger>
        </TooltipTrigger>
        <TooltipContent side="top" sideOffset={8}>
          Delete Profile
        </TooltipContent>
      </Tooltip>
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
} 