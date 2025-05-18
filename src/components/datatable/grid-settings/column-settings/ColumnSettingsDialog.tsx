import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Check } from 'lucide-react';
import { GridApi, ColDef } from 'ag-grid-community';
import { cn } from '@/lib/utils';

// Import custom styles for scrollbar
import './column-settings.css';

// Import sub-components
import { ColumnListPanel } from './components/ColumnListPanel';
import { HeaderTab, CellTab, FormatterTab, FilterTab, EditorsTab } from './components/tabs';

// Import utilities
import {
  generateHeaderClass,
  generateHeaderStyle,
  generateCellClass,
  generateCellStyle,
  createValueFormatter,
  formatDate,
  filterColumns
} from './utils';

// Import types
import type {
  ColumnSettingsDialogProps,
  ColumnSettingsState,
  ColumnSettings,
  HeaderSettings,
  CellSettings,
  FormatterSettings,
  FilterSettings,
  EditorSettings
} from './types';

/**
 * Column Settings Dialog - Main component
 * Provides comprehensive column configuration interface for AG Grid
 */
export function ColumnSettingsDialog({
  open,
  onOpenChange,
  gridApi,
  column
}: ColumnSettingsDialogProps) {
  // State management
  const [state, setState] = useState<ColumnSettingsState>({
    selectedColumn: '',
    selectedColumns: [],
    bulkUpdateMode: false,
    settings: {},
    modifiedColumns: new Set(),
    hasChanges: false,
    activeTab: 'header',
    searchTerm: '',
    columns: []
  });

  // Store settings for each column to persist changes when switching between columns
  const [columnSettingsMap, setColumnSettingsMap] = useState<Record<string, ColumnSettings>>({});

  // Extract settings from column definition
  const extractSettingsFromColumn = useCallback((col: ColDef): ColumnSettings => {
    const cellStyle = typeof col.cellStyle === 'function' ? {} : col.cellStyle;
    const headerStyle = typeof col.headerStyle === 'function' ? {} : col.headerStyle || {};
    
    return {
      header: {
        headerName: col.headerName,
        headerClass: col.headerClass,
        headerGroup: col.headerGroup,
        // Extract font settings from headerStyle if present
        fontFamily: headerStyle.fontFamily || 'default',
        fontSize: headerStyle.fontSize || 'default',
        fontWeight: headerStyle.fontWeight || 'default',
        textStyle: [],
        // Extract color settings
        textColor: headerStyle.color || '#000000',
        textColorEnabled: !!headerStyle.color,
        backgroundColor: headerStyle.backgroundColor || '#ffffff',
        backgroundEnabled: !!headerStyle.backgroundColor,
        // Extract border settings
        borderStyle: 'solid',
        borderSides: 'all',
        borderWidth: 1,
        borderColor: '#cccccc',
        applyBorders: !!headerStyle.border,
        borderColorEnabled: false,
        // Alignment
        verticalAlign: 'middle'
      },
      cell: {
        horizontalAlign: cellStyle?.textAlign || cellStyle?.justifyContent || 'left',
        verticalAlign: cellStyle?.alignSelf || cellStyle?.alignItems || 'middle',
        wrapText: col.wrapText || false,
        autoHeight: col.autoHeight || false,
        cellClass: col.cellClass,
        cellRenderer: col.cellRenderer,
        useFullWidthRow: false,
        suppressCellFlash: col.suppressCellFlash || false,
        includeButtonsInRowDrag: false
      },
      formatter: {
        type: 'text',
        decimals: 2,
        use1000Separator: true,
        currency: '$',
        dateFormat: 'MM/DD/YYYY',
        prefix: '',
        suffix: ''
      },
      filter: {
        filter: col.filter || 'agTextColumnFilter',
        floatingFilter: col.floatingFilter || false,
        filterable: col.filterable !== false,
        filterMenuTab: col.filterMenuTab || 'filtersTab',
        suppressFilterButton: col.suppressFilterButton || false,
        includeInQuickFilter: col.includeInQuickFilter !== false,
        quickFilterText: col.quickFilterText || '',
        defaultFilterOption: 'contains',
        caseSensitive: false,
        suppressKeyboardEvent: col.suppressKeyboardEvent || false
      },
      editor: {
        editable: col.editable !== false,
        cellEditor: col.cellEditor || 'agTextCellEditor',
        singleClickEdit: col.singleClickEdit || false,
        enterMovesDown: col.enterMovesDown !== false,
        enterMovesDownAfterEdit: col.enterMovesDownAfterEdit !== false,
        stopEditingWhenCellsLoseFocus: col.stopEditingWhenCellsLoseFocus !== false,
        suppressPaste: col.suppressPaste || false,
        navigateToNextCell: false,
        cellDataType: col.cellDataType
      }
    };
  }, []);

  // Load columns when dialog opens
  useEffect(() => {
    if (open && gridApi) {
      const columnDefs = gridApi.getColumnDefs() as ColDef[];
      if (columnDefs) {
        // If column is provided, use it. Otherwise only select first if no selection exists
        const shouldSelectColumn = column?.field || (!state.selectedColumn ? columnDefs[0]?.field : state.selectedColumn) || '';
        
        setState(prev => {
          // Check if we have saved settings for this column
          const savedSettings = columnSettingsMap[shouldSelectColumn];
          const columnDef = columnDefs.find(c => c.field === shouldSelectColumn);
          
          return {
            ...prev,
            columns: columnDefs,
            selectedColumn: shouldSelectColumn,
            settings: savedSettings || (columnDef ? extractSettingsFromColumn(columnDef) : prev.settings)
          };
        });
      }
    }
  }, [open, gridApi, column, extractSettingsFromColumn, state.selectedColumn, columnSettingsMap]);

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setState({
        selectedColumn: '',
        selectedColumns: [],
        bulkUpdateMode: false,
        settings: {},
        modifiedColumns: new Set(),
        hasChanges: false,
        activeTab: 'header',
        searchTerm: '',
        columns: []
      });
      setColumnSettingsMap({});
    }
  }, [open]);

  // Handle column selection
  const handleColumnSelect = useCallback((columnField: string) => {
    if (state.bulkUpdateMode) {
      setState(prev => ({
        ...prev,
        selectedColumns: prev.selectedColumns.includes(columnField)
          ? prev.selectedColumns.filter(f => f !== columnField)
          : [...prev.selectedColumns, columnField]
      }));
    } else {
      // Save current settings before switching
      if (state.selectedColumn && state.settings) {
        setColumnSettingsMap(prev => ({
          ...prev,
          [state.selectedColumn]: state.settings
        }));
      }

      const col = state.columns.find(c => c.field === columnField);
      if (col) {
        // Load settings from map if available, otherwise extract from column
        const savedSettings = columnSettingsMap[columnField];
        setState(prev => ({
          ...prev,
          selectedColumn: columnField,
          settings: savedSettings || extractSettingsFromColumn(col)
        }));
      }
    }
  }, [state.bulkUpdateMode, state.columns, state.selectedColumn, state.settings, columnSettingsMap, extractSettingsFromColumn]);

  // Handle settings update
  const updateSettings = useCallback((category: keyof ColumnSettings, updates: any) => {
    setState(prev => {
      const newSettings = {
        ...prev.settings,
        [category]: {
          ...prev.settings[category],
          ...updates
        }
      };
      
      // Also update the settings map
      if (prev.selectedColumn) {
        setColumnSettingsMap(map => ({
          ...map,
          [prev.selectedColumn]: newSettings
        }));
      }
      
      return {
        ...prev,
        settings: newSettings,
        hasChanges: true,
        modifiedColumns: new Set([...prev.modifiedColumns, prev.selectedColumn])
      };
    });
  }, []);

  // Apply changes to grid
  const applyChanges = useCallback(() => {
    if (!gridApi) return;

    const columnDefs = gridApi.getColumnDefs() as ColDef[];
    if (!columnDefs) return;

    const updatedColumnDefs = columnDefs.map(col => {
      const shouldUpdate = state.bulkUpdateMode
        ? state.selectedColumns.includes(col.field || '')
        : col.field === state.selectedColumn;

      if (shouldUpdate) {
        return applySettingsToColumn(col, state.settings);
      }
      return col;
    });

    gridApi.setGridOption('columnDefs', updatedColumnDefs);
    gridApi.refreshCells({ force: true });
    
    setState(prev => ({
      ...prev,
      hasChanges: false,
      modifiedColumns: new Set()
    }));
  }, [gridApi, state]);

  // Apply settings to column definition
  const applySettingsToColumn = useCallback((col: ColDef, settings: ColumnSettings): ColDef => {
    const newCol = { ...col };

    // Apply header settings
    if (settings.header) {
      if (settings.header.headerName !== undefined) {
        newCol.headerName = settings.header.headerName;
      }
      // Apply header styles using utilities
      newCol.headerClass = generateHeaderClass(settings.header);
      newCol.headerStyle = generateHeaderStyle(settings.header);
      if (settings.header.headerGroup) {
        newCol.headerTooltip = settings.header.headerGroup;
      }
    }

    // Apply cell settings
    if (settings.cell) {
      // Create cellStyle function based on alignment settings
      const cellStyle: any = {};
      
      if (settings.cell.horizontalAlign) {
        cellStyle.textAlign = settings.cell.horizontalAlign;
        cellStyle.justifyContent = settings.cell.horizontalAlign === 'center' ? 'center' : 
                                  settings.cell.horizontalAlign === 'right' ? 'flex-end' : 'flex-start';
      }
      
      if (settings.cell.verticalAlign) {
        cellStyle.alignItems = settings.cell.verticalAlign === 'top' ? 'flex-start' :
                              settings.cell.verticalAlign === 'bottom' ? 'flex-end' : 'center';
      }
      
      newCol.cellStyle = () => cellStyle;
      
      if (settings.cell.wrapText !== undefined) {
        newCol.wrapText = settings.cell.wrapText;
      }
      if (settings.cell.autoHeight !== undefined) {
        newCol.autoHeight = settings.cell.autoHeight;
      }
      if (settings.cell.cellClass) {
        newCol.cellClass = settings.cell.cellClass;
      }
      if (settings.cell.cellRenderer) {
        newCol.cellRenderer = settings.cell.cellRenderer;
      }
      if (settings.cell.suppressCellFlash !== undefined) {
        newCol.suppressCellFlash = settings.cell.suppressCellFlash;
      }
    }

    // Apply formatter settings
    if (settings.formatter && settings.formatter.type !== 'text') {
      newCol.valueFormatter = createValueFormatter(settings.formatter);
    }

    // Apply filter settings
    if (settings.filter) {
      if (settings.filter.filter) {
        newCol.filter = settings.filter.filter;
      }
      if (settings.filter.floatingFilter !== undefined) {
        newCol.floatingFilter = settings.filter.floatingFilter;
      }
      if (settings.filter.filterable !== undefined) {
        newCol.suppressFilter = !settings.filter.filterable;
      }
      if (settings.filter.filterMenuTab) {
        newCol.filterMenuTab = settings.filter.filterMenuTab;
      }
      if (settings.filter.suppressFilterButton !== undefined) {
        newCol.suppressFilterButton = settings.filter.suppressFilterButton;
      }
      if (settings.filter.includeInQuickFilter !== undefined) {
        newCol.suppressQuickFilter = !settings.filter.includeInQuickFilter;
      }
      if (settings.filter.quickFilterText) {
        newCol.quickFilterText = settings.filter.quickFilterText;
      }
      if (settings.filter.suppressKeyboardEvent !== undefined) {
        newCol.suppressKeyboardEvent = settings.filter.suppressKeyboardEvent;
      }
    }

    // Apply editor settings
    if (settings.editor) {
      if (settings.editor.editable !== undefined) {
        newCol.editable = settings.editor.editable;
      }
      if (settings.editor.cellEditor) {
        newCol.cellEditor = settings.editor.cellEditor;
      }
      if (settings.editor.singleClickEdit !== undefined) {
        newCol.singleClickEdit = settings.editor.singleClickEdit;
      }
      if (settings.editor.enterMovesDown !== undefined) {
        newCol.enterMovesDown = settings.editor.enterMovesDown;
      }
      if (settings.editor.enterMovesDownAfterEdit !== undefined) {
        newCol.enterMovesDownAfterEdit = settings.editor.enterMovesDownAfterEdit;
      }
      if (settings.editor.stopEditingWhenCellsLoseFocus !== undefined) {
        newCol.stopEditingWhenCellsLoseFocus = settings.editor.stopEditingWhenCellsLoseFocus;
      }
      if (settings.editor.suppressPaste !== undefined) {
        newCol.suppressPaste = settings.editor.suppressPaste;
      }
      if (settings.editor.cellDataType) {
        newCol.cellDataType = settings.editor.cellDataType;
      }
    }

    return newCol;
  }, []);

  // Value formatter and date formatting are now imported from utils

  // Reset changes
  const handleReset = useCallback(() => {
    if (state.bulkUpdateMode) {
      setState(prev => ({ ...prev, selectedColumns: [] }));
    } else if (state.selectedColumn) {
      const col = state.columns.find(c => c.field === state.selectedColumn);
      if (col) {
        const originalSettings = extractSettingsFromColumn(col);
        setState(prev => {
          const newModifiedColumns = new Set(prev.modifiedColumns);
          newModifiedColumns.delete(state.selectedColumn);
          return {
            ...prev,
            settings: originalSettings,
            modifiedColumns: newModifiedColumns,
            hasChanges: newModifiedColumns.size > 0
          };
        });
        // Remove from settings map to reset to original
        setColumnSettingsMap(prev => {
          const newMap = { ...prev };
          delete newMap[state.selectedColumn];
          return newMap;
        });
      }
    }
  }, [state, extractSettingsFromColumn]);

  // Toggle bulk update mode
  const toggleBulkMode = useCallback(() => {
    setState(prev => ({
      ...prev,
      bulkUpdateMode: !prev.bulkUpdateMode,
      selectedColumns: [],
      selectedColumn: ''
    }));
  }, []);

  // Check if apply button should be disabled
  const isApplyDisabled = useMemo(() => {
    if (state.bulkUpdateMode) {
      return state.selectedColumns.length === 0 || !state.hasChanges;
    }
    return !state.hasChanges || !state.selectedColumn;
  }, [state]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[85vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 py-4 border-b flex-shrink-0">
          <div className="flex items-center justify-between pr-8">
            <div>
              <DialogTitle className="text-lg font-semibold">Column Settings</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground mt-1">
                Configure display and behavior for grid columns
              </DialogDescription>
            </div>
            <div className="flex items-center gap-3 ml-auto">
              <Label htmlFor="bulkUpdate" className="text-sm font-normal cursor-pointer">
                Bulk Update Mode
              </Label>
              <Checkbox
                id="bulkUpdate"
                checked={state.bulkUpdateMode}
                onCheckedChange={toggleBulkMode}
                className="h-4 w-4"
              />
            </div>
          </div>
        </DialogHeader>

        <div className="flex flex-1 overflow-hidden">
          {/* Column list panel - 25% width */}
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

          {/* Settings panel - 75% width */}
          <div className="flex-1 flex flex-col border-l bg-background">
            <Tabs
              value={state.activeTab}
              onValueChange={(value) => setState(prev => ({ ...prev, activeTab: value as any }))}
              className="flex-1 flex flex-col"
            >
              <TabsList className="w-full justify-start rounded-none border-b px-4 bg-transparent">
                <TabsTrigger value="header" className="rounded-none">Header</TabsTrigger>
                <TabsTrigger value="cell" className="rounded-none">Cell</TabsTrigger>
                <TabsTrigger value="formatter" className="rounded-none">Formatter</TabsTrigger>
                <TabsTrigger value="filter" className="rounded-none">Filter</TabsTrigger>
                <TabsTrigger value="editors" className="rounded-none">Editors</TabsTrigger>
              </TabsList>

              <div className="flex-1 overflow-hidden">
                <TabsContent value="header" className="h-full m-0 p-6 overflow-y-auto dialog-scrollbar">
                  <HeaderTab
                    settings={state.settings.header || {}}
                    onSettingsChange={(updates) => updateSettings('header', updates)}
                    isModified={state.modifiedColumns.has(state.selectedColumn)}
                    bulkUpdateMode={state.bulkUpdateMode}
                  />
                </TabsContent>

                <TabsContent value="cell" className="h-full m-0 p-6 overflow-y-auto dialog-scrollbar">
                  <CellTab
                    settings={state.settings.cell || {}}
                    onSettingsChange={(updates) => updateSettings('cell', updates)}
                    isModified={state.modifiedColumns.has(state.selectedColumn)}
                    bulkUpdateMode={state.bulkUpdateMode}
                  />
                </TabsContent>

                <TabsContent value="formatter" className="h-full m-0 p-6 overflow-y-auto dialog-scrollbar">
                  <FormatterTab
                    settings={state.settings.formatter || {}}
                    onSettingsChange={(updates) => updateSettings('formatter', updates)}
                    isModified={state.modifiedColumns.has(state.selectedColumn)}
                    bulkUpdateMode={state.bulkUpdateMode}
                  />
                </TabsContent>

                <TabsContent value="filter" className="h-full m-0 p-6 overflow-y-auto dialog-scrollbar">
                  <FilterTab
                    settings={state.settings.filter || {}}
                    onSettingsChange={(updates) => updateSettings('filter', updates)}
                    isModified={state.modifiedColumns.has(state.selectedColumn)}
                    bulkUpdateMode={state.bulkUpdateMode}
                  />
                </TabsContent>

                <TabsContent value="editors" className="h-full m-0 p-6 overflow-y-auto dialog-scrollbar">
                  <EditorsTab
                    settings={state.settings.editor || {}}
                    onSettingsChange={(updates) => updateSettings('editor', updates)}
                    isModified={state.modifiedColumns.has(state.selectedColumn)}
                    bulkUpdateMode={state.bulkUpdateMode}
                  />
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>

        <DialogFooter className="border-t px-6 py-3 flex-shrink-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleReset}>
              {state.bulkUpdateMode ? "Clear Selection" : "Reset"}
            </Button>
            <Button
              onClick={applyChanges}
              disabled={isApplyDisabled}
              className="gap-2"
            >
              <Check className="w-4 h-4" />
              {state.bulkUpdateMode
                ? `Apply to ${state.selectedColumns.length} Column${state.selectedColumns.length !== 1 ? 's' : ''}`
                : "Apply Changes"
              }
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}