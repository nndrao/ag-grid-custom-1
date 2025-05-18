import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ColumnSettingsDialog } from '../ColumnSettingsDialog';
import { GridApi, ColDef } from 'ag-grid-community';

// Mock grid API for testing
const mockGridApi: Partial<GridApi> = {
  getColumnDefs: () => [
    {
      field: 'name',
      headerName: 'Name',
      filter: 'agTextColumnFilter',
      headerStyle: {
        fontFamily: 'Arial',
        fontSize: '14px',
        color: '#333333',
        backgroundColor: '#f0f0f0'
      }
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

export function VerifyIntegration() {
  const [open, setOpen] = useState(false);
  const [selectedColumn] = useState<ColDef>({
    field: 'name',
    headerName: 'Name'
  });

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Column Settings Dialog Integration Test</h1>
      
      <div className="space-y-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-2">What to Check:</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Click the button below to open the dialog</li>
            <li>The Header tab should show the new improved design with:</li>
            <ul className="ml-6 list-disc list-inside">
              <li>Live preview at the top</li>
              <li>Modern card-based sections</li>
              <li>Visual icons for each section</li>
              <li>Eye toggle buttons for colors</li>
              <li>Border side selector buttons</li>
            </ul>
            <li>Make changes and verify they appear in the preview</li>
            <li>Check the console for state updates</li>
          </ol>
        </div>

        <Button 
          onClick={() => setOpen(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Open Column Settings Dialog
        </Button>

        <ColumnSettingsDialog
          open={open}
          onOpenChange={setOpen}
          gridApi={mockGridApi as GridApi}
          column={selectedColumn}
        />

        <div className="mt-8 p-4 bg-gray-100 rounded">
          <h3 className="font-semibold mb-2">Integration Status:</h3>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>✅ New dialog imported in grid-settings-menu.tsx</li>
            <li>✅ Menu item "Column Settings" opens the new dialog</li>
            <li>✅ Header tab has been redesigned</li>
            <li>✅ Live preview functionality</li>
            <li>✅ Type-safe implementation</li>
          </ul>
        </div>
      </div>
    </div>
  );
}