import React, { useCallback, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { AgGridReact } from 'ag-grid-react';
import { ModuleRegistry, GridApi, GridReadyEvent, ColDef } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';
import { useAgGridTheme } from '@/components/datatable/hooks/useAgGridTheme';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/toaster';

ModuleRegistry.registerModules([AllEnterpriseModule]);

export default function TestColumnStyles() {
  const { theme } = useAgGridTheme();
  const gridRef = useRef<AgGridReact>(null);
  const gridApiRef = useRef<GridApi>();
  
  const [rowData] = useState([
    { make: 'Toyota', model: 'Celica', price: 35000 },
    { make: 'Ford', model: 'F-150', price: 45000 },
    { make: 'Ferrari', model: 'F40', price: 500000 }
  ]);

  const [columnDefs, setColumnDefs] = useState<ColDef[]>([
    { field: 'make', headerName: 'Make' },
    { field: 'model', headerName: 'Model' },
    { field: 'price', headerName: 'Price' }
  ]);

  const onGridReady = useCallback((params: GridReadyEvent<any>) => {
    gridApiRef.current = params.api;
  }, []);

  const applyStyles = () => {
    console.log('Applying function styles...');
    const newDefs: ColDef[] = [
      { 
        field: 'make', 
        headerName: 'Make',
        headerStyle: () => ({
          fontFamily: 'Arial',
          fontSize: '16px',
          fontWeight: 'bold',
          fontStyle: 'italic',
          color: 'blue'
        }),
        cellStyle: () => ({
          fontFamily: 'Arial',
          fontSize: '14px',
          fontStyle: 'italic',
          color: 'green'
        })
      },
      { 
        field: 'model', 
        headerName: 'Model',
        headerStyle: () => ({
          fontFamily: 'Arial',
          fontSize: '16px',
          textDecoration: 'underline',
          color: 'red'
        })
      },
      { 
        field: 'price', 
        headerName: 'Price',
        headerStyle: () => ({
          fontFamily: 'Arial',
          fontSize: '16px',
          fontWeight: 'bold',
          backgroundColor: 'yellow'
        })
      }
    ];
    
    setColumnDefs(newDefs);
    
    // Force the grid to refresh
    if (gridApiRef.current) {
      setTimeout(() => {
        gridApiRef.current!.refreshCells({ force: true });
        gridApiRef.current!.refreshHeader();
      }, 0);
    }
  };

  const applyDirectStyles = () => {
    console.log('Applying direct styles...');
    const newDefs: ColDef[] = [
      { 
        field: 'make', 
        headerName: 'Make',
        headerStyle: {
          fontFamily: 'Arial',
          fontSize: '16px',
          fontWeight: 'bold',
          fontStyle: 'italic',
          color: 'blue'
        },
        cellStyle: {
          fontFamily: 'Arial',
          fontSize: '14px',
          fontStyle: 'italic',
          color: 'green'
        }
      },
      { 
        field: 'model', 
        headerName: 'Model',
        headerStyle: {
          fontFamily: 'Arial',
          fontSize: '16px',
          textDecoration: 'underline',
          color: 'red'
        }
      },
      { 
        field: 'price', 
        headerName: 'Price',
        headerStyle: {
          fontFamily: 'Arial',
          fontSize: '16px',
          fontWeight: 'bold',
          backgroundColor: 'yellow'
        }
      }
    ];
    
    setColumnDefs(newDefs);
    
    // Force the grid to refresh
    if (gridApiRef.current) {
      setTimeout(() => {
        gridApiRef.current!.refreshCells({ force: true });
        gridApiRef.current!.refreshHeader();
      }, 0);
    }
  };

  return (
    <TooltipProvider>
      <div className="h-full w-full flex flex-col box-border overflow-hidden p-6">
        <h1 className="text-2xl font-bold mb-4">Column Styles Test</h1>
        <div className="mb-4 space-x-2">
          <Button onClick={applyStyles} variant="default">Apply Function Styles</Button>
          <Button onClick={applyDirectStyles} variant="outline">Apply Direct Styles</Button>
        </div>
        <div className="datatable-wrapper flex-grow">
          <div style={{ height: '100%', width: '100%' }}>
            <AgGridReact
              ref={gridRef}
              rowData={rowData}
              columnDefs={columnDefs}
              onGridReady={onGridReady}
              theme={theme}
              defaultColDef={{
                sortable: true,
                filter: true,
                resizable: true
              }}
            />
          </div>
        </div>
        <Toaster />
      </div>
    </TooltipProvider>
  );
}