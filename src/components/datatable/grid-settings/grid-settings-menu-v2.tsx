import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Settings, Save, RotateCcw, Columns } from 'lucide-react';
import { GridSettingsDialog } from './grid-settings-dialog';
import { ColumnSettingsDialogV2 } from '../column-settings/ColumnSettingsDialog-v2';
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

export function GridSettingsMenuV2({ gridApi, settingsController }: GridSettingsMenuProps) {
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
        title: "Save Failed",
        description: "Failed to save grid settings. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Reset grid settings to defaults
  const resetGridSettings = () => {
    if (!gridApi || !settingsController) {
      toast({
        title: "Reset Failed",
        description: "Grid is not ready. Please try again.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Reset grid options to defaults
      const defaultOptions = deepClone(DEFAULT_GRID_OPTIONS);
      
      // Apply default options
      Object.keys(defaultOptions).forEach(key => {
        if (key !== 'columnDefs') {
          gridApi.setGridOption(key as any, defaultOptions[key]);
        }
      });
      
      // Reset toolbar settings
      settingsController.resetToDefaults();
      
      // Refresh the grid
      gridApi.refreshCells({ force: true });
      gridApi.refreshHeader();
      
      toast({
        title: "Settings Reset",
        description: "Grid settings have been reset to defaults.",
        variant: "default",
        className: "bg-blue-50 border-blue-200",
        duration: 2000,
      });
    } catch (error) {
      toast({
        title: "Reset Failed",
        description: "Failed to reset grid settings. Please try again.",
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
          
          <DropdownMenuItem onClick={resetGridSettings}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset to Defaults
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      <GridSettingsDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        gridApi={gridApi}
        settingsController={settingsController}
        profileManager={profileManager}
      />
      
      <ColumnSettingsDialogV2
        open={columnDialogOpen}
        onOpenChange={setColumnDialogOpen}
        gridApi={gridApi}
        settingsController={settingsController}
        profileManager={profileManager}
      />
    </>
  );
}