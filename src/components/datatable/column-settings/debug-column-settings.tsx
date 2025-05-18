import { useState, useEffect } from 'react';
import { ColDef, GridApi } from 'ag-grid-community';
import { SettingsController } from '@/services/settings-controller';

// Debug component to test column loading
export function DebugColumnSettings({ gridApi, settingsController }: { gridApi: GridApi | null; settingsController: SettingsController | null }) {
  const [columnInfo, setColumnInfo] = useState<any>({});
  
  useEffect(() => {
    if (!gridApi) {
      setColumnInfo({ error: 'No grid API' });
      return;
    }
    
    try {
      const gridColumns = gridApi.getColumnDefs() as ColDef[];
      console.log('Grid columns:', gridColumns);
      
      let customSettings = null;
      let savedColumns = null;
      
      if (settingsController) {
        try {
          if (typeof settingsController.getCurrentCustomSettings === 'function') {
            customSettings = settingsController.getCurrentCustomSettings();
            console.log('Custom settings:', customSettings);
            savedColumns = customSettings?.columnDefs;
            console.log('Saved columns:', savedColumns);
          } else {
            console.log('getCurrentCustomSettings method not found');
          }
        } catch (error) {
          console.error('Error getting custom settings:', error);
        }
      }
      
      setColumnInfo({
        gridColumns: gridColumns?.length || 0,
        savedColumns: savedColumns?.length || 0,
        customSettings: !!customSettings,
        hasSettingsController: !!settingsController,
        methodExists: settingsController ? typeof settingsController.getCurrentCustomSettings === 'function' : false
      });
    } catch (error) {
      console.error('Debug error:', error);
      setColumnInfo({ error: error.message });
    }
  }, [gridApi, settingsController]);
  
  return (
    <div style={{ padding: '10px', backgroundColor: '#f0f0f0', border: '1px solid #ccc', marginBottom: '10px' }}>
      <h3>Column Settings Debug</h3>
      <pre>{JSON.stringify(columnInfo, null, 2)}</pre>
    </div>
  );
}