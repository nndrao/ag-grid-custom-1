import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ModuleRegistry, themeQuartz, GridApi, ColDef, GetContextMenuItemsParams, MenuItemDef, GridOptions, GridReadyEvent } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';
import { AgGridReact } from 'ag-grid-react';
import { DataTableToolbar } from './components/data-table-toolbar'; // UPDATED IMPORT
import { useTheme } from '@/components/theme-provider'; // This stays as it's an app-level theme
import { ProfileProvider, useProfile } from './contexts/profile-context'; // UPDATED IMPORT
import { CurrentFontProvider, useCurrentFont } from './contexts/current-font-context'; // UPDATED IMPORT
import { useKeyboardThrottler } from './hooks/useKeyboardThrottler'; // UPDATED IMPORT
import { useRapidKeypressNavigator } from './hooks/useRapidKeypressNavigator'; // UPDATED IMPORT
import { keyboardThrottleConfig, rapidKeypressConfig } from './config/keyboard-throttle-config'; // UPDATED IMPORT

ModuleRegistry.registerModules([AllEnterpriseModule]);

export interface CustomColumnDef extends ColDef {}

interface DataTableProps {
  columnDefs: CustomColumnDef[];
  dataRow: Record<string, any>[];
  initialFont?: string; // Allow passing an initial font for the provider
}

function setDocumentThemeMode(isDark: boolean) {
  document.body.dataset.agThemeMode = isDark ? "dark" : "light";
}

