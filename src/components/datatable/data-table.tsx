import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { 
  ModuleRegistry, 
  themeQuartz, 
  GridApi, 
  CellFocusedEvent,
  GridReadyEvent
} from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';
import { AgGridReact } from 'ag-grid-react';
import { DataTableToolbar } from '../datatable/data-table-toolbar'; // Corrected path
import { useTheme } from '@/components/theme-provider';
import { useKeyboardThrottler } from '../datatable/hooks/useKeyboardThrottler'; // Corrected path
import { useRapidKeypressNavigator } from '../datatable/hooks/useRapidKeypressNavigator'; // Corrected path
import { keyboardThrottleConfig, rapidKeypressConfig } from '../datatable/config/keyboard-throttle-config'; // Corrected path
import type { GetContextMenuItemsParams, DefaultMenuItem, MenuItemDef } from 'ag-grid-community';
import { GridStateProvider } from '@/services/gridStateProvider';
import { SettingsController } from '@/services/settingsController';
import { useProfileManager } from '@/hooks/useProfileManager';

ModuleRegistry.registerModules([AllEnterpriseModule]);

export interface ColumnDef {
  field: string;
  headerName: string;
  cellDataType?: string;
}

interface DataTableProps {
  columnDefs: ColumnDef[];
  dataRow: Record<string, unknown>[]; // Use unknown instead of any
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
  
  // Use a ref to store the current font to avoid re-renders
  const currentFontRef = useRef<string>('monospace');
  
  // Initialize services for profile management
  const gridStateProvider = useRef(new GridStateProvider());
  const settingsControllerRef = useRef<SettingsController | null>(null);

  // Initialize settings controller once
  useEffect(() => {
    if (!settingsControllerRef.current) {
      settingsControllerRef.current = new SettingsController(gridStateProvider.current);
    }
  }, []);

  // Initialize profile manager - always call the hook, never conditionally
  const profileManager = useProfileManager(settingsControllerRef.current);

  // Apply keyboard throttling to prevent overwhelming ag-grid with rapid key presses
  useKeyboardThrottler({
    ...keyboardThrottleConfig,
    targetElement: document.body, // Use document.body instead of document as any
  });

  // Use rapid keypress navigator for enhanced keyboard navigation
  const { enable: enableRapidKeypress } = useRapidKeypressNavigator(gridApiRef.current, rapidKeypressConfig);

  // Create theme with base parameters but handle fonts separately via CSS
  const theme = useMemo(() => {
    console.log("🔍 Creating base theme");
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
        // Don't include fontFamily in theme to avoid re-rendering
        fontSize: 14,
        headerBackgroundColor: "#EFEFEFD6",
        // Don't include headerFontFamily in theme to avoid re-rendering
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
        // Don't include fontFamily in theme to avoid re-rendering
        browserColorScheme: "dark",
        chromeBackgroundColor: {
          ref: "foregroundColor",
          mix: 0.07,
          onto: "backgroundColor",
        },
        fontSize: 14,
        foregroundColor: "#FFF",
        // Don't include headerFontFamily in theme to avoid re-rendering
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
  }, []); // No dependencies means theme won't regenerate when font changes

  // Handle keyboard navigation for ensuring column visibility
  useEffect(() => {
    if (!gridReady || !gridApiRef.current) return;
    
    const api = gridApiRef.current;
    
    // Enable rapid keypresses when grid is ready
    enableRapidKeypress();
    
    // Add a focused cell changed listener for column visibility
    // Provide correct event type
    const onFocusedCellChanged = (params: CellFocusedEvent) => {
      if (!params.column) return;
      
      try {
        // Ensure the column is visible in the viewport
        api.ensureColumnVisible(params.column);
      } catch (err: unknown) { // Use unknown for error type
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

  // Extremely simple font change handler - just set the CSS variable directly
  const handleFontChange = useCallback((font: string) => {
    console.log("🔍 Setting font to:", font);
    
    // Set the font directly on document root
    document.documentElement.style.setProperty("--ag-font-family", font);
    
    // Update the ref instead of state
    currentFontRef.current = font;
    
    // Only update settings controller for persisting the font preference
    if (settingsControllerRef.current) {
      settingsControllerRef.current.updateToolbarSettings({ fontFamily: font });
    }
  }, []);

  // Listen for settings changes from the settings controller
  useEffect(() => {
    if (!settingsControllerRef.current) return;

    const unsubscribe = settingsControllerRef.current.onToolbarSettingsChange((settings) => {
      if (settings.fontFamily) {
        // Apply font changes coming from settings updates (e.g. profile changes)
        document.documentElement.style.setProperty("--ag-font-family", settings.fontFamily);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [settingsControllerRef]);

  // Memoize important values to prevent re-renders
  const memoizedToolbarProps = useMemo(() => ({
    onFontChange: handleFontChange,
    currentFontValue: currentFontRef.current,
    profileManager: profileManager
  }), [handleFontChange, profileManager]);

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

  // Disable eslint rule for unused params as it's required by AG Grid type but not used here
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

  // Handle grid ready event (more efficiently)
  const onGridReady = useCallback((params: GridReadyEvent) => {
    console.log("🔍 Grid ready event fired");
    gridApiRef.current = params.api;
    gridStateProvider.current.setGridApi(params.api);
    console.log("🔍 Setting grid API");
    setGridReady(true);
    console.log("🔍 Grid ready state set to true");
    
    // Apply active profile settings if available, but don't make any unnecessary refreshes
    if (profileManager?.activeProfile && settingsControllerRef.current) {
      console.log("🔍 Applying saved profile from grid ready event");
      // Apply settings immediately but don't trigger additional refreshes
      settingsControllerRef.current.applyProfileSettings(profileManager.activeProfile.settings);
    }
  }, [profileManager?.activeProfile]);

  // Only watch for profile selection changes, not profile content updates
  const activeProfileIdRef = useRef<string | null>(null);
  
  // Modify the useEffect that watches for activeProfile changes to properly handle fonts
  useEffect(() => {
    // Skip if grid not ready or no active profile
    if (!gridReady || !profileManager?.activeProfile || !settingsControllerRef.current) return;
    
    const currentProfileId = profileManager.activeProfile.id;
    
    // Only apply settings if the profile ID changed (meaning we switched profiles)
    // This avoids re-applying when just saving the current profile
    if (currentProfileId !== activeProfileIdRef.current) {
      console.log("🔍 Profile selection changed, applying new profile settings");
      activeProfileIdRef.current = currentProfileId;
      
      // Apply the selected profile's settings
      setTimeout(() => {
        if (settingsControllerRef.current && profileManager?.activeProfile) {
          const profileSettings = profileManager.activeProfile.settings;
          
          // Apply settings to grid
          settingsControllerRef.current.applyProfileSettings(profileSettings);
          
          // Also directly update the font if it exists in the profile
          if (profileSettings.toolbar?.fontFamily) {
            // Update our font ref
            currentFontRef.current = profileSettings.toolbar.fontFamily;
            
            // Apply font directly via CSS
            document.documentElement.style.setProperty(
              "--ag-font-family", 
              profileSettings.toolbar.fontFamily
            );
          }
        }
      }, 50);
    }
  }, [gridReady, profileManager?.activeProfile]);

  return (
    <div className="h-full w-full flex flex-col box-border overflow-hidden">
      <DataTableToolbar 
        table={null} 
        {...memoizedToolbarProps}
        className="mb-2.5"
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
          onGridReady={onGridReady}
          theme={theme}
        />
      </div>
    </div>
  );
} 