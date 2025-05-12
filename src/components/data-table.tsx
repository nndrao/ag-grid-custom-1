import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ModuleRegistry, themeQuartz, GridApi } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';
import { AgGridReact } from 'ag-grid-react';
import { DataTableToolbar } from './data-table-toolbar';
import { useTheme } from '@/components/theme-provider';
import { useKeyboardThrottler } from '@/hooks/useKeyboardThrottler';
import { useRapidKeypressNavigator } from '@/hooks/useRapidKeypressNavigator';
import { keyboardThrottleConfig, rapidKeypressConfig } from '@/config/keyboard-throttle-config';
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

export function DataTable({ columnDefs, dataRow }: DataTableProps) {
  console.log("🔍 DataTable Component Rendering");

  const gridRef = useRef<AgGridReact>(null);
  const { theme: currentTheme } = useTheme();
  
  const gridApiRef = useRef<GridApi | null>(null);
  const isDarkMode = currentTheme === 'dark';
  const [gridReady, setGridReady] = useState(false);
  const [suppressColumnVirtualisation, setSuppressColumnVirtualisation] = useState(true);
  const lastKeyNavTime = useRef<number>(0);
  const lastHandledCell = useRef<{ col: string | null, row: number | null }>({ col: null, row: null });
  
  // Single font state for the application
  const [gridFont, setGridFont] = useState('monospace');
  console.log("🔍 Initial gridFont state:", gridFont);
  
  // Use this ref to track fonts we've seen to avoid redundant cell refreshes
  const appliedFontRef = useRef<string>(gridFont);

  // Apply keyboard throttling to prevent overwhelming ag-grid with rapid key presses
  useKeyboardThrottler({
    ...keyboardThrottleConfig,
    targetElement: document as any, // Apply to the entire document
  });

  // Use rapid keypress navigator for enhanced keyboard navigation
  const { enable: enableRapidKeypress } = useRapidKeypressNavigator(gridApiRef.current, rapidKeypressConfig);

  // Create theme based on current font
  const theme = useMemo(() => {
    console.log("🔍 Creating theme with font:", gridFont);
    const baseTheme = themeQuartz.withParams(
      {
        accentColor: "#8AAAA7",
        backgroundColor: "#F7F7F7",
        borderColor: "#23202029",
        browserColorScheme: "light",
        buttonBorderRadius: 2,
        cellTextColor: "#000000",
        checkboxBorderRadius: 2,
        columnBorder: true,
        fontFamily: gridFont,
        fontSize: 14,
        headerBackgroundColor: "#EFEFEFD6",
        headerFontFamily: gridFont,
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
        fontFamily: gridFont,
        browserColorScheme: "dark",
        chromeBackgroundColor: {
          ref: "foregroundColor",
          mix: 0.07,
          onto: "backgroundColor",
        },
        fontSize: 14,
        foregroundColor: "#FFF",
        headerFontFamily: gridFont,
        headerFontSize: 14,
        iconSize: 12,
        inputBorderRadius: 2,
        oddRowBackgroundColor: "#2A2E35",
        spacing: 6,
        wrapperBorderRadius: 2,
      },
      "dark"
    );

    return baseTheme;
  }, [gridFont]);

  // Handle keyboard navigation for ensuring column visibility
  useEffect(() => {
    if (!gridReady || !gridApiRef.current) return;
    
    const api = gridApiRef.current;
    
    // Enable rapid keypresses when grid is ready
    enableRapidKeypress();
    
    // Add a focused cell changed listener for column visibility
    const onFocusedCellChanged = (params: any) => {
      if (!params.column) return;
      
      try {
        // Ensure the column is visible in the viewport
        api.ensureColumnVisible(params.column);
      } catch (err: any) {
        console.error('Error handling focused cell change:', err);
      }
    };
    
    // Register the listener
    api.addEventListener('cellFocused', onFocusedCellChanged);
    
    // Cleanup
    return () => {
      if (gridApiRef.current) {
        gridApiRef.current.removeEventListener('cellFocused', onFocusedCellChanged);
      }
    };
  }, [gridReady, enableRapidKeypress]);

  // Update AG Grid theme when app theme changes
  useEffect(() => {
    setDarkMode(isDarkMode);
  }, [isDarkMode]);

  // Apply theme to grid when it changes
  useEffect(() => {
    if (gridApiRef.current && appliedFontRef.current !== gridFont) {
      console.log("🔍 Font changed in theme, refreshing grid once");
      
      // AG-Grid refreshCells is expensive, only do it when necessary
      gridApiRef.current.refreshCells({ force: true });
      
      // Update our ref to track that we've applied this font
      appliedFontRef.current = gridFont;
    }
  }, [gridFont, theme]);

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

  // Optimized font change handler
  const handleFontChange = useCallback((font: string) => {
    console.log("🔍 Font changed manually to:", font);
    
    if (font === appliedFontRef.current) {
      console.log("🔍 Font is already applied, skipping refresh");
      return;
    }
    
    // Update state (will trigger theme regeneration through useMemo)
    setGridFont(font);
    
    // We don't call refreshCells here - it will be handled by the useEffect that watches gridFont
  }, []);

  console.log("🔍 Current gridFont before render:", gridFont);

  return (
    <div className="h-full w-full flex flex-col box-border overflow-hidden">
      <DataTableToolbar 
        table={null} 
        onFontChange={handleFontChange} 
        currentFontValue={gridFont}
      />

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
            console.log("🔍 Grid ready event fired");
            gridApiRef.current = params.api;
            console.log("🔍 Setting grid API");
            setGridReady(true);
            console.log("🔍 Grid ready state set to true");
            
            setTimeout(() => {
              setSuppressColumnVirtualisation(true);
              console.log("🔍 Column virtualization suppressed");
            // params.api.setGridOption('suppressColumnVirtualisation', true);
            }, 100);
          }}
        
          theme={theme}
        />
      </div>
    </div>
  );
}