// Renamed to avoid conflict with the exported wrapper
function DataTableComponent({ columnDefs, dataRow }: Omit<DataTableProps, 'initialFont'>) {
  console.log("🔍 DataTableComponent Rendering");

  const gridRef = useRef<AgGridReact>(null);
  const { theme: appThemeSetting } = useTheme();
  const { setGridApi, currentProfileId, loadProfile, updateCurrentProfile, profiles } = useProfile();
  const { currentGridFont, setCurrentGridFont } = useCurrentFont();
  
  const gridApiRef = useRef<GridApi | null>(null); // To store gridApi once ready

  useEffect(() => { // Effect to pass gridApi to context once it's available
    if (gridRef.current?.api) {
      gridApiRef.current = gridRef.current.api;
      setGridApi(gridRef.current.api);
      console.log("🔍 Grid API initially passed to ProfileContext");
    }
  }, [setGridApi]);


  const isOsDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isEffectivelyDark = appThemeSetting === 'dark' || (appThemeSetting === 'system' && isOsDark);
  const [gridReady, setGridReady] = useState(false);
  
  const appliedFontRef = useRef<string>(currentGridFont);

  useKeyboardThrottler({
    ...keyboardThrottleConfig,
    targetElement: document as any,
  });

  const { enable: enableRapidKeypress } = useRapidKeypressNavigator(gridApiRef.current, rapidKeypressConfig);

  const agTheme = useMemo(() => {
    console.log("🔍 Creating theme with font:", currentGridFont);
    const baseParams = {
      fontFamily: currentGridFont,
      fontSize: 14,
      spacing: 6,
      wrapperBorderRadius: 2,
      buttonBorderRadius: 2,
      checkboxBorderRadius: 2,
      inputBorderRadius: 2,
      iconButtonBorderRadius: 1,
      iconSize: 12,
      columnBorder: true,
      headerFontSize: 14,
      headerFontWeight: 500,
      headerFontFamily: currentGridFont,
    };
    return themeQuartz
      .withParams({
        ...baseParams,
        accentColor: "#8AAAA7",
        backgroundColor: "#F7F7F7",
        borderColor: "#23202029",
        browserColorScheme: "light",
        cellTextColor: "#000000",
        headerBackgroundColor: "#EFEFEFD6",
        oddRowBackgroundColor: "#EEF1F1E8",
      }, "light")
      .withParams({
        ...baseParams,
        accentColor: "#8AAAA7",
        backgroundColor: "#1f2836",
        borderColor: "#E0E0E04D", 
        browserColorScheme: "dark",
        cellTextColor: "#FFFFFF", 
        foregroundColor: "#FFF",
        headerBackgroundColor: "#2c3340", 
        oddRowBackgroundColor: "#2A2E35",
        chromeBackgroundColor: { ref: "foregroundColor", mix: 0.07, onto: "backgroundColor" },
      }, "dark");
  }, [currentGridFont]);

  useEffect(() => {
    setDocumentThemeMode(isEffectivelyDark);
  }, [isEffectivelyDark]);

  const onGridReady = useCallback((params: GridReadyEvent) => {
    gridApiRef.current = params.api; // Set the local ref for hooks that might need it directly
    setGridApi(params.api);
    setGridReady(true);
    console.log("🔍 Grid ready, API set in context and local ref.");
  }, [setGridApi]);

  useEffect(() => {
    const activeProfile = profiles.find(p => p.id === currentProfileId); // Get profiles from context

    if (gridReady && currentProfileId && gridApiRef.current) { 
      if (activeProfile) { // Check if profile exists before trying to load it
        loadProfile(currentProfileId).then(loadedProfile => {
          if (loadedProfile?.gridFont) {
            setCurrentGridFont(loadedProfile.gridFont);
          }
        });
      } else {
         console.warn(`Profile with ID ${currentProfileId} not found in context. Cannot load.`);
      }
    }
  }, [gridReady, currentProfileId, loadProfile, setCurrentGridFont, profiles]); // Added profiles to dependency array
  
  useEffect(() => { if (gridReady && gridApiRef.current) enableRapidKeypress(); }, [gridReady, enableRapidKeypress, gridApiRef.current]);

  useEffect(() => {
    if (gridApiRef.current && appliedFontRef.current !== currentGridFont) {
      console.log("🔍 Font changed in theme, refreshing grid cells (AG Grid refresh)");
      gridApiRef.current.refreshCells({ force: true });
      appliedFontRef.current = currentGridFont;
    }
  }, [currentGridFont, agTheme]); // agTheme dependency ensures this runs after theme object updates

  const defaultColDef = useMemo<ColDef>(() => ({
    flex: 1,
    minWidth: 100,
    filter: true,
    resizable: true,
    sortable: true,
    enableValue: true,
    enableRowGroup: true,
    enablePivot: true,
  }), []);

  const autoGroupColumnDef = useMemo<ColDef>(() => ({
    minWidth: 200,
    headerName: 'Group',
    cellRendererParams: { suppressCount: false },
  }), []);

  const getContextMenuItems = useCallback((params: GetContextMenuItemsParams): (string | MenuItemDef)[] => {
    return [
      "copy", "copyWithHeaders", "copyWithGroupHeaders", "paste", "separator",
      "excelExport", "csvExport", "separator",
      "autoSizeAll", "resetColumns", "separator",
      "expandAll", "contractAll", "separator",
      "rowGroup", "rowUnGroup",
    ];
  }, []);

  const handleFontChangeWithProfileUpdate = useCallback(async (newFont: string) => {
    setCurrentGridFont(newFont);
    if (currentProfileId) {
      await updateCurrentProfile(newFont);
    }
  }, [currentProfileId, setCurrentGridFont, updateCurrentProfile]);
  
  const gridOptions = useMemo<GridOptions>(() => ({
      sideBar: {
        toolPanels: [
          { id: 'columns', labelDefault: 'Columns', labelKey: 'columns', iconKey: 'columns', toolPanel: 'agColumnsToolPanel' },
          { id: 'filters', labelDefault: 'Filters', labelKey: 'filters', iconKey: 'filter', toolPanel: 'agFiltersToolPanel' },
        ],
      },
      statusBar: {
        statusPanels: [
          { statusPanel: 'agTotalRowCountComponent', align: 'left' },
          { statusPanel: 'agFilteredRowCountComponent', align: 'left' },
          { statusPanel: 'agSelectedRowCountComponent', align: 'center' },
          { statusPanel: 'agAggregationComponent', align: 'right' },
        ],
      },
      rowGroupPanelShow: "always",
      groupDisplayType: "multipleColumns",
      groupDefaultExpanded: 0,
      rowSelection: { mode: 'multiRow', enableClickSelection: false },
      suppressMenuHide: true,
      pagination: true,
      paginationPageSize: 100,
      paginationPageSizeSelector: [50, 100, 200, 500],
      cellSelection: true,
  }), []);

  return (
    <div className="h-full w-full flex flex-col box-border overflow-hidden">
      <DataTableToolbar onFontChange={handleFontChangeWithProfileUpdate} />
      <div className="flex-1 overflow-hidden" id="ag-grid-container">
        <AgGridReact
          ref={gridRef}
          rowData={dataRow}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          autoGroupColumnDef={autoGroupColumnDef}
          getContextMenuItems={getContextMenuItems}
          onGridReady={onGridReady}
          theme={agTheme}
          {...gridOptions}
        />
      </div>
    </div>
  );
}

// Export a new DataTable wrapper that includes the providers
export const DataTable: React.FC<DataTableProps> = (props) => {
  return (
    <CurrentFontProvider initialFont={props.initialFont}> {/* Pass initialFont if provided */}
      <ProfileProvider>
        <DataTableComponent {...props} />
      </ProfileProvider>
    </CurrentFontProvider>
  );
}; 