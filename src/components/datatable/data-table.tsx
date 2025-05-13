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
import { useAgGridFont } from './hooks/useAgGridFont';
import { useAgGridKeyboardNavigation } from './hooks/useAgGridKeyboardNavigation';
import { useAgGridProfileSync } from './hooks/useAgGridProfileSync';
import { useDefaultColumnDefs } from './config/default-column-defs';
import { ProfileManager } from '@/types/ProfileManager';

// Import custom AG Grid styles
import './ag-grid-styles.css';

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
  const { handleFontChange } = useAgGridFont(settingsControllerRef.current);
  useAgGridKeyboardNavigation(gridApiRef.current, gridReady);
  // Use type assertion to bypass type checking for profileManager
  useAgGridProfileSync(gridReady, profileManager as unknown as ProfileManager, settingsControllerRef.current);
  const { defaultColDef, autoGroupColumnDef, getContextMenuItems } = useDefaultColumnDefs();

  // Memoize important values to prevent re-renders
  const memoizedToolbarProps = useMemo(() => ({
    onFontChange: handleFontChange,
    profileManager,
    settingsController: settingsControllerRef.current
  }), [handleFontChange, profileManager, settingsControllerRef.current]);

  // Handle grid ready event
  const onGridReady = useCallback((params: GridReadyEvent) => {
    gridApiRef.current = params.api;
    gridStateProvider.current.setGridApi(params.api);
    setGridReady(true);
    
    // Apply active profile settings if available
    if (profileManager?.activeProfile && settingsControllerRef.current) {
      settingsControllerRef.current.applyProfileSettings(profileManager.activeProfile.settings);
    }
  }, [profileManager]);

  return (
    <div className="h-full w-full flex flex-col box-border overflow-hidden">
      <DataTableToolbar 
        table={null} 
        {...memoizedToolbarProps}
        className="mb-2.5"
      />

      <div className="flex-1 overflow-hidden">
        <AgGridReact
          className="ag-theme-quartz"
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