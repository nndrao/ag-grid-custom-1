import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ModuleRegistry, themeQuartz, GridApi } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';
import { AgGridReact } from 'ag-grid-react';
import { DataTableToolbar } from './data-table-toolbar';
import { useTheme } from '@/components/theme-provider';
import { useProfile } from '@/contexts/profile-context';
import { useKeyboardThrottler } from '@/hooks/useKeyboardThrottler';
import { keyboardThrottleConfig } from '@/config/keyboard-throttle-config';
import type { GetContextMenuItemsParams, DefaultMenuItem, MenuItemDef } from 'ag-grid-community';

ModuleRegistry.registerModules([AllEnterpriseModule]);

export interface ColumnDef {
  field: string;
  headerName: string;
  cellDataType?: string;
}

interface DataTableProps {
  columnDefs: ColumnDef[];
  dataRow: Record<string, any>[];
}

// Function to set dark mode on document body for AG Grid
function setDarkMode(enabled: boolean) {
  document.body.dataset.agThemeMode = enabled ? "dark" : "light";
}

const theme = themeQuartz
  .withParams(
    {
      accentColor: "#8AAAA7",
      backgroundColor: "#F7F7F7",
      borderColor: "#23202029",
      browserColorScheme: "light",
      buttonBorderRadius: 2,
      cellTextColor: "#000000",
      checkboxBorderRadius: 2,
      columnBorder: true,
      fontFamily: {
        googleFont: "Inter",
      },
      fontSize: 14,
      headerBackgroundColor: "#EFEFEFD6",
      headerFontFamily: {
        googleFont: "Inter",
      },
      headerFontSize: 14,
      headerFontWeight: 500,
      iconButtonBorderRadius: 1,
      iconSize: 12,
      inputBorderRadius: 2,
      oddRowBackgroundColor: "#EEF1F1E8",
      spacing: 6,
      wrapperBorderRadius: 2,
    },
    "light"
  )
  .withParams(
    {
      accentColor: "#8AAAA7",
      backgroundColor: "#1f2836",
      borderRadius: 2,
      checkboxBorderRadius: 2,
      columnBorder: true,
      fontFamily: {
        googleFont: "Inter",
      },
      browserColorScheme: "dark",
      chromeBackgroundColor: {
        ref: "foregroundColor",
        mix: 0.07,
        onto: "backgroundColor",
      },
      fontSize: 14,
      foregroundColor: "#FFF",
      headerFontFamily: {
        googleFont: "Inter",
      },
      headerFontSize: 14,
      iconSize: 12,
      inputBorderRadius: 2,
      oddRowBackgroundColor: "#2A2E35",
      spacing: 6,
      wrapperBorderRadius: 2,
    },
    "dark"
  );

export function DataTable({ columnDefs, dataRow }: DataTableProps) {
  const gridRef = useRef<AgGridReact>(null);
  const { theme: currentTheme } = useTheme();
  const { setGridApi, currentProfileId, loadProfile } = useProfile();
  const gridApiRef = useRef<GridApi | null>(null);
  const isDarkMode = currentTheme === 'dark';
  const [gridReady, setGridReady] = useState(false);

  // Apply keyboard throttling to prevent overwhelming ag-grid with rapid key presses
  useKeyboardThrottler({
    ...keyboardThrottleConfig,
    targetElement: document as any, // Apply to the entire document
  });

  // Update AG Grid theme when app theme changes
  useEffect(() => {
    setDarkMode(isDarkMode);
  }, [isDarkMode]);



  // Load the current profile when the grid is ready
  useEffect(() => {
    if (gridReady && currentProfileId) {
      console.log("Loading profile with ID:", currentProfileId);
      loadProfile(currentProfileId);
    }
  }, [gridReady, currentProfileId, loadProfile]);

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

  const getContextMenuItems = useCallback((params: GetContextMenuItemsParams): (DefaultMenuItem | MenuItemDef)[] => {
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

  return (
    <div className="h-full w-full flex flex-col box-border overflow-hidden">
      <DataTableToolbar />

      <div className="flex-1 overflow-hidden">
        <AgGridReact
          ref={gridRef}
          rowData={dataRow}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          autoGroupColumnDef={autoGroupColumnDef}
          rowGroupPanelShow="always"
          groupDisplayType="singleColumn"
          groupDefaultExpanded={-1}
          cellSelection={{ handle: { mode: 'fill' } }}
          suppressMenuHide={true}
          dataTypeDefinitions={{
            string: {
              baseDataType: 'text',
              extendsDataType: 'text',
            },
          }}
          sideBar={{
            toolPanels: [
              {
                id: 'columns',
                labelDefault: 'Columns',
                labelKey: 'columns',
                iconKey: 'columns',
                toolPanel: 'agColumnsToolPanel',
              },
              {
                id: 'filters',
                labelDefault: 'Filters',
                labelKey: 'filters',
                iconKey: 'filter',
                toolPanel: 'agFiltersToolPanel',
              },
            ],
          }}
          statusBar={{
            statusPanels: [
              { statusPanel: 'agTotalRowCountComponent', align: 'left' },
              { statusPanel: 'agFilteredRowCountComponent', align: 'left' },
              { statusPanel: 'agSelectedRowCountComponent', align: 'center' },
              { statusPanel: 'agAggregationComponent', align: 'right' },
              { statusPanel: 'agTotalAndFilteredRowCountComponent', align: 'right' },
            ],
          }}
          getContextMenuItems={getContextMenuItems}
          onGridReady={(params) => {
            console.log("Grid ready event fired");
            gridApiRef.current = params.api;
            console.log("Setting grid API:", params.api);
            setGridApi(params.api);
            setGridReady(true);
          }}
          theme={theme}
        />
      </div>
    </div>
  );
}