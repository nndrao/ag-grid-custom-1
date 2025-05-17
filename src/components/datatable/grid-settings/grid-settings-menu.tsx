import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Settings, Save, RotateCcw, Columns } from 'lucide-react';
import { GridSettingsDialog } from './grid-settings-dialog';
import { ColumnSettingsDialog } from './column-settings-dialog';
import { GridApi } from 'ag-grid-community';
import { SettingsController } from '@/services/settings-controller';
import { useToast } from '@/components/ui/use-toast';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useProfileManager2 } from '@/hooks/useProfileManager2';
import { DEFAULT_GRID_OPTIONS } from '@/components/datatable/config/default-grid-options';
import { deepClone } from '@/utils/deepClone';

interface GridSettingsMenuProps {
  gridApi: GridApi | null;
  settingsController: SettingsController | null;
}

export function GridSettingsMenu({ gridApi, settingsController }: GridSettingsMenuProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [columnDialogOpen, setColumnDialogOpen] = useState(false);
  const { toast } = useToast();
  
  // We'll use the profile manager to save settings directly
  const profileManager = useProfileManager2(settingsController);

  // Save current grid settings to the active profile
  const saveToProfile = async () => {
    if (!profileManager || !profileManager.activeProfile) {
      toast({
        title: "No Active Profile",
        description: "Please select or create a profile first.",
        variant: "destructive",
      });
      return;
    }

    try {
      await profileManager.saveCurrentProfile();
      
      toast({
        title: "Settings Saved",
        description: `Grid settings saved to profile "${profileManager.activeProfile.name}".`,
        variant: "default",
        className: "bg-green-50 border-green-200",
        duration: 2000,
      });
    } catch (error) {
      toast({
        title: "Error Saving Settings",
        description: "Failed to save settings to profile.",
        variant: "destructive",
      });
    }
  };
  
  // Reset grid settings to profile defaults
  const resetToProfileDefaults = async () => {
    if (!settingsController || !gridApi || !profileManager?.activeProfile) {
      toast({
        title: "No Active Profile",
        description: "Please select or create a profile first.",
        variant: "destructive",
      });
      return;
    }

    try {
      
      // Deep clone the default grid options with our improved deepClone function
      const defaults = deepClone(DEFAULT_GRID_OPTIONS);
      
      // Directly apply the default column definition with cellStyle function
      if (defaults.defaultColDef) {
        gridApi.setGridOption('defaultColDef', defaults.defaultColDef);
      }
      
      // Update the active profile's settings (custom.gridOptions)
      if (profileManager.activeProfile.settings?.custom) {
        profileManager.activeProfile.settings.custom.gridOptions = defaults;
      }
      
      // Apply the defaults to the grid through settings controller
      settingsController.applyProfileSettings({
        ...profileManager.activeProfile.settings,
        custom: {
          ...profileManager.activeProfile.settings.custom,
          gridOptions: defaults
        }
      });
      
      // Force refresh to apply the new styles
      gridApi.refreshCells({ force: true });
      
      // Verify the cellStyle function is still present after all operations
      const currentDefaultColDef = gridApi.getGridOption('defaultColDef');
      
      toast({
        title: "Settings Reset",
        description: `Grid settings reset to profile defaults.`,
        variant: "default",
        duration: 2000,
      });
    } catch (error) {
      toast({
        title: "Error Resetting Settings",
        description: "Failed to reset settings to profile defaults.",
        variant: "destructive",
      });
    }
  };


  return (
    <>
      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Settings className="h-4 w-4" />
                <span className="sr-only">Grid settings</span>
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>Grid Settings</p>
          </TooltipContent>
        </Tooltip>
        
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setDialogOpen(true)}>
            <Settings className="h-4 w-4 mr-2" />
            Edit Grid Settings
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={() => setColumnDialogOpen(true)}>
            <Columns className="h-4 w-4 mr-2" />
            Column Settings
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={saveToProfile} disabled={!profileManager?.activeProfile}>
            <Save className="h-4 w-4 mr-2" />
            Save Settings to Profile
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={resetToProfileDefaults} disabled={!profileManager?.activeProfile}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset to Profile Defaults
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <GridSettingsDialog 
        open={dialogOpen} 
        onOpenChange={setDialogOpen} 
        gridApi={gridApi}
        settingsController={settingsController}
      />
      
      <ColumnSettingsDialog
        open={columnDialogOpen}
        onOpenChange={setColumnDialogOpen}
        gridApi={gridApi}
      />
    </>
  );
} 