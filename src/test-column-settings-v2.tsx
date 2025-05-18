import React from 'react';
import { DataTableV2 } from '@/components/datatable/data-table-v2';
import { ColDef } from 'ag-grid-community';
import { generateRandomData } from '@/lib/data-generator';

const TestColumnSettingsV2 = () => {
  // Define column definitions
  const columnDefs: ColDef[] = [
    {
      field: 'id',
      headerName: 'ID',
      width: 80,
      sortable: true,
      filter: true
    },
    {
      field: 'name',
      headerName: 'Name',
      width: 150,
      sortable: true,
      filter: 'agTextColumnFilter'
    },
    {
      field: 'age',
      headerName: 'Age',
      width: 90,
      sortable: true,
      filter: 'agNumberColumnFilter'
    },
    {
      field: 'email',
      headerName: 'Email',
      width: 200,
      sortable: true,
      filter: 'agTextColumnFilter'
    },
    {
      field: 'salary',
      headerName: 'Salary',
      width: 120,
      sortable: true,
      filter: 'agNumberColumnFilter',
      valueFormatter: (params) => `$${params.value.toLocaleString()}`
    },
    {
      field: 'department',
      headerName: 'Department',
      width: 150,
      sortable: true,
      filter: 'agTextColumnFilter'
    },
    {
      field: 'startDate',
      headerName: 'Start Date',
      width: 120,
      sortable: true,
      filter: 'agDateColumnFilter',
      valueFormatter: (params) => new Date(params.value).toLocaleDateString()
    },
    {
      field: 'isActive',
      headerName: 'Active',
      width: 100,
      sortable: true,
      filter: true,
      cellRenderer: (params) => params.value ? '✓' : '✗'
    }
  ];

  // Generate sample data
  const rowData = generateRandomData(20);

  return (
    <div className="h-screen w-screen p-4">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Column Settings V2 Test</h1>
        <p className="text-gray-600">
          Test the new column settings dialog with Map-based state management
        </p>
      </div>
      
      <div className="h-[calc(100vh-120px)]">
        <DataTableV2 
          columnDefs={columnDefs} 
          dataRow={rowData} 
        />
      </div>
    </div>
  );
};

export default TestColumnSettingsV2;