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