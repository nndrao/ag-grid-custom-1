import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useGridSettings, useToolbarSettings, useColumnSettings } from '@/hooks/useGridSettings';
import { ColumnSettingsDialog } from './grid-settings/column-settings-dialog';
import { SettingsStore } from '@/stores/settings-store';

/**
 * Test component for the new settings architecture
 * This can be used independently to verify the new implementation
 */
export function TestNewSettings() {
  const [open, setOpen] = useState(false);
  const [toolbarSettings, updateToolbarSettings] = useToolbarSettings();
  const [columnSettings, updateColumnSettings] = useColumnSettings();
  
  // Display current settings in component
  return (
    <div className="p-4 border rounded-md">
      <h2 className="text-lg font-bold mb-4">Test New Settings Architecture</h2>
      
      <div className="mb-4">
        <h3 className="font-medium mb-2">Current Toolbar Settings</h3>
        <pre className="bg-gray-100 p-2 rounded">
          {JSON.stringify(toolbarSettings, null, 2)}
        </pre>
        
        <div className="flex gap-2 mt-2">
          <Button 
            size="sm"
            onClick={() => updateToolbarSettings({ fontSize: (toolbarSettings.fontSize || 12) + 1 })}
          >
            Increase Font Size
          </Button>
          <Button 
            size="sm"
            onClick={() => updateToolbarSettings({ fontSize: Math.max(6, (toolbarSettings.fontSize || 12) - 1) })}
          >
            Decrease Font Size
          </Button>
        </div>
      </div>
      
      <div className="mb-4">
        <h3 className="font-medium mb-2">Current Column Settings</h3>
        <pre className="bg-gray-100 p-2 rounded">
          {JSON.stringify(columnSettings, null, 2)}
        </pre>
      </div>
      
      <Button onClick={() => setOpen(true)}>
        Open Column Settings Dialog
      </Button>
      
      <ColumnSettingsDialog
        open={open}
        onOpenChange={setOpen}
        gridApi={null}
      />
    </div>
  );
} 