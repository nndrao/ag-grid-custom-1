import * as React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";
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
  TooltipTrigger,
  TooltipProvider
} from "@/components/ui/tooltip";
import { useToast } from "@/components/ui/use-toast";

interface ProfileDeleteButtonProps {
  onDelete: () => void;
  disabled?: boolean;
  profileName?: string;
  iconOnly?: boolean;
}

export function ProfileDeleteButton({ onDelete, disabled, profileName, iconOnly = false }: ProfileDeleteButtonProps) {
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const [open, setOpen] = useState(false);
  
  const handleDelete = async () => {
    setIsDeleting(true);
    
    toast({
      title: "Deleting profile...",
      description: `Removing ${profileName}`,
      duration: 2000,
    });
    
    try {
      await onDelete();
      
      toast({
        title: "Profile deleted",
        description: `Successfully deleted ${profileName}`,
        duration: 3000,
      });
      
      setOpen(false);
    } catch (error) {
      toast({
        title: "Failed to delete profile",
        description: "There was an error deleting the profile. Please try again.",
        variant: "destructive",
        duration: 4000,
      });
    } finally {
      setIsDeleting(false);
    }
  };
  
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <AlertDialogTrigger asChild>
            <Button 
              variant="outline" 
              size={iconOnly ? "icon" : "sm"}
              disabled={disabled || isDeleting}
              className={cn(
                iconOnly && "h-8 w-8",
                !iconOnly && "h-8",
                "border-border/60 bg-background/95 hover:bg-red-50 hover:text-destructive hover:border-red-300 shadow-sm transition-all",
                isDeleting && "opacity-60"
              )}
            >
              {isDeleting ? (
                <Loader2 className={cn("animate-spin", iconOnly ? "h-3.5 w-3.5" : "h-4 w-4 mr-2")} />
              ) : (
                <Trash2 className={cn(iconOnly ? "h-3.5 w-3.5" : "h-4 w-4 mr-2")} />
              )}
              {!iconOnly && (isDeleting ? "Deleting..." : "Delete")}
            </Button>
          </AlertDialogTrigger>
        </TooltipTrigger>
        <TooltipContent side="top" sideOffset={8}>
          {isDeleting ? "Deleting..." : "Delete Profile"}
        </TooltipContent>
      </Tooltip>
      <AlertDialogContent>
        <TooltipProvider>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Profile</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the profile "{profileName}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              disabled={isDeleting}
              className={cn(isDeleting && "opacity-60")}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </TooltipProvider>
      </AlertDialogContent>
    </AlertDialog>
  );
} 