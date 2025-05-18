import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ColumnSettingsDialog } from './ColumnSettingsDialog';
import { GridApi, ColDef } from 'ag-grid-community';

// Mock grid API for testing
const mockGridApi: Partial<GridApi> = {
  getColumnDefs: () => [
    {
      field: 'name',
      headerName: 'Name',
      filter: 'agTextColumnFilter'
    },
    {
      field: 'age',
      headerName: 'Age',
      filter: 'agNumberColumnFilter'
    },
    {
      field: 'email',
      headerName: 'Email',
      filter: 'agTextColumnFilter'
    }
  ],
  setGridOption: (property, value) => {
    console.log('Setting grid option:', property, value);
  },
  refreshCells: (params) => {
    console.log('Refreshing cells:', params);
  }
} as any;

export function ColumnSettingsTestPage() {
  const [open, setOpen] = useState(false);
  const [selectedColumn] = useState<ColDef>({
    field: 'name',
    headerName: 'Name'
  });

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Column Settings Dialog Test</h1>
      
      <Button onClick={() => setOpen(true)}>
        Open Column Settings
      </Button>

      <ColumnSettingsDialog
        open={open}
        onOpenChange={setOpen}
        gridApi={mockGridApi as GridApi}
        column={selectedColumn}
      />

      <div className="mt-8 p-4 bg-gray-100 rounded">
        <h2 className="text-lg font-semibold mb-2">Test Instructions:</h2>
        <ul className="list-disc list-inside space-y-1">
          <li>Click "Open Column Settings" to test the dialog</li>
          <li>The dialog should show with the Header tab active</li>
          <li>You should be able to modify header text, font settings, colors, and borders</li>
          <li>Check the preview section to see how the header will look</li>
          <li>Try the Bulk Update Mode toggle in the dialog header</li>
          <li>Check console for mock API calls when applying changes</li>
        </ul>
      </div>
    </div>
  );
}