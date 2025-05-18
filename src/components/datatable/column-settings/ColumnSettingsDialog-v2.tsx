import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Check, AlertCircle } from 'lucide-react';
import { ColDef } from 'ag-grid-community';
import { BUTTON_CLASSES, FORM_CONTROL_HEIGHTS } from './style-utils';
import { ColumnSettingsPersistenceV2 } from '@/components/datatable/utils/column-settings-persistence-v2';
import { toast } from '@/components/ui/use-toast';

// Import custom styles for scrollbar
import './column-settings.css';

// Import sub-components
import { ColumnListPanel } from './components/ColumnListPanel';
import { HeaderTab, CellTab, FormatterTab, FilterTab, EditorsTab } from './components/tabs';

// Import types and utilities
import type {
  ColumnSettingsDialogProps,
  ColumnSettingsState,
  ColumnSettings,
  ColumnSettingsMap
} from './types';

import { 
  convertSettingsToColDef, 
  extractSettingsFromColDef, 
  validateColumnSettings,
  mergeColumnSettings 
} from './conversion-utils';

/**
 * Column Settings Dialog - Version 2
 * Implements the refined workflow with Map-based settings and improved performance
 */
export function ColumnSettingsDialogV2({
  open,
  onOpenChange,
  gridApi,
  column,
  settingsController,
  profileManager
}: ColumnSettingsDialogProps) {
  // State management
  const [state, setState] = useState<ColumnSettingsState>({
    selectedColumn: '',
    selectedColumns: [],
    bulkUpdateMode: false,
    columnSettingsMap: {},
    modifiedColumns: new Set(),
    hasChanges: false,
    activeTab: 'header',
    searchTerm: '',
    columns: [],
    baseColumnDefs: [],
    isLoading: false,
    error: null
  });

  const [isApplying, setIsApplying] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Separate state for bulk mode settings
  const [bulkSettings, setBulkSettings] = useState<Record<string, any>>({
    header: {
      headerName: '',
      headerFontFamily: 'Arial',
      headerFontSize: '14px',
      headerFontWeight: 'normal',
      headerFontStyle: '',
      headerTextColor: null,
      headerBackgroundColor: null,
      headerTextAlign: 'left',
      headerVerticalAlign: 'middle',
      applyHeaderBorders: false,
      headerBorderStyle: 'solid',
      headerBorderWidth: '1px',
      headerBorderColor: '#000000',
      headerBorderSides: 'all'
    },
    cell: {
      cellFontFamily: 'Arial',
      cellFontSize: '12px',
      cellFontWeight: 'normal',
      cellFontStyle: '',
      cellTextColor: null,
      cellBackgroundColor: null,
      cellTextAlign: 'left',
      cellVerticalAlign: 'middle',
      applyCellBorders: false,
      cellBorderStyle: 'solid',
      cellBorderWidth: '1px',
      cellBorderColor: '#E5E7EB',
      cellBorderSides: 'all'
    },
    formatter: {},
    filter: {},
    editor: {}
  });

  // Load columns when dialog opens
  useEffect(() => {
    if (open && gridApi) {
      loadColumnSettings();
    }
  }, [open, gridApi]);

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setState({
        selectedColumn: '',
        selectedColumns: [],
        bulkUpdateMode: false,
        columnSettingsMap: {},
        modifiedColumns: new Set(),
        hasChanges: false,
        activeTab: 'header',
        searchTerm: '',
        columns: [],
        baseColumnDefs: [],
        isLoading: false,
        error: null
      });
    }
  }, [open]);

  /**
   * Load column settings from grid and profile
   */
  const loadColumnSettings = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Get current column definitions from grid
      const currentColDefs = gridApi.getColumnDefs() as ColDef[];
      
      // Clone and prepare for editing
      const editableColDefs = currentColDefs.map(col => ({
        ...col,
        // Preserve non-style properties
        field: col.field,
        headerName: col.headerName,
        width: col.width,
        // Reset style properties for clean slate
        headerClass: undefined,
        cellClass: undefined,
        headerStyle: undefined,
        cellStyle: undefined,
        valueFormatter: undefined,
        // Keep data-related properties
        filter: col.filter,
        editable: col.editable,
        sortable: col.sortable
      }));

      // Load saved settings from profile
      const savedSettings = ColumnSettingsPersistenceV2.getColumnSettings();
      const columnSettingsMap: ColumnSettingsMap = savedSettings?.columnSettings || {};

      // Initialize with saved settings or extract from current columns
      const initialSettingsMap: ColumnSettingsMap = {};
      
      for (const col of editableColDefs) {
        if (col.field) {
          const savedSetting = columnSettingsMap[col.field];
          if (savedSetting) {
            // Use saved settings
            initialSettingsMap[col.field] = savedSetting;
          } else {
            // Extract settings from current column
            initialSettingsMap[col.field] = extractSettingsFromColDef(col, col.field);
          }
        }
      }

      // Set initial selected column
      const availableFields = editableColDefs.map(c => c.field).filter(Boolean);
      const shouldSelectColumn = column?.field || availableFields[0] || '';

      setState(prev => ({
        ...prev,
        columns: editableColDefs,
        baseColumnDefs: currentColDefs,
        columnSettingsMap: initialSettingsMap,
        selectedColumn: shouldSelectColumn,
        isLoading: false
      }));

    } catch (error) {
      console.error('Error loading column settings:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to load column settings'
      }));
    }
  }, [gridApi, column]);

  /**
   * Handle column selection
   */
  const handleColumnSelect = useCallback((columnField: string) => {
    if (state.bulkUpdateMode) {
      setState(prev => ({
        ...prev,
        selectedColumns: prev.selectedColumns.includes(columnField)
          ? prev.selectedColumns.filter(f => f !== columnField)
          : [...prev.selectedColumns, columnField]
      }));
    } else {
      setState(prev => ({
        ...prev,
        selectedColumn: columnField
      }));
    }
  }, [state.bulkUpdateMode]);

  /**
   * Update column settings for a specific tab
   */
  const updateColumnSettings = useCallback((tabName: keyof ColumnSettings, updates: any) => {
    console.log('updateColumnSettings called:', tabName, updates, 'bulkMode:', state.bulkUpdateMode);
    
    // Update bulk settings if in bulk mode
    if (state.bulkUpdateMode) {
      setBulkSettings(prev => ({
        ...prev,
        [tabName]: updates
      }));
    }
    
    // Map HeaderTab format back to V2 format if needed
    let mappedUpdates = updates;
    if (tabName === 'header') {
      // Map all header properties from HeaderTab format to V2 format
      mappedUpdates = {
        displayName: updates.headerName,
        fontFamily: updates.headerFontFamily,
        fontSize: updates.headerFontSize,
        fontWeight: updates.headerFontWeight,
        fontStyle: updates.headerFontStyle,
        textColor: updates.headerTextColor,
        backgroundColor: updates.headerBackgroundColor,
        horizontalAlign: updates.headerTextAlign,
        verticalAlign: updates.headerVerticalAlign,
        applyBorders: updates.applyHeaderBorders,
        borderStyle: updates.headerBorderStyle,
        borderWidth: updates.headerBorderWidth ? parseInt(updates.headerBorderWidth.replace('px', '')) : 1,
        borderColor: updates.headerBorderColor,
        borderSides: updates.headerBorderSides
      };
      // Filter out null values but keep false values
      Object.keys(mappedUpdates).forEach(key => {
        if (mappedUpdates[key] === null || mappedUpdates[key] === undefined) {
          delete mappedUpdates[key];
        }
      });
      console.log('Mapped header updates:', mappedUpdates);
    } else if (tabName === 'cell') {
      // Map all cell properties from CellTab format to V2 format
      mappedUpdates = {
        fontFamily: updates.cellFontFamily,
        fontSize: updates.cellFontSize,
        fontWeight: updates.cellFontWeight,
        fontStyle: updates.cellFontStyle,
        textColor: updates.cellTextColor,
        backgroundColor: updates.cellBackgroundColor,
        horizontalAlign: updates.cellTextAlign,
        verticalAlign: updates.cellVerticalAlign,
        applyBorders: updates.applyCellBorders,
        borderStyle: updates.cellBorderStyle,
        borderWidth: updates.cellBorderWidth ? parseInt(updates.cellBorderWidth.replace('px', '')) : 1,
        borderColor: updates.cellBorderColor,
        borderSides: updates.cellBorderSides,
        wrapText: updates.wrapText,
        autoHeight: updates.autoHeight
      };
      // Filter out null values but keep false values
      Object.keys(mappedUpdates).forEach(key => {
        if (mappedUpdates[key] === null || mappedUpdates[key] === undefined) {
          delete mappedUpdates[key];
        }
      });
      console.log('Mapped cell updates:', mappedUpdates);
    }

    if (state.bulkUpdateMode) {
      // Update settings for all selected columns
      console.log('Bulk update - selected columns:', state.selectedColumns);
      const updatedMap = { ...state.columnSettingsMap };
      let hasChanges = false;

      for (const columnId of state.selectedColumns) {
        const existing = updatedMap[columnId] || { columnId };
        console.log('Updating column:', columnId, 'existing:', existing);
        
        // Create a properly nested update object
        const updateObject: Partial<ColumnSettings> = {
          ...existing,
          [tabName]: {
            ...(existing[tabName] || {}),
            ...mappedUpdates
          },
          lastModified: Date.now(),
          isDirty: true
        };
        
        console.log('Updated column:', columnId, 'with:', updateObject);
        updatedMap[columnId] = updateObject as ColumnSettings;
        hasChanges = true;
      }

      setState(prev => ({
        ...prev,
        columnSettingsMap: updatedMap,
        modifiedColumns: new Set([...prev.modifiedColumns, ...state.selectedColumns]),
        hasChanges: hasChanges || prev.hasChanges
      }));
      console.log('State updated with new map:', updatedMap);
    } else if (state.selectedColumn) {
      // Update settings for single column
      const columnId = state.selectedColumn;
      const existing = state.columnSettingsMap[columnId] || { columnId };
      
      const updatedSettings: ColumnSettings = {
        ...existing,
        [tabName]: {
          ...(existing[tabName] || {}),
          ...mappedUpdates
        },
        lastModified: Date.now(),
        isDirty: true
      };

      setState(prev => ({
        ...prev,
        columnSettingsMap: {
          ...prev.columnSettingsMap,
          [columnId]: updatedSettings
        },
        modifiedColumns: new Set([...prev.modifiedColumns].concat(columnId)),
        hasChanges: true
      }));
    }
  }, [state.bulkUpdateMode, state.selectedColumn, state.selectedColumns, state.columnSettingsMap, bulkSettings]);

  /**
   * Apply changes to grid
   */
  const applyChanges = useCallback(async () => {
    setIsApplying(true);
    setState(prev => ({ ...prev, error: null }));

    try {
      // Validate all modified settings
      const errors: string[] = [];
      for (const columnId of state.modifiedColumns) {
        const settings = state.columnSettingsMap[columnId];
        if (settings) {
          const validationErrors = validateColumnSettings(settings);
          if (validationErrors.length > 0) {
            errors.push(`${columnId}: ${validationErrors.join(', ')}`);
          }
        }
      }

      if (errors.length > 0) {
        throw new Error(`Validation failed: ${errors.join('; ')}`);
      }

      // Get current column definitions
      const currentColDefs = gridApi.getColumnDefs() as ColDef[];
      
      // Apply settings to column definitions
      const updatedColDefs = currentColDefs.map(col => {
        if (!col.field) return col;
        
        const settings = state.columnSettingsMap[col.field];
        if (!settings || !state.modifiedColumns.has(col.field)) {
          return col;
        }
        
        console.log('Applying settings for column:', col.field, settings);
        
        // Apply settings to create new column definition
        const convertedSettings = convertSettingsToColDef(settings);
        console.log('Converted settings:', convertedSettings);
        
        const updatedColDef = {
          ...col,
          ...convertedSettings
        };
        
        console.log('Updated column definition:', updatedColDef);
        
        return updatedColDef;
      });

      // First log what we're trying to apply
      console.log('Applying updated column definitions:', updatedColDefs);
      
      // Update grid with new column definitions
      gridApi.setGridOption('columnDefs', updatedColDefs);
      
      // Refresh the grid - no need for applyColumnDefOrder in v33
      gridApi.refreshHeader();
      gridApi.refreshCells({ force: true });
      
      // Log the actual column definitions after update
      setTimeout(() => {
        const appliedDefs = gridApi.getColumnDefs();
        console.log('Applied column definitions:', appliedDefs);
      }, 100);
      
      // Save to profile
      const saved = await saveToProfile();
      
      if (saved) {
        // Clear modification tracking
        setState(prev => ({
          ...prev,
          modifiedColumns: new Set(),
          hasChanges: false
        }));

        toast({
          title: "Changes Applied",
          description: "Column settings have been applied successfully.",
          duration: 3000
        });

        // Close dialog after successful apply
        onOpenChange(false);
      }

    } catch (error) {
      console.error('Error applying column settings:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to apply changes';
      
      setState(prev => ({
        ...prev,
        error: errorMessage
      }));
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
        duration: 5000
      });
    } finally {
      setIsApplying(false);
    }
  }, [state, gridApi, onOpenChange]);

  /**
   * Save settings to profile
   */
  const saveToProfile = useCallback(async (): Promise<boolean> => {
    try {
      // Get column state for additional data
      const columnState = gridApi.getColumnState();
      const columnOrder = columnState.map(s => s.colId || '');
      const hiddenColumns = columnState
        .filter(s => s.hide)
        .map(s => s.colId || '');

      // Save to profile
      const saved = ColumnSettingsPersistenceV2.saveColumnSettings(
        state.columnSettingsMap,
        {
          columnOrder,
          hiddenColumns,
          columnState
        }
      );

      if (saved && profileManager) {
        // Also save the current profile
        await profileManager.saveCurrentProfile();
      }

      return saved;
    } catch (error) {
      console.error('Error saving to profile:', error);
      return false;
    }
  }, [state.columnSettingsMap, gridApi, profileManager]);

  /**
   * Reset changes for selected columns
   */
  const handleReset = useCallback(() => {
    if (state.bulkUpdateMode) {
      // Reset all selected columns
      const updatedMap = { ...state.columnSettingsMap };
      const updatedModified = new Set(state.modifiedColumns);
      
      for (const columnId of state.selectedColumns) {
        // Re-extract settings from base column definitions
        const baseCol = state.baseColumnDefs.find(c => c.field === columnId);
        if (baseCol) {
          updatedMap[columnId] = extractSettingsFromColDef(baseCol, columnId);
          updatedModified.delete(columnId);
        }
      }
      
      setState(prev => ({
        ...prev,
        columnSettingsMap: updatedMap,
        modifiedColumns: updatedModified,
        hasChanges: updatedModified.size > 0,
        selectedColumns: []
      }));
    } else if (state.selectedColumn) {
      // Reset single column
      const baseCol = state.baseColumnDefs.find(c => c.field === state.selectedColumn);
      if (baseCol) {
        const resetSettings = extractSettingsFromColDef(baseCol, state.selectedColumn);
        const updatedModified = new Set(state.modifiedColumns);
        updatedModified.delete(state.selectedColumn);
        
        setState(prev => ({
          ...prev,
          columnSettingsMap: {
            ...prev.columnSettingsMap,
            [state.selectedColumn]: resetSettings
          },
          modifiedColumns: updatedModified,
          hasChanges: updatedModified.size > 0
        }));
      }
    }
  }, [state]);

  /**
   * Toggle bulk update mode
   */
  const toggleBulkMode = useCallback(() => {
    setState(prev => ({
      ...prev,
      bulkUpdateMode: !prev.bulkUpdateMode,
      selectedColumns: []
    }));
    
    // Reset bulk settings when toggling mode
    if (!state.bulkUpdateMode) {
      setBulkSettings({
        header: {
          headerName: '',
          headerFontFamily: 'Arial',
          headerFontSize: '14px',
          headerFontWeight: 'normal',
          headerFontStyle: '',
          headerTextColor: null,
          headerBackgroundColor: null,
          headerTextAlign: 'left',
          headerVerticalAlign: 'middle',
          applyHeaderBorders: false,
          headerBorderStyle: 'solid',
          headerBorderWidth: '1px',
          headerBorderColor: '#000000',
          headerBorderSides: 'all'
        },
        cell: {
          cellFontFamily: 'Arial',
          cellFontSize: '12px',
          cellFontWeight: 'normal',
          cellFontStyle: '',
          cellTextColor: null,
          cellBackgroundColor: null,
          cellTextAlign: 'left',
          cellVerticalAlign: 'middle',
          applyCellBorders: false,
          cellBorderStyle: 'solid',
          cellBorderWidth: '1px',
          cellBorderColor: '#E5E7EB',
          cellBorderSides: 'all'
        },
        formatter: {},
        filter: {},
        editor: {}
      });
    }
  }, [state.bulkUpdateMode]);

  // Get current settings for the active tab
  const currentSettings = useMemo(() => {
    if (state.bulkUpdateMode) {
      // For bulk mode, use the bulk settings for the active tab
      return bulkSettings[state.activeTab] || {};
    } else {
      const settings = state.columnSettingsMap[state.selectedColumn];
      if (!settings) return {};
      
      switch (state.activeTab) {
        case 'header':
          // Map V2 header settings to HeaderTab format
          const headerSettings = settings.header || {};
          return {
            headerName: headerSettings.displayName || '',
            headerFontFamily: headerSettings.fontFamily || 'Arial',
            headerFontSize: headerSettings.fontSize || '14px',
            headerFontWeight: headerSettings.fontWeight || 'normal',
            headerFontStyle: headerSettings.fontStyle || 'normal',
            headerTextColor: headerSettings.textColor || null,
            headerBackgroundColor: headerSettings.backgroundColor || null,
            headerTextAlign: headerSettings.horizontalAlign || 'left',
            headerVerticalAlign: headerSettings.verticalAlign || 'middle',
            applyHeaderBorders: headerSettings.applyBorders || false,
            headerBorderStyle: headerSettings.borderStyle || 'none',
            headerBorderWidth: headerSettings.borderWidth ? `${headerSettings.borderWidth}px` : '1px',
            headerBorderColor: headerSettings.borderColor || '#000000',
            headerBorderSides: headerSettings.borderSides || 'all'
          };
        case 'cell':
          return settings.cell || {};
        case 'formatter':
          return settings.formatter || {};
        case 'filter':
          return settings.filter || {};
        case 'editors':
          return settings.editor || {};
        default:
          return {};
      }
    }
  }, [state.selectedColumn, state.columnSettingsMap, state.activeTab, state.bulkUpdateMode, bulkSettings]);

  // Check if apply button should be disabled
  const isApplyDisabled = useMemo(() => {
    if (state.isLoading || isApplying) return true;
    if (state.bulkUpdateMode) {
      return state.selectedColumns.length === 0 || !state.hasChanges;
    }
    return !state.hasChanges || !state.selectedColumn;
  }, [state, isApplying]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[625px] w-[625px] h-[650px] flex flex-col p-0 gap-0">
        <DialogHeader className="px-4 py-3 border-b flex-shrink-0">
          <div className="flex items-start justify-between pr-8">
            <div>
              <DialogTitle className="text-base font-semibold">Column Settings</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Configure display and behavior for grid columns
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2 ml-auto mt-6">
              <Label htmlFor="bulkUpdate" className="text-xs font-normal cursor-pointer text-muted-foreground">
                Bulk Update Mode
              </Label>
              <Switch
                id="bulkUpdate"
                checked={state.bulkUpdateMode}
                onCheckedChange={toggleBulkMode}
                className="scale-75"
              />
            </div>
          </div>
        </DialogHeader>

        {state.error && (
          <div className="px-4 py-2 bg-destructive/15 border-b border-destructive/30">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{state.error}</span>
            </div>
          </div>
        )}

        <div className="flex flex-1 overflow-hidden">
          {/* Column list panel */}
          <ColumnListPanel
            columns={state.columns}
            selectedColumn={state.selectedColumn}
            selectedColumns={state.selectedColumns}
            bulkUpdateMode={state.bulkUpdateMode}
            searchTerm={state.searchTerm}
            modifiedColumns={state.modifiedColumns}
            onColumnSelect={handleColumnSelect}
            onSearchChange={(term) => setState(prev => ({ ...prev, searchTerm: term }))}
          />

          {/* Settings panel */}
          <div className="flex-1 flex flex-col border-l bg-background">
            <Tabs
              value={state.activeTab}
              onValueChange={(value) => setState(prev => ({ ...prev, activeTab: value as any }))}
              className="flex-1 flex flex-col"
            >
              <TabsList className="w-full justify-start rounded-none border-b px-3 bg-transparent h-9">
                <TabsTrigger value="header" className="text-xs">Header</TabsTrigger>
                <TabsTrigger value="cell" className="text-xs">Cell</TabsTrigger>
                <TabsTrigger value="formatter" className="text-xs">Formatter</TabsTrigger>
                <TabsTrigger value="filter" className="text-xs">Filter</TabsTrigger>
                <TabsTrigger value="editors" className="text-xs">Editors</TabsTrigger>
              </TabsList>

              <div className="flex-1 overflow-hidden">
                <TabsContent value="header" className="h-full m-0 p-4 overflow-y-auto dialog-scrollbar">
                  <HeaderTab
                    settings={currentSettings}
                    onSettingsChange={(updates) => updateColumnSettings('header', updates)}
                    isModified={state.modifiedColumns.has(state.selectedColumn)}
                    bulkUpdateMode={state.bulkUpdateMode}
                  />
                </TabsContent>

                <TabsContent value="cell" className="h-full m-0 p-4 overflow-y-auto dialog-scrollbar">
                  <CellTab
                    settings={currentSettings}
                    onSettingsChange={(updates) => updateColumnSettings('cell', updates)}
                    isModified={state.modifiedColumns.has(state.selectedColumn)}
                    bulkUpdateMode={state.bulkUpdateMode}
                  />
                </TabsContent>

                <TabsContent value="formatter" className="h-full m-0 p-4 overflow-y-auto dialog-scrollbar">
                  <FormatterTab
                    settings={currentSettings}
                    onSettingsChange={(updates) => updateColumnSettings('formatter', updates)}
                    isModified={state.modifiedColumns.has(state.selectedColumn)}
                    bulkUpdateMode={state.bulkUpdateMode}
                  />
                </TabsContent>

                <TabsContent value="filter" className="h-full m-0 p-4 overflow-y-auto dialog-scrollbar">
                  <FilterTab
                    settings={currentSettings}
                    onSettingsChange={(updates) => updateColumnSettings('filter', updates)}
                    isModified={state.modifiedColumns.has(state.selectedColumn)}
                    bulkUpdateMode={state.bulkUpdateMode}
                  />
                </TabsContent>

                <TabsContent value="editors" className="h-full m-0 p-4 overflow-y-auto dialog-scrollbar">
                  <EditorsTab
                    settings={currentSettings}
                    onSettingsChange={(updates) => updateColumnSettings('editor', updates)}
                    isModified={state.modifiedColumns.has(state.selectedColumn)}
                    bulkUpdateMode={state.bulkUpdateMode}
                  />
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>

        <DialogFooter className="border-t px-4 py-2 flex-shrink-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} className={`${BUTTON_CLASSES}`}>
            Cancel
          </Button>
          <div className="flex gap-1.5">
            <Button variant="outline" onClick={handleReset} className={`${BUTTON_CLASSES}`}>
              {state.bulkUpdateMode ? "Clear Selection" : "Reset"}
            </Button>
            <Button
              onClick={applyChanges}
              disabled={isApplyDisabled}
              className={`gap-1.5 ${BUTTON_CLASSES}`}
            >
              {isApplying ? (
                <>
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Applying...
                </>
              ) : (
                <>
                  <Check className="w-3 h-3" />
                  {state.bulkUpdateMode
                    ? `Apply to ${state.selectedColumns.length} Column${state.selectedColumns.length !== 1 ? 's' : ''}`
                    : "Apply Changes"
                  }
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}