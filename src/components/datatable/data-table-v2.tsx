import { useCallback, useEffect, useMemo, useRef, useState, memo } from 'react';
import { 
  ModuleRegistry, 
  GridApi, 
  GridReadyEvent,
  SortDirection,
  ColDef
} from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';
import { AgGridReact } from 'ag-grid-react';
import { DataTableToolbar } from './data-table-toolbar';
import { GridStateProvider } from './services/gridStateProvider';
import { SettingsController } from './services/settings-controller';
import { useProfileManager2 } from './hooks/useProfileManager2';
import { useAgGridTheme } from './hooks/useAgGridTheme';
import { useAgGridProfileSync } from './hooks/useAgGridProfileSync';
import { useAgGridKeyboardNavigation } from './hooks/useAgGridKeyboardNavigation';
import { useDefaultColumnDefs } from './config/default-column-defs';
import { ProfileManager } from './types/ProfileManager';
import { DEFAULT_GRID_OPTIONS } from './config/default-grid-options';
import { GoogleFontsLoader } from './theme/GoogleFontsLoader';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/toaster';
import { ColumnSettingsPersistenceV2 } from './utils/column-settings-persistence-v2';
import { convertSettingsToColDef } from './column-settings/conversion-utils';
import './tooltip-fixes.css';

ModuleRegistry.registerModules([AllEnterpriseModule]);

export interface DataTableProps {
  columnDefs: ColDef[];
  dataRow: any[];
}

// Memoized toolbar to prevent unnecessary re-renders
const MemoizedToolbar = memo(DataTableToolbar);

