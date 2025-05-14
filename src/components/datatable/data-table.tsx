import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { 
  ModuleRegistry, 
  GridApi, 
  GridReadyEvent
} from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';
import { AgGridReact } from 'ag-grid-react';
import { DataTableToolbar } from '@/components/datatable/data-table-toolbar';
import { GridStateProvider } from '@/services/gridStateProvider';
import { SettingsController } from '@/services/settingsController';
import { useProfileManager } from '@/hooks/useProfileManager';
import { useAgGridTheme } from './hooks/useAgGridTheme';
import { useAgGridKeyboardNavigation } from './hooks/useAgGridKeyboardNavigation';
import { useAgGridProfileSync } from './hooks/useAgGridProfileSync';
import { useDefaultColumnDefs } from './config/default-column-defs';
import { ProfileManager } from '@/types/ProfileManager';
import { DEFAULT_GRID_OPTIONS } from '@/components/datatable/config/default-grid-options';
import { deepClone } from '@/utils/deepClone';

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

  // Initialize settings controller once
  useEffect(() => {
    if (!settingsControllerRef.current) {
      settingsControllerRef.current = new SettingsController(gridStateProvider.current);
    }
  }, []);

  // Initialize profile manager - always call the hook, never conditionally
  const profileManager = useProfileManager(settingsControllerRef.current);

  // Use our modular hooks
  const { theme } = useAgGridTheme();
  useAgGridKeyboardNavigation(gridApiRef.current, gridReady);
  // Use type assertion to bypass type checking for profileManager
  useAgGridProfileSync(gridReady, profileManager as unknown as ProfileManager, settingsControllerRef.current);
  // Always call the hook once, unconditionally
  const {
    defaultColDef: hookDefaultColDef,
    autoGroupColumnDef: hookAutoGroupColumnDef,
    getContextMenuItems
  } = useDefaultColumnDefs();

  // Use profile's gridOptions if available, otherwise fallback to DEFAULT_GRID_OPTIONS
  const customGridOptions = profileManager?.activeProfile?.settings?.custom?.gridOptions
    ? deepClone(profileManager.activeProfile.settings.custom.gridOptions)
    : deepClone(DEFAULT_GRID_OPTIONS);
    
  // Log the defaultColDef and cellStyle to debug
  console.log('Original DEFAULT_GRID_OPTIONS.defaultColDef:', DEFAULT_GRID_OPTIONS.defaultColDef);
  console.log('Original cellStyle type:', typeof DEFAULT_GRID_OPTIONS.defaultColDef?.cellStyle);
  console.log('Cloned defaultColDef:', customGridOptions.defaultColDef);
  console.log('Cloned cellStyle type:', typeof customGridOptions.defaultColDef?.cellStyle);

  // Ensure defaultColDef has the cellStyle function for vertical alignment
  // If cellStyle is missing after cloning, use the one from DEFAULT_GRID_OPTIONS
  if (customGridOptions.defaultColDef && 
      (!customGridOptions.defaultColDef.cellStyle || 
       typeof customGridOptions.defaultColDef.cellStyle !== 'function')) {
    console.log('Restoring cellStyle function from DEFAULT_GRID_OPTIONS');
    customGridOptions.defaultColDef.cellStyle = DEFAULT_GRID_OPTIONS.defaultColDef?.cellStyle;
  }

  // Use defaultColDef and autoGroupColumnDef from gridOptions, fallback to hook if not present
  const defaultColDef = customGridOptions.defaultColDef ?? hookDefaultColDef;
  const autoGroupColumnDef = customGridOptions.autoGroupColumnDef ?? hookAutoGroupColumnDef;
  // getContextMenuItems is always from the hook


  // Memoize important values to prevent re-renders
  const memoizedToolbarProps = useMemo(() => ({
    profileManager,
    settingsController: settingsControllerRef.current,
    gridApi: gridApiRef.current
  }), [profileManager, settingsControllerRef.current, gridApiRef.current]);

  // Handle grid ready event
  const onGridReady = useCallback((params: GridReadyEvent) => {
    gridApiRef.current = params.api;
    gridStateProvider.current.setGridApi(params.api);
    setGridReady(true);
    
    // Apply active profile settings if available
    if (profileManager?.activeProfile && settingsControllerRef.current) {
      settingsControllerRef.current.applyProfileSettings(profileManager.activeProfile.settings);
      
      // Directly apply defaultColDef to ensure cellStyle is properly applied
      if (defaultColDef) {
        console.log('Directly applying defaultColDef in onGridReady');
        params.api.setGridOption('defaultColDef', defaultColDef);
        
        // Force refresh cells to apply the styles
        setTimeout(() => {
          params.api.refreshCells({ force: true });
        }, 100);
      }
    }
  }, [profileManager, defaultColDef]);

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