import { useMemo } from 'react';
import type { DefaultMenuItem, MenuItemDef } from 'ag-grid-community';

export function useDefaultColumnDefs() {
  const defaultColDef = useMemo(() => ({
    flex: 1,
    minWidth: 100,
    filter: true,
    enableValue: true,
    enableRowGroup: true,
    enablePivot: true,
    cellStyle: {
      'display': 'flex',
      'align-items': 'flex-start',   // Vertical top
      'justify-content': 'flex-end'  // Horizontal right
    },
    sortingOrder: ['asc', 'desc', null], // AG Grid v33+ sorting order
  }), []);

  const autoGroupColumnDef = useMemo(() => ({
    minWidth: 200,
    flex: 1,
    headerName: 'Group',
    cellRendererParams: {
      suppressCount: false,
    },
  }), []);

  const getContextMenuItems = useMemo(() => (): (DefaultMenuItem | MenuItemDef)[] => {
    return [
      "autoSizeAll",
      "resetColumns",
      "separator",
      "copy",
      "copyWithHeaders",
      "paste",
      "separator",
      "export",
    ];
  }, []);

  return {
    defaultColDef,
    autoGroupColumnDef,
    getContextMenuItems
  };
} 