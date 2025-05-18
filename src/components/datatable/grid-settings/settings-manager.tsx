import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Settings2 } from 'lucide-react';
import { GridApi } from 'ag-grid-community';
import { SettingsController } from '@/services/settings-controller';
import { ColumnSettingsDialog } from '../column-settings/ColumnSettingsDialog';

type SettingsDialogType = 
  | 'column'
  | 'filter'
  | 'theme'
  | 'export'
  | 'sort'
  | 'toolbar';

interface SettingsManagerProps {
  gridApi: GridApi | null;
  settingsController: SettingsController | null;
}

/**
 * Settings Manager component
 * Provides access to various settings dialogs
 */
export function SettingsManager({ gridApi, settingsController }: SettingsManagerProps) {
  const [activeDialog, setActiveDialog] = useState<SettingsDialogType | null>(null);
  
  // Handle opening a dialog
  const openDialog = (dialog: SettingsDialogType) => {
    setActiveDialog(dialog);
  };
  
  // Handle closing the active dialog
  const closeDialog = () => {
    setActiveDialog(null);
  };
  
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon">
            <Settings2 className="h-4 w-4" />
            <span className="sr-only">Open settings</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Grid Settings</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => openDialog('column')}>
            Column Settings
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => openDialog('filter')}>
            Filter Settings
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => openDialog('sort')}>
            Sorting & Grouping
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Display Settings</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => openDialog('theme')}>
            Theme Settings
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => openDialog('toolbar')}>
            Toolbar Settings
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Other Settings</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => openDialog('export')}>
            Export Settings
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Individual settings dialogs */}
      <ColumnSettingsDialog
        open={activeDialog === 'column'}
        onOpenChange={(open) => !open && closeDialog()}
        gridApi={gridApi}
      />
      
      {/* Additional dialogs will be added here */}
      {/* For example:
      <FilterSettingsDialog
        open={activeDialog === 'filter'}
        onOpenChange={(open) => !open && closeDialog()}
        gridApi={gridApi}
      />
      */}
    </>
  );
} 