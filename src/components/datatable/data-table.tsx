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

// Helper function to shallow merge grid options
function mergeGridOptions(base: any, custom: any): any {
  if (!custom) return base;
  
  // Create a shallow copy instead of deep clone
  const merged = { ...base };
  
  // Shallow merge custom options
  Object.keys(custom).forEach(key => {
    if (custom[key] !== undefined) {
      // For arrays, replace entirely (don't merge)
      if (Array.isArray(custom[key])) {
        merged[key] = custom[key];
      } else if (typeof custom[key] === 'object' && custom[key] !== null && !Array.isArray(custom[key])) {
        // For objects, shallow merge
        merged[key] = { ...base[key], ...custom[key] };
      } else {
        // For primitives and functions, replace
        merged[key] = custom[key];
      }
    }
  });
  
  return merged;
}

// Memoized toolbar to prevent unnecessary re-renders
const MemoizedToolbar = memo(DataTableToolbar);

export function DataTable({ columnDefs, dataRow }: DataTableProps) {
  const gridRef = useRef<AgGridReact>(null);
  const gridApiRef = useRef<GridApi | null>(null);
  const [gridReady, setGridReady] = useState(false);
  
  // Initialize services using refs to prevent re-creation
  const gridStateProviderRef = useRef<GridStateProvider>();
  const settingsControllerRef = useRef<SettingsController>();
  
  // Initialize services once
  useMemo(() => {
    if (!gridStateProviderRef.current) {
      gridStateProviderRef.current = new GridStateProvider();
    }
    if (!settingsControllerRef.current) {
      settingsControllerRef.current = new SettingsController(gridStateProviderRef.current);
    }
  }, []);
  
  // Track profile changes
  const previousProfileIdRef = useRef<string | null>(null);
  const isInitialProfileAppliedRef = useRef(false);

  // Initialize profile manager
  const profileManager = useProfileManager2(settingsControllerRef.current);

  // Use hooks
  const { theme } = useAgGridTheme(settingsControllerRef.current);
  
  // Use keyboard navigation hook
  useAgGridKeyboardNavigation(gridApiRef.current, gridReady);
  
  // Type assertion for profile manager
  const safeProfileManager = profileManager as unknown as ProfileManager;
  
  // Hook for profile synchronization
  useAgGridProfileSync(gridReady, safeProfileManager, settingsControllerRef.current);
  
  // Get default column definitions
  const {
    defaultColDef: hookDefaultColDef,
    autoGroupColumnDef: hookAutoGroupColumnDef,
    getContextMenuItems
  } = useDefaultColumnDefs();

  // Memoize grid options to prevent deep cloning on every render
  const customGridOptions = useMemo(() => {
    const profileOptions = profileManager?.activeProfile?.settings?.custom?.gridOptions;
    return mergeGridOptions(DEFAULT_GRID_OPTIONS, profileOptions);
  }, [profileManager?.activeProfile?.settings?.custom?.gridOptions]);

  // Create type-safe defaultColDef
  const processedDefaultColDef: ColDef = useMemo(() => {
    const baseDefaults: ColDef = { 
      ...hookDefaultColDef,
      sortingOrder: ['asc', 'desc', null] as SortDirection[] 
    };
    
    if (customGridOptions.defaultColDef) {
      const { sortingOrder, verticalAlign, horizontalAlign, ...safeCustomColDef } = customGridOptions.defaultColDef as ColDef & { verticalAlign?: string; horizontalAlign?: string };
      const result: ColDef = { ...baseDefaults, ...safeCustomColDef };
      
      // Reconstruct cellStyle if alignment properties exist
      if (verticalAlign || horizontalAlign) {
        const existingCellStyle = result.cellStyle;
        
        result.cellStyle = (params: any) => {
          const styleObj: any = { display: 'flex' };
          
          // Apply vertical alignment
          if (verticalAlign === 'top') {
            styleObj.alignItems = 'flex-start';
          } else if (verticalAlign === 'middle') {
            styleObj.alignItems = 'center';
          } else if (verticalAlign === 'bottom') {
            styleObj.alignItems = 'flex-end';
          }
          
          // Apply horizontal alignment
          if (horizontalAlign === 'left') {
            styleObj.justifyContent = 'flex-start';
          } else if (horizontalAlign === 'center') {
            styleObj.justifyContent = 'center';
          } else if (horizontalAlign === 'right') {
            styleObj.justifyContent = 'flex-end';
          } else if (params.colDef.type === 'numericColumn') {
            styleObj.justifyContent = 'flex-end'; // Right align numbers by default
          } else {
            styleObj.justifyContent = 'flex-start'; // Left align text by default
          }
          
          // Merge with existing cellStyle if it exists
          if (typeof existingCellStyle === 'function') {
            const existingStyles = existingCellStyle(params);
            return { ...existingStyles, ...styleObj };
          } else if (typeof existingCellStyle === 'object') {
            return { ...existingCellStyle, ...styleObj };
          }
          
          return styleObj;
        };
      }
      
      if (customGridOptions.defaultColDef.sortingOrder) {
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

  // Memoize toolbar props to prevent re-renders
  const memoizedToolbarProps = useMemo(() => ({
    table: null,
    profileManager,
    settingsController: settingsControllerRef.current,
    gridApi: gridApiRef.current,
    className: "mb-2.5"
  }), [profileManager]);

  // Memoize columnDefs
  const memoizedColumnDefs = useMemo(() => columnDefs, [columnDefs]);
  
  // Get dynamic configurations from customGridOptions and fallback to defaults
  const dynamicConfigs = useMemo(() => {
    // Default configurations for AG Grid v33+
    const defaults = {
      rowSelection: {
        mode: 'multiRow',
        enableClickSelection: true,
        enableSelectionWithoutKeys: true,
        checkboxes: false
      },
      dataTypeDefinitions: {
        string: {
          baseDataType: 'text',
          extendsDataType: 'text',
        }
      },
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
          { statusPanel: 'agTotalRowCountComponent', align: 'left' },
          { statusPanel: 'agFilteredRowCountComponent', align: 'left' },
          { statusPanel: 'agSelectedRowCountComponent', align: 'center' },
          { statusPanel: 'agAggregationComponent', align: 'right' },
          { statusPanel: 'agTotalAndFilteredRowCountComponent', align: 'right' },
        ],
      }
    };
    
    // Merge with custom options from profile/settings
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
    
    // Apply active profile settings if available
    if (profileManager?.activeProfile && settingsControllerRef.current && !isInitialProfileAppliedRef.current) {
      isInitialProfileAppliedRef.current = true;
      previousProfileIdRef.current = profileManager.activeProfile.id;
      
      // Use requestAnimationFrame for better performance
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
  
  // Track profile changes
  useEffect(() => {
    if (!gridReady || !profileManager?.activeProfile) return;
    
    const currentProfileId = profileManager.activeProfile.id;
    
    if (currentProfileId !== previousProfileIdRef.current && isInitialProfileAppliedRef.current) {
      previousProfileIdRef.current = currentProfileId;
    }
  }, [gridReady, profileManager?.activeProfile?.id]);

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