export function DataTableV2({ columnDefs, dataRow }: DataTableProps) {
  const gridRef = useRef<AgGridReact>(null);
  const gridApiRef = useRef<GridApi | null>(null);
  const [gridReady, setGridReady] = useState(false);
  
  // Initialize services using refs
  const gridStateProviderRef = useRef<GridStateProvider>();
  const settingsControllerRef = useRef<SettingsController>();
  
  // Initialize services once
  useMemo(() => {
    if (!gridStateProviderRef.current) {
      gridStateProviderRef.current = new GridStateProvider();
    }
    if (!settingsControllerRef.current) {
      settingsControllerRef.current = new SettingsController(gridStateProviderRef.current);
      console.log('SettingsController initialized:', settingsControllerRef.current);
    }
  }, []);
  
  // Initialize profile manager
  const profileManager = useProfileManager2(settingsControllerRef.current);

  // Use hooks
  const { theme } = useAgGridTheme(settingsControllerRef.current);
  useAgGridKeyboardNavigation(gridApiRef.current, gridReady);
  useAgGridProfileSync(gridReady, profileManager, settingsControllerRef.current);
  
  // Get default column definitions
  const {
    defaultColDef: hookDefaultColDef,
    autoGroupColumnDef: hookAutoGroupColumnDef,
    getContextMenuItems
  } = useDefaultColumnDefs();

  // Memoize grid options to prevent deep cloning on every render
  const customGridOptions = useMemo(() => {
    const profileOptions = profileManager?.activeProfile?.settings?.custom?.gridOptions;
    return { ...DEFAULT_GRID_OPTIONS, ...profileOptions };
  }, [profileManager?.activeProfile?.settings?.custom?.gridOptions]);

  // Create type-safe defaultColDef
  const processedDefaultColDef: ColDef = useMemo(() => {
    const baseDefaults: ColDef = { 
      ...hookDefaultColDef,
      sortingOrder: ['asc', 'desc', null] as SortDirection[] 
    };
    
    if (customGridOptions.defaultColDef) {
      const { sortingOrder, ...safeCustomColDef } = customGridOptions.defaultColDef as ColDef;
      return { ...baseDefaults, ...safeCustomColDef };
    }
    
    return baseDefaults;
  }, [customGridOptions.defaultColDef, hookDefaultColDef]);

  const autoGroupColumnDef = useMemo(() => 
    customGridOptions.autoGroupColumnDef ?? hookAutoGroupColumnDef
  , [customGridOptions.autoGroupColumnDef, hookAutoGroupColumnDef]);

  // Memoize toolbar props to prevent re-renders
  const memoizedToolbarProps = useMemo(() => ({
    table: null,
    profileManager,
    settingsController: settingsControllerRef.current,
    gridApi: gridApiRef.current,
    className: "mb-2.5"
  }), [profileManager, gridReady]);

  // Memoize columnDefs and merge with saved column settings using the new V2 persistence
  const memoizedColumnDefs = useMemo(() => {
    try {
      // Try to get saved settings using V2 persistence
      const savedSettings = ColumnSettingsPersistenceV2.getColumnSettings();
      
      if (savedSettings?.columnSettings) {
        console.log('DataTableV2: Applying saved column settings');
        
        // Apply saved settings to base column definitions
        return columnDefs.map((col: ColDef) => {
          if (!col.field) return col;
          
          const settings = savedSettings.columnSettings[col.field];
          if (!settings) return col;
          
          // Convert settings to column definition properties
          const settingsColDef = convertSettingsToColDef(settings);
          
          // Merge with base column definition
          return {
            ...col,
            ...settingsColDef
          };
        });
      }
      
      console.log('DataTableV2: No saved column settings found');
    } catch (error) {
      console.error('Error applying saved column settings:', error);
    }
    
    return columnDefs;
  }, [columnDefs, profileManager?.activeProfile?.settings?.custom]);

  // Get dynamic configurations from customGridOptions
  const dynamicConfigs = useMemo(() => {
    const defaults = {
      rowSelection: 'multiple' as const,
      dataTypeDefinitions: undefined,
      sideBar: {
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
      },
      statusBar: {
        statusPanels: [
          { statusPanel: 'agTotalAndFilteredRowCountComponent', align: 'left' },
          { statusPanel: 'agTotalRowCountComponent', align: 'center' },
          { statusPanel: 'agFilteredRowCountComponent', align: 'center' },
          { statusPanel: 'agSelectedRowCountComponent', align: 'center' },
          { statusPanel: 'agAggregationComponent', align: 'center' },
        ],
      },
      cellSelection: false,
    };
    
    return {
      rowSelection: customGridOptions.rowSelection || defaults.rowSelection,
      dataTypeDefinitions: customGridOptions.dataTypeDefinitions || defaults.dataTypeDefinitions,
      sideBar: customGridOptions.sideBar ?? defaults.sideBar,
      statusBar: customGridOptions.statusBar ?? defaults.statusBar,
      cellSelection: customGridOptions.cellSelection ?? false
    };
  }, [customGridOptions]);

  // Handle grid ready event
  const onGridReady = useCallback((params: GridReadyEvent) => {
    gridApiRef.current = params.api;
    
    if (gridStateProviderRef.current) {
      gridStateProviderRef.current.setGridApi(params.api);
    }
    
    if (settingsControllerRef.current) {
      settingsControllerRef.current.setGridApi(params.api);
    }
    
    setGridReady(true);
    
    // Apply saved column state
    const savedSettings = ColumnSettingsPersistenceV2.getColumnSettings();
    if (savedSettings?.columnState) {
      console.log('DataTableV2: Applying saved column state');
      params.api.applyColumnState({
        state: savedSettings.columnState,
        applyOrder: true
      });
    }
    
    // Apply active profile settings if available
    if (profileManager?.activeProfile && settingsControllerRef.current) {
      requestAnimationFrame(() => {
        if (settingsControllerRef.current && profileManager.activeProfile) {
          settingsControllerRef.current.applyProfileSettings(profileManager.activeProfile.settings);
          
          if (processedDefaultColDef && params.api) {
            params.api.setGridOption('defaultColDef', processedDefaultColDef);
            
            // Use requestAnimationFrame for final refresh
            requestAnimationFrame(() => {
              params.api.refreshCells({ force: true });
            });
          }
        }
      });
    }
  }, [profileManager, processedDefaultColDef]);

  return (
    <TooltipProvider>
      <div className="h-full w-full flex flex-col box-border overflow-hidden">
        <GoogleFontsLoader />
        
        <MemoizedToolbar {...memoizedToolbarProps} />

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
            cellSelection={dynamicConfigs.cellSelection}
            rowSelection={dynamicConfigs.rowSelection}
            loading={false}
            dataTypeDefinitions={dynamicConfigs.dataTypeDefinitions}
            sideBar={dynamicConfigs.sideBar}
            statusBar={dynamicConfigs.statusBar}
            getContextMenuItems={getContextMenuItems}
            onGridReady={onGridReady}
            theme={theme}
          />
        </div>
        
        <Toaster />
      </div>
    </TooltipProvider>
  );
}