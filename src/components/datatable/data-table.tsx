import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { 
  ModuleRegistry, 
  GridApi, 
  GridReadyEvent,
  SortDirection,
  ColDef
} from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';
import { AgGridReact } from 'ag-grid-react';
import { DataTableToolbar } from '@/components/datatable/data-table-toolbar';
import { GridStateProvider } from '@/services/gridStateProvider';
import { SettingsController } from '@/services/settings-controller';
import { useProfileManager2 } from '@/hooks/useProfileManager2';
import { useAgGridTheme } from './hooks/useAgGridTheme';
import { useAgGridProfileSync } from './hooks/useAgGridProfileSync';
import { useAgGridKeyboardNavigation } from './hooks/useAgGridKeyboardNavigation';
import { useDefaultColumnDefs } from './config/default-column-defs';
import { ProfileManager } from '@/types/ProfileManager';
import { DEFAULT_GRID_OPTIONS } from '@/components/datatable/config/default-grid-options';
import cloneDeep from 'lodash/cloneDeep';
import { mergeWith } from 'lodash';
import { GoogleFontsLoader } from '@/components/GoogleFontsLoader';

// Only keep tooltip-fixes.css which is for Radix UI, not AG Grid styling
import './tooltip-fixes.css';

ModuleRegistry.registerModules([AllEnterpriseModule]);

export interface ColumnDef {
  field: string;
  headerName: string;
  cellDataType?: string;
}

interface DataTableProps {
  columnDefs: ColumnDef[];
  dataRow: Record<string, unknown>[];
}

export function DataTable({ columnDefs, dataRow }: DataTableProps) {
  const gridRef = useRef<AgGridReact>(null);
  const gridApiRef = useRef<GridApi | null>(null);
  const [gridReady, setGridReady] = useState(false);
  
  // Initialize services for profile management
  const gridStateProvider = useRef(new GridStateProvider());
  const settingsControllerRef = useRef<SettingsController | null>(null);
  // Track the previous profile ID to detect profile changes
  const previousProfileIdRef = useRef<string | null>(null);
  const isInitialProfileAppliedRef = useRef(false);

  // Initialize settings controller once
  useEffect(() => {
    if (!settingsControllerRef.current) {
      settingsControllerRef.current = new SettingsController(gridStateProvider.current);
    }
  }, []);

  // Initialize profile manager - always call the hook, never conditionally
  const profileManager = useProfileManager2(settingsControllerRef.current);

  // Use our modular hooks with settings controller
  const { theme } = useAgGridTheme(settingsControllerRef.current);
  
  // Use keyboard navigation hook
  useAgGridKeyboardNavigation(gridApiRef.current, gridReady);
  
  // Use type assertion to bypass type checking for profileManager
  const safeProfileManager = profileManager as unknown as ProfileManager;
  
  // Hook for profile synchronization
  useAgGridProfileSync(gridReady, safeProfileManager, settingsControllerRef.current);
  
  // Always call the hook once, unconditionally
  const {
    defaultColDef: hookDefaultColDef,
    autoGroupColumnDef: hookAutoGroupColumnDef,
    getContextMenuItems
  } = useDefaultColumnDefs();


  // Use profile's gridOptions if available, otherwise fallback to DEFAULT_GRID_OPTIONS
  // Memoize to prevent unnecessary cloning on every render
  const customGridOptions = useMemo(() => {
    const baseOptions = cloneDeep(DEFAULT_GRID_OPTIONS);
    
    if (profileManager?.activeProfile?.settings?.custom?.gridOptions) {
      // Custom merge function to handle special cases like functions
      return mergeWith(
        baseOptions, 
        profileManager.activeProfile.settings.custom.gridOptions,
        (objValue, srcValue) => {
          // Don't merge arrays, replace them
          if (Array.isArray(objValue)) {
            return srcValue;
          }
          // Return undefined to use default lodash merging
          return undefined;
        }
      );
    }
    
    return baseOptions;
  }, [profileManager?.activeProfile?.settings?.custom?.gridOptions]);

  // Create type-safe defaultColDef that properly handles sortingOrder
  const processedDefaultColDef: ColDef = useMemo(() => {
    // Start with base defaults from our hook
    const baseDefaults: ColDef = { 
      ...hookDefaultColDef,
      // Ensure sortingOrder is properly typed
      sortingOrder: ['asc', 'desc', null] as SortDirection[] 
    };
    
    // If we have custom options, merge them safely
    if (customGridOptions.defaultColDef) {
      // Create a safe copy without the potentially problematic sortingOrder
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { sortingOrder, ...safeCustomColDef } = customGridOptions.defaultColDef as ColDef;
      
      // Merge the safe properties
      const result: ColDef = { ...baseDefaults, ...safeCustomColDef };
      
      // Explicitly handle sortingOrder with proper typing
      if (customGridOptions.defaultColDef.sortingOrder) {
        // Safely convert to AG Grid's expected type
        result.sortingOrder = customGridOptions.defaultColDef.sortingOrder
          .map(item => {
            if (item === null) return null;
            if (item === 'asc') return 'asc';
            if (item === 'desc') return 'desc';
            return null;
          }) as SortDirection[];
      }
      
      return result;
    }
    
    return baseDefaults;
  }, [customGridOptions.defaultColDef, hookDefaultColDef]);
  
  const autoGroupColumnDef = useMemo(() => 
    customGridOptions.autoGroupColumnDef ?? hookAutoGroupColumnDef
  , [customGridOptions.autoGroupColumnDef, hookAutoGroupColumnDef]);

  // Memoize important values to prevent re-renders
  const memoizedToolbarProps = useMemo(() => ({
    profileManager,
    settingsController: settingsControllerRef.current,
    gridApi: gridApiRef.current
  }), [
    profileManager, 
    // Use refs directly without .current to avoid unnecessary re-renders
    // The toolbar component will access the current values when needed
  ]);

  // Memoize columnDefs to prevent unnecessary rerenders
  const memoizedColumnDefs = useMemo(() => columnDefs, [columnDefs]);
  
  // Memoize static configuration objects to prevent re-renders
  const rowSelection = useMemo(() => ({
    mode: 'multiRow',
    enableClickSelection: true,
    enableSelectionWithoutKeys: true
  }), []);
  
  const dataTypeDefinitions = useMemo(() => ({
    string: {
      baseDataType: 'text',
      extendsDataType: 'text',
    }
  }), []);
  
  const sideBar = useMemo(() => ({
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
  }), []);
  
  const statusBar = useMemo(() => ({
    statusPanels: [
      { statusPanel: 'agTotalRowCountComponent', align: 'left' },
      { statusPanel: 'agFilteredRowCountComponent', align: 'left' },
      { statusPanel: 'agSelectedRowCountComponent', align: 'center' },
      { statusPanel: 'agAggregationComponent', align: 'right' },
      { statusPanel: 'agTotalAndFilteredRowCountComponent', align: 'right' },
    ],
  }), []);

  // Handle grid ready event
  const onGridReady = useCallback((params: GridReadyEvent) => {
    console.log("🚀 Grid ready event fired");
    gridApiRef.current = params.api;
    gridStateProvider.current.setGridApi(params.api);
    
    // Ensure settings controller has the grid API
    if (settingsControllerRef.current) {
      settingsControllerRef.current.setGridApi(params.api);
    }
    
    setGridReady(true);
    
    // Apply active profile settings if available
    if (profileManager?.activeProfile && settingsControllerRef.current) {
      // Only apply profile settings if this is the first time
      if (!isInitialProfileAppliedRef.current) {
        isInitialProfileAppliedRef.current = true;
        
        // Record the profile ID for future change detection
        previousProfileIdRef.current = profileManager.activeProfile.id;
        
        // Apply settings on initial load with delay to ensure grid is fully ready
        console.log("📊 Initial application of profile settings on grid ready");
        setTimeout(() => {
          if (settingsControllerRef.current && profileManager.activeProfile) {
            settingsControllerRef.current.applyProfileSettings(profileManager.activeProfile.settings);
            
            // Apply grid options after settings are applied
            if (processedDefaultColDef) {
              params.api.setGridOption('defaultColDef', processedDefaultColDef);
              
              // Force a refresh after all settings
              setTimeout(() => {
                params.api.refreshCells({ force: true });
                console.log("📊 Grid refreshed after initial profile application");
              }, 200);
            }
          }
        }, 300); // Increase delay to ensure grid is fully ready
      }
    }
  }, [profileManager, processedDefaultColDef]);
  
  // Track profile changes only - ProfileManager handles applying settings
  useEffect(() => {
    // Skip if no grid is ready or no profile manager or no active profile
    if (!gridReady || !profileManager?.activeProfile) {
      return;
    }
    
    // Get current profile ID
    const currentProfileId = profileManager.activeProfile.id;
    
    // Check if profile ID has changed AND it's not the initial application
    if (currentProfileId !== previousProfileIdRef.current && isInitialProfileAppliedRef.current) {
      console.log(`🔄 Profile switched from ${previousProfileIdRef.current} to ${currentProfileId}`);
      
      // Update reference only - ProfileManager handles applying settings
      previousProfileIdRef.current = currentProfileId;
    }
  }, [gridReady, profileManager?.activeProfile?.id]);

  return (
    <div className="h-full w-full flex flex-col box-border overflow-hidden">
      {/* Load Google Fonts */}
      <GoogleFontsLoader />
      
      <DataTableToolbar 
        table={null} 
        {...memoizedToolbarProps}
        className="mb-2.5"
      />

      <div className="flex-1 overflow-hidden">
        <AgGridReact
          ref={gridRef}
          rowData={dataRow}
          columnDefs={memoizedColumnDefs}
          defaultColDef={processedDefaultColDef}
          autoGroupColumnDef={autoGroupColumnDef}
          rowGroupPanelShow="always"
          groupDisplayType="singleColumn"
          groupDefaultExpanded={-1}
          cellSelection={true}
          rowSelection={rowSelection}
          loading={false}
          dataTypeDefinitions={dataTypeDefinitions}
          sideBar={sideBar}
          statusBar={statusBar}
          getContextMenuItems={getContextMenuItems}
          onGridReady={onGridReady}
          theme={theme}
        />
      </div>
    </div>
  );
} 