import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ModuleRegistry, themeQuartz, GridApi } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';
import { AgGridReact } from 'ag-grid-react';
import { DataTableToolbar } from './data-table-toolbar';
import { useTheme } from '@/components/theme-provider';
import { useProfile } from '@/contexts/profile-context';
import { useKeyboardThrottler } from '@/hooks/useKeyboardThrottler';
import { useRapidKeypressNavigator } from '@/hooks/useRapidKeypressNavigator';
import { keyboardThrottleConfig, rapidKeypressConfig } from '@/config/keyboard-throttle-config';
import type { GetContextMenuItemsParams, DefaultMenuItem, MenuItemDef } from 'ag-grid-community';
import { CurrentFontContext } from './profile-selector';

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
  const { setGridApi, currentProfileId, loadProfile, updateProfile, saveProfile, profiles } = useProfile();
  
  console.log("🔍 Current profile data:", { 
    currentProfileId, 
    profilesCount: profiles.length,
    currentProfileDetails: currentProfileId ? profiles.find(p => p.id === currentProfileId) : 'none'
  });
  
  const gridApiRef = useRef<GridApi | null>(null);
  const isDarkMode = currentTheme === 'dark';
  const [gridReady, setGridReady] = useState(false);
  const [suppressColumnVirtualisation, setSuppressColumnVirtualisation] = useState(true);
  const lastKeyNavTime = useRef<number>(0);
  const lastHandledCell = useRef<{ col: string | null, row: number | null }>({ col: null, row: null });
  const [gridFont, setGridFont] = useState('monospace');
  console.log("🔍 Initial gridFont state:", gridFont);
  
  const profileLoadedRef = useRef(false);

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
        
        // Track this cell to prevent excessive handling
        lastHandledCell.current = {
          col: params.column.getId(),
          row: params.rowIndex
        };
      } catch (err) {
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
  }, [gridReady, enableRapidKeypress, lastHandledCell]);

  // Update AG Grid theme when app theme changes
  useEffect(() => {
    setDarkMode(isDarkMode);
  }, [isDarkMode]);

  // Effect to check for a stored profile on initial load
  useEffect(() => {
    console.log("🔍 INIT EFFECT - Checking for stored profile");
    console.log("🔍 Profiles available:", profiles.map(p => ({ id: p.id, name: p.name, font: p.gridFont })));
    
    // This will run once on component mount
    const storedCurrentProfile = localStorage.getItem('ag-grid-current-profile');
    console.log("🔍 Stored profile ID:", storedCurrentProfile);
    
    if (storedCurrentProfile) {
      // Find the profile in our profiles array
      const profile = profiles.find(p => p.id === storedCurrentProfile);
      console.log("🔍 Found profile from localStorage:", profile);
      
      if (profile && profile.gridFont) {
        console.log("🔍 Setting font from stored profile to:", profile.gridFont);
        setGridFont(profile.gridFont);
        profileLoadedRef.current = true;
        console.log("🔍 profileLoadedRef set to:", profileLoadedRef.current);
      } else {
        console.log("🔍 No font found in stored profile or profile not found");
      }
    } else {
      console.log("🔍 No stored profile ID found in localStorage");
    }
  }, [profiles]);

  // Load font when profile changes, even before grid is ready
  useEffect(() => {
    console.log("🔍 PROFILE CHANGE EFFECT - Profile ID:", currentProfileId);
    console.log("🔍 profileLoadedRef before:", profileLoadedRef.current);
    
    if (currentProfileId) {
      console.log("🔍 Profile changed to:", currentProfileId);
      profileLoadedRef.current = false;
      
      // Find the profile in memory first
      const profile = profiles.find(p => p.id === currentProfileId);
      console.log("🔍 Found profile in memory:", profile);
      
      if (profile && profile.gridFont) {
        // Apply font immediately from the profile in memory
        console.log("🔍 Setting font from profile in memory to:", profile.gridFont);
        setGridFont(profile.gridFont);
        profileLoadedRef.current = true;
        console.log("🔍 profileLoadedRef set to:", profileLoadedRef.current);
      } else {
        console.log("🔍 No font in profile or profile not found");
      }
    } else {
      console.log("🔍 No current profile ID");
    }
  }, [currentProfileId, profiles]);

  // Load the full profile when the grid is ready
  useEffect(() => {
    console.log("🔍 GRID READY EFFECT - Grid ready:", gridReady, "Current profile:", currentProfileId, "Already loaded:", profileLoadedRef.current);
    
    if (gridReady && currentProfileId && !profileLoadedRef.current) {
      console.log("🔍 Loading full profile with ID:", currentProfileId);
      
      // This will load the complete profile including all grid settings
      loadProfile(currentProfileId).then(({ gridFont: savedFont }) => {
        console.log("🔍 Profile loaded, returned font:", savedFont);
        
        // If there's a saved font in the profile and we haven't already applied it
        if (savedFont) {
          console.log("🔍 Setting font from loadProfile to:", savedFont);
          setGridFont(savedFont);
        } else {
          console.log("🔍 No font returned from loadProfile");
        }
        
        profileLoadedRef.current = true;
        console.log("🔍 profileLoadedRef set to:", profileLoadedRef.current);
      }).catch(err => {
        console.error("🔍 Error loading profile:", err);
      });
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

  const handleFontChange = (font: string) => {
    console.log("🔍 Font changed manually to:", font);
    console.log("🔍 Current gridFont before change:", gridFont);
    
    setGridFont(font);
    console.log("🔍 GridFont state set to:", font);
    
    // If there's an active profile, update it with the new font setting
    if (currentProfileId) {
      console.log("🔍 Updating profile with font:", font);
      // We'll update the profile with the new font, but don't need to refresh the cells
      // since the theme will handle that automatically via the useMemo dependency
      updateProfile(font).then(() => {
        console.log("🔍 Profile updated successfully with new font");
      }).catch(err => {
        console.error("🔍 Error updating profile with font:", err);
      });
    } else {
      console.log("🔍 No current profile to update with font");
    }
    
    if (gridApiRef.current) {
      console.log("🔍 Refreshing grid cells with new font");
      gridApiRef.current.refreshCells({ force: true });
    } else {
      console.log("🔍 No grid API available to refresh cells");
    }
  };

  console.log("🔍 Current gridFont before render:", gridFont);

  return (
    <CurrentFontContext.Provider value={gridFont}>
      <div className="h-full w-full flex flex-col box-border overflow-hidden">
        <DataTableToolbar onFontChange={handleFontChange} />

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
              setGridApi(params.api);
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
    </CurrentFontContext.Provider>
  );
}