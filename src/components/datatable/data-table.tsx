import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { 
  ModuleRegistry, 
  GridApi, 
  GridReadyEvent,
  SortDirection,
  ColDef,
  CellFocusedEvent
} from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';
import { AgGridReact } from 'ag-grid-react';
import { DataTableToolbar } from '@/components/datatable/data-table-toolbar';
import { GridStateProvider } from '@/services/gridStateProvider';
import { SettingsController } from '@/services/settings-controller';
import { useProfileManager2 } from '@/hooks/useProfileManager2';
import { useAgGridTheme } from './hooks/useAgGridTheme';
import { useAgGridProfileSync } from './hooks/useAgGridProfileSync';
import { useDefaultColumnDefs } from './config/default-column-defs';
import { ProfileManager } from '@/types/ProfileManager';
import { DEFAULT_GRID_OPTIONS } from '@/components/datatable/config/default-grid-options';
import cloneDeep from 'lodash/cloneDeep';
import { mergeWith } from 'lodash';
import { keyboardThrottleConfig, rapidKeypressConfig } from './config/keyboard-throttle-config';
import { useKeyboardThrottler } from './hooks/useKeyboardThrottler';
import { useRapidKeypressNavigator } from './hooks/useRapidKeypressNavigator';
import { debounce } from 'lodash';
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
  
  // Apply keyboard throttling to prevent overwhelming ag-grid with rapid key presses
  useKeyboardThrottler({
    ...keyboardThrottleConfig,
    targetElement: document.body,
  });

  // Use rapid keypress navigator for enhanced keyboard navigation
  const { enable: enableRapidKeypress } = useRapidKeypressNavigator(gridApiRef.current, rapidKeypressConfig);
  
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

  // Handle keyboard navigation separately
  useEffect(() => {
    if (!gridReady || !gridApiRef.current) return;
    
    // Enable rapid keypresses when grid is ready
    enableRapidKeypress();
    
    // Add a focused cell changed listener for column visibility
    const onFocusedCellChanged = (params: CellFocusedEvent) => {
      if (!params.column) return;
      
      try {
        // Ensure the column is visible in the viewport
        gridApiRef.current?.ensureColumnVisible(params.column);
      } catch (err: unknown) {
        console.error('Error handling focused cell change:', err);
      }
    };
    
    // Register the listener
    gridApiRef.current.addEventListener('cellFocused', onFocusedCellChanged);
    
    // Cleanup
    return () => {
      if (gridApiRef.current) {
        gridApiRef.current.removeEventListener('cellFocused', onFocusedCellChanged);
      }
    };
  }, [gridReady, enableRapidKeypress]);

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

  // Handle grid ready event
  const onGridReady = useCallback((params: GridReadyEvent) => {
    gridApiRef.current = params.api;
    gridStateProvider.current.setGridApi(params.api);
    setGridReady(true);
    
    // Apply active profile settings if available
    if (profileManager?.activeProfile && settingsControllerRef.current) {
      // Only apply profile settings if this is the first time or profile actually changed
      if (!isInitialProfileAppliedRef.current) {
        isInitialProfileAppliedRef.current = true;
        
        // Record the profile ID for future change detection
        previousProfileIdRef.current = profileManager.activeProfile.id;
        
        // Apply settings on initial load - only once
        console.log("📊 Initial application of profile settings");
        settingsControllerRef.current.applyProfileSettings(profileManager.activeProfile.settings);
      }
      
      // Apply grid options using the proper AG Grid API
      if (processedDefaultColDef) {
        // Apply using the appropriate grid API method
        params.api.setGridOption('defaultColDef', processedDefaultColDef);
        
        // Use AG Grid's event system instead of setTimeout
        params.api.addEventListener('firstDataRendered', () => {
          params.api.refreshCells({ force: true });
        });
      }
      
      // Add event listeners to save column state when the user makes changes
      // to column width, order, visibility, etc.
      const autoSaveProfileWithDebounce = debounce(() => {
        console.log("🔄 Auto-saving profile after column changes");
        if (profileManager.saveCurrentProfile) {
          profileManager.saveCurrentProfile();
        }
      }, 500);

      // Event handlers for column state changes
      params.api.addEventListener('columnResized', () => {
        console.log("📏 Column resized - triggering profile save");
        autoSaveProfileWithDebounce();
      });
      
      params.api.addEventListener('columnMoved', () => {
        console.log("🔄 Column moved - triggering profile save");
        autoSaveProfileWithDebounce();
      });
      
      params.api.addEventListener('columnVisible', () => {
        console.log("👁️ Column visibility changed - triggering profile save");
        autoSaveProfileWithDebounce();
      });
      
      params.api.addEventListener('columnPinned', () => {
        console.log("📌 Column pinned - triggering profile save");
        autoSaveProfileWithDebounce();
      });
    }
  }, [profileManager, processedDefaultColDef]);
  
  // Detect profile changes and apply settings - optimized to reduce redundant updates
  useEffect(() => {
    // Skip if no grid is ready or no profile manager or no active profile
    if (!gridReady || !gridApiRef.current || !profileManager?.activeProfile || !settingsControllerRef.current) {
      return;
    }
    
    // Get current profile ID
    const currentProfileId = profileManager.activeProfile.id;
    
    // Check if profile ID has changed AND it's not the initial application
    if (currentProfileId !== previousProfileIdRef.current && isInitialProfileAppliedRef.current) {
      console.log(`🔄 Profile changed from ${previousProfileIdRef.current} to ${currentProfileId}`);
      
      // Update reference
      previousProfileIdRef.current = currentProfileId;
      
      // Only apply the new profile settings after a profile change
      console.log("📊 Applying settings after profile change");
      // This will efficiently batch updates with our optimized SettingsController
      settingsControllerRef.current.applyProfileSettings(profileManager.activeProfile.settings);
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
          rowSelection={{
            mode: 'multiRow',
            enableClickSelection: true,
            enableSelectionWithoutKeys: true
          }}
          loading={false}
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