import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Check } from 'lucide-react';
import { ColDef } from 'ag-grid-community';
import { BUTTON_CLASSES, FORM_CONTROL_HEIGHTS } from './style-utils';
import { ColumnSettingsPersistence } from '@/components/datatable/utils/column-settings-persistence';

// Import custom styles for scrollbar
import './column-settings.css';

// Import sub-components
import { ColumnListPanel } from './components/ColumnListPanel';
import { HeaderTab, CellTab, FormatterTab, FilterTab, EditorsTab } from './components/tabs';

// Import utilities
import {
  generateHeaderClass,
  generateHeaderStyle,
  createValueFormatter
} from './utils';

// Import types
import type {
  ColumnSettingsDialogProps,
  ColumnSettingsState,
  ColumnSettings
} from './types';


/**
 * Column Settings Dialog - Main component
 * Provides comprehensive column configuration interface for AG Grid
 */
export function ColumnSettingsDialog({
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
    settings: {},
    modifiedColumns: new Set(),
    hasChanges: false,
    activeTab: 'header',
    searchTerm: '',
    columns: []
  });
  
  // Loading state for apply process
  const [isApplying, setIsApplying] = useState(false);

  // Store settings for each column to persist changes when switching between columns
  const [columnSettingsMap, setColumnSettingsMap] = useState<Record<string, ColumnSettings>>({});
  
  // Cache for generated styles to avoid recomputation
  const styleCache = useRef(new Map<string, any>());
  const headerStyleCache = useRef(new Map<string, any>());

  // Extract settings from column definition
  const extractSettingsFromColumn = useCallback((col: ColDef): ColumnSettings => {
    if (!col) {
      return {} as ColumnSettings;
    }
    
    const cellStyle = typeof col.cellStyle === 'function' ? {} : (col.cellStyle || {});
    const headerStyle = typeof col.headerStyle === 'function' ? {} : (col.headerStyle || {});
    
    // Handle deprecated properties - extract from v33 properties or deprecated ones
    const cellFlashEnabled = 'enableCellChangeFlash' in col 
      ? col.enableCellChangeFlash !== false 
      : true;
    
    return {
      header: {
        headerName: col.headerName,
        headerClass: Array.isArray(col.headerClass) ? col.headerClass.join(' ') : col.headerClass as string | undefined,
        headerGroup: (col as any).headerGroup,
        // Map to HeaderTab property names
        headerFontFamily: headerStyle.fontFamily || 'Arial',
        headerFontSize: headerStyle.fontSize || '14px',
        headerFontWeight: headerStyle.fontWeight || 'normal',
        headerFontStyle: '',
        headerTextColor: headerStyle.color || null,
        headerBackgroundColor: headerStyle.backgroundColor || null,
        headerTextAlign: headerStyle.textAlign || 'left',
        headerVerticalAlign: headerStyle.alignItems === 'flex-start' ? 'top' :
                            headerStyle.alignItems === 'flex-end' ? 'bottom' : 'middle',
        // Border settings
        applyHeaderBorders: !!headerStyle.border,
        headerBorderStyle: 'solid',
        headerBorderWidth: '1px',
        headerBorderColor: headerStyle.borderColor || null,
        headerBorderSides: 'all'
      },
      cell: {
        // Map to CellTab property names
        cellFontFamily: cellStyle?.fontFamily || 'Arial',
        cellFontSize: cellStyle?.fontSize || '12px', 
        cellFontWeight: cellStyle?.fontWeight || 'normal',
        cellFontStyle: '',
        cellTextColor: cellStyle?.color || null,
        cellBackgroundColor: cellStyle?.backgroundColor || null,
        cellTextAlign: cellStyle?.textAlign || 'left',
        cellVerticalAlign: cellStyle?.alignItems === 'flex-start' ? 'top' :
                          cellStyle?.alignItems === 'flex-end' ? 'bottom' : 'middle',
        // Border settings
        applyCellBorders: !!cellStyle?.border,
        cellBorderStyle: 'solid',
        cellBorderWidth: '1px',
        cellBorderColor: cellStyle?.borderColor || null,
        cellBorderSides: 'all',
        // Other settings
        wrapText: col.wrapText || false,
        autoHeight: col.autoHeight || false,
        cellClass: Array.isArray(col.cellClass) ? col.cellClass.join(' ') : col.cellClass as string | undefined,
        cellRenderer: col.cellRenderer,
        suppressCellFlash: !cellFlashEnabled // Internal setting remains as suppressCellFlash for UI
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
        // Handle deprecated suppressFilter - check for v33 property first
        filterable: col.filter !== false && !(col as any).suppressFilter,
        filterMenuTab: 'filtersTab', // Default to filtersTab since filterMenuTab is deprecated
        // Handle deprecated suppressFilterButton -> suppressFloatingFilterButton
        suppressFilterButton: col.suppressHeaderFilterButton || (col as any).suppressFilterButton || false,
        // Handle deprecated includeInQuickFilter - opposite of suppressQuickFilter
        includeInQuickFilter: !(col as any).suppressQuickFilter,
        quickFilterText: col.quickFilterText || '',
        defaultFilterOption: 'contains',
        caseSensitive: false,
        suppressKeyboardEvent: col.suppressKeyboardEvent || false
      },
      editor: {
        editable: col.editable !== false,
        cellEditor: col.cellEditor || 'agTextCellEditor',
        singleClickEdit: col.singleClickEdit || false,
        // Note: enterNavigatesVertically, enterNavigatesVerticallyAfterEdit, and stopEditingWhenCellsLoseFocus
        // are grid-level options in AG Grid v33+, not column-level.
        // We store them in the editor settings for UI purposes, but they won't be applied to columns
        enterMovesDown: true, // Default to true for UI
        enterMovesDownAfterEdit: true, // Default to true for UI
        stopEditingWhenCellsLoseFocus: true, // Default to true for UI
        suppressPaste: false,
        navigateToNextCell: false,
        cellDataType: col.cellDataType as string || ''
      }
    };
  }, []);

  // Load columns when dialog opens
  useEffect(() => {
    console.log('Dialog open:', open, 'Grid API exists:', !!gridApi);
    if (open && gridApi) {
      try {
        // Get column definitions from the current grid
        console.log('Getting column definitions from grid...');
        let columnDefs = gridApi.getColumnDefs() as ColDef[];
        
        console.log('Initial column definitions:', columnDefs);
        console.log('Number of columns:', columnDefs ? columnDefs.length : 'undefined');
        
        // Filter out any invalid columns without fields
        columnDefs = columnDefs?.filter(col => col.field) || [];
        
        console.log('Filtered column definitions:', columnDefs);
        
        // Try to get saved column definitions using persistence utility
        try {
          const savedColumnDefs = ColumnSettingsPersistence.getColumnSettings();
          if (savedColumnDefs && Array.isArray(savedColumnDefs) && savedColumnDefs.length > 0) {
            console.log('Loaded saved column definitions:', savedColumnDefs.length);
            
            // Filter out any invalid saved columns without field
            const validSavedColumns = savedColumnDefs.filter((col: ColDef) => col.field);
            
            // Create a map of saved column definitions by field
            const fieldMap = new Map(validSavedColumns.map((col: ColDef) => [col.field, col]));
            
            // Merge saved column definitions with the current ones
            columnDefs = columnDefs.map((col: ColDef) => {
              const saved = fieldMap.get(col.field!);
              return saved ? { ...col, ...saved } : col;
            });
            
            console.log('Merged saved column definitions');
          }
        } catch (loadError) {
          console.error('Error loading saved column definitions:', loadError);
        }
        
        // Fallback to settings controller if available
        if (settingsController && columnDefs.length === 0) {
          try {
            if (typeof settingsController.getCurrentCustomSettings === 'function') {
              const customSettings = settingsController.getCurrentCustomSettings();
              if (customSettings?.columnDefs && Array.isArray(customSettings.columnDefs)) {
                columnDefs = customSettings.columnDefs.filter((col: ColDef) => col.field);
              }
            }
          } catch (methodError) {
            console.error('Fallback: Error accessing settings controller:', methodError);
          }
        }
        
        // Ensure we have valid columns
        columnDefs = columnDefs || [];
        console.log('Final columnDefs:', columnDefs);
        
        if (columnDefs && columnDefs.length > 0) {
          // Find the column to select
          const availableFields = columnDefs.map(c => c.field).filter(Boolean);
          const shouldSelectColumn = column?.field || 
                                     (!state.selectedColumn ? availableFields[0] : state.selectedColumn) || 
                                     availableFields[0] || 
                                     '';
          
          console.log('Final columnDefs length:', columnDefs.length);
          console.log('Available fields:', availableFields);
          console.log('Should select column:', shouldSelectColumn);
          
          setState(prev => {
            // Check if we have saved settings for this column
            const savedSettings = columnSettingsMap[shouldSelectColumn];
            const columnDef = columnDefs.find(c => c.field === shouldSelectColumn);
            
            console.log('Setting state with columns:', columnDefs);
            console.log('Selected column:', shouldSelectColumn);
            
            return {
              ...prev,
              columns: columnDefs,
              selectedColumn: shouldSelectColumn,
              settings: savedSettings || (columnDef ? extractSettingsFromColumn(columnDef) : prev.settings)
            };
          });
        } else {
          console.warn('No valid column definitions found');
          setState(prev => ({
            ...prev,
            columns: [],
            selectedColumn: '',
            settings: {}
          }));
        }
      } catch (error) {
        console.error('Error loading column settings:', error);
        // Log the error details
        if (error instanceof TypeError) {
          console.error('TypeError details:', error.message, error.stack);
        }
        // Reset to safe defaults on error
        setState(prev => ({
          ...prev,
          columns: [],
          selectedColumn: '',
          settings: {}
        }));
      }
    }
  }, [open, gridApi, column, extractSettingsFromColumn, state.selectedColumn, columnSettingsMap, settingsController]);

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
      
      // Clear caches when dialog closes
      styleCache.current.clear();
      headerStyleCache.current.clear();
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

  // Apply changes to grid - optimized version
  const applyChanges = useCallback(async () => {
    if (!gridApi) return;

    setIsApplying(true);
    console.log('Apply changes called. Settings controller:', settingsController);
    console.log('Settings controller type:', settingsController?.constructor?.name);
    
    try {
      const startTime = performance.now();
      let columnDefs = gridApi.getColumnDefs() as ColDef[];
      
      if (!columnDefs || columnDefs.length === 0) {
        console.error('No column definitions found');
        setIsApplying(false);
        return;
      }
      
      // Filter out any invalid columns
      columnDefs = columnDefs.filter(col => col.field);

      // Batch process column updates
      const updatePromise = new Promise<void>((resolve) => {
        requestAnimationFrame(() => {
          try {
            // Process column updates in a single pass
            const finalColumnDefs = columnDefs.map(col => {
              const field = col.field || '';
            
            // Check if this column should be updated
            const shouldUpdate = state.bulkUpdateMode
              ? state.selectedColumns.includes(field)
              : field === state.selectedColumn;
            
            // Check for pending settings in the map
            const hasPendingSettings = columnSettingsMap[field] && field !== state.selectedColumn;
            
            if (shouldUpdate || hasPendingSettings) {
              const settingsToApply = hasPendingSettings
                ? columnSettingsMap[field]
                : (columnSettingsMap[field] || state.settings);
              
              return applySettingsToColumn(
                col,
                settingsToApply,
                shouldUpdate ? state.bulkUpdateMode : false
              );
            }
            
            return col;
          });

          // Clean up any deprecated properties that might exist in the column definitions
          const cleanedColumnDefs = finalColumnDefs.map(col => {
            const cleanCol = { ...col };
            
            // Remove all deprecated properties to prevent warnings
            delete (cleanCol as any).suppressCellFlash;
            delete (cleanCol as any).suppressFilter;
            delete (cleanCol as any).filterMenuTab;
            delete (cleanCol as any).suppressFilterButton;
            delete (cleanCol as any).suppressQuickFilter;
            
            // Remove grid-level properties that were incorrectly applied to columns
            delete (cleanCol as any).enterMovesDown;
            delete (cleanCol as any).enterMovesDownAfterEdit;
            delete (cleanCol as any).enterNavigatesVertically;
            delete (cleanCol as any).enterNavigatesVerticallyAfterEdit;
            delete (cleanCol as any).stopEditingWhenCellsLoseFocus;
            
            return cleanCol;
          });

          // Use updateColumnDefs for better performance
          gridApi.updateGridOptions({
            columnDefs: cleanedColumnDefs,
            suppressColumnMoveAnimation: true,
            maintainColumnOrder: true
          });
          
          resolve();
        } catch (error) {
          console.error('Error applying column settings:', error);
          resolve();
        }
      });
    });

    // Apply updates and handle UI state asynchronously
    await updatePromise;
    
    // Defer the expensive operations
    setTimeout(() => {
      // Refresh only if necessary
      if (state.hasChanges) {
        gridApi.refreshCells({
          force: false,
          suppressFlash: true
        });
      }
      
      // Update profile settings asynchronously
      if (settingsController) {
        console.log('Settings controller available:', !!settingsController);
        console.log('Settings controller methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(settingsController)));
        console.log('updateCustomSettings method exists?', typeof settingsController.updateCustomSettings === 'function');
        
        // Polyfill for requestIdleCallback
        const idleCallback = window.requestIdleCallback || ((cb: any) => setTimeout(cb, 1));
        
        idleCallback(() => {
          try {
            const columnDefs = gridApi.getColumnDefs();
            
            // Use the persistence utility to save column settings
            const saved = ColumnSettingsPersistence.saveColumnSettings(columnDefs);
            
            if (saved) {
              console.log('Column settings saved successfully using ColumnSettingsPersistence');
            } else {
              console.warn('Failed to save column settings using ColumnSettingsPersistence');
              
              // Fallback to settingsController if available
              if (settingsController) {
                try {
                  const updateMethod = settingsController.updateCustomSettings;
                  if (typeof updateMethod === 'function') {
                    updateMethod.call(settingsController, {
                      columnDefs: columnDefs
                    });
                    console.log('Column settings saved via settingsController fallback');
                  }
                } catch (error) {
                  console.error('Fallback save via settingsController failed:', error);
                }
              }
              
              // Final fallback to profileManager
              if (!saved && profileManager && profileManager.activeProfile) {
                try {
                  const currentProfile = profileManager.activeProfile;
                  const updatedSettings = {
                    ...currentProfile.settings,
                    custom: {
                      ...currentProfile.settings.custom,
                      columnDefs: columnDefs
                    }
                  };
                  
                  profileManager.updateProfile(currentProfile.id, {
                    ...currentProfile,
                    settings: updatedSettings
                  });
                  
                  if (typeof profileManager.saveCurrentProfile === 'function') {
                    profileManager.saveCurrentProfile();
                  }
                  
                  console.log('Column settings saved via profileManager fallback');
                } catch (error) {
                  console.error('Fallback save via profileManager failed:', error);
                }
              }
            }
          } catch (error) {
            console.error('Error saving column settings:', error);
            console.error('Error stack:', error.stack);
          }
        });
      } else {
        console.warn('No settings controller available');
      }
      
      // Log performance metrics in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`Column settings applied in ${performance.now() - startTime}ms`);
      }
    }, 0);
    
    // Update state immediately for better UX
    setState(prev => ({
      ...prev,
      hasChanges: false,
      modifiedColumns: new Set()
    }));
    
    setColumnSettingsMap({});
    
    // Clear style caches when closing
    styleCache.current.clear();
    headerStyleCache.current.clear();
    
    onOpenChange(false);
  } catch (error) {
    console.error('Error applying column settings:', error);
    setIsApplying(false);
  } finally {
    setIsApplying(false);
    }
  }, [gridApi, state, columnSettingsMap, settingsController, onOpenChange]);

  // Apply settings to column definition - optimized with memoization
  const applySettingsToColumn = useCallback((col: ColDef, settings: ColumnSettings, skipHeaderCaption = false): ColDef => {
    // Quick return if no settings to apply
    if (!settings || Object.keys(settings).length === 0) {
      return col;
    }
    
    // Use shallow clone for better performance
    const newCol: ColDef = Object.assign({}, col);

    // Apply header settings
    if (settings.header) {
      // Only apply headerName if not in bulk mode or explicitly allowed
      if (settings.header.headerName !== undefined && !skipHeaderCaption) {
        newCol.headerName = settings.header.headerName;
      }
      
      // Only generate header styles if there are header settings
      const hasHeaderStyles = settings.header.headerFontFamily || 
                             settings.header.headerFontSize ||
                             settings.header.headerFontWeight ||
                             settings.header.headerTextColor !== null ||
                             settings.header.headerBackgroundColor !== null ||
                             settings.header.applyHeaderBorders ||
                             settings.header.headerTextAlign ||
                             settings.header.headerVerticalAlign;
      
      if (hasHeaderStyles) {
        // Map HeaderTab properties to utility format
        const headerStyleSettings = {
          fontFamily: settings.header.fontFamily,
          fontSize: settings.header.fontSize,
          fontWeight: settings.header.fontWeight,
          textStyle: settings.header.fontStyle ? settings.header.fontStyle.split(' ') : [],
          textColor: settings.header.textColor,
          textColorEnabled: settings.header.textColor !== null && settings.header.textColor !== undefined,
          backgroundColor: settings.header.backgroundColor,
          backgroundEnabled: settings.header.backgroundColor !== null && settings.header.backgroundColor !== undefined,
          textAlign: settings.header.horizontalAlign,
          verticalAlign: settings.header.verticalAlign,
          applyBorders: settings.header.applyBorders,
          borderStyle: settings.header.borderStyle || 'solid',
          borderWidth: settings.header.borderWidth || 1,
          borderColor: settings.header.borderColor,
          borderColorEnabled: settings.header.borderColor !== null && settings.header.borderColor !== undefined,
          borderSides: settings.header.borderSides || 'all'
        };
        
        const headerClass = generateHeaderClass(headerStyleSettings);
        const headerStyle = generateHeaderStyle(headerStyleSettings);
        
        if (headerClass) newCol.headerClass = headerClass;
        if (headerStyle && Object.keys(headerStyle).length > 0) {
          // Use a function to ensure styles are applied with higher precedence
          newCol.headerStyle = () => headerStyle;
        }
      }
      
      if (settings.header.headerGroup) {
        newCol.headerTooltip = settings.header.headerGroup;
      }
    }

    // Apply cell settings
    if (settings.cell) {
      // Map CellTab properties to create cellStyle
      const cellStyle: any = {
        display: 'flex'
      };
      
      // Build cell style object efficiently
      const hasFont = settings.cell.fontFamily || settings.cell.fontSize || settings.cell.fontWeight || settings.cell.fontStyle;
      const hasColors = (settings.cell.textColor !== null && settings.cell.textColor !== undefined) ||
                       (settings.cell.backgroundColor !== null && settings.cell.backgroundColor !== undefined);
      const hasAlignment = settings.cell.horizontalAlign || settings.cell.verticalAlign;
      const hasBorders = settings.cell.applyBorders;
      
      // Only process what's needed
      if (hasFont || hasColors || hasAlignment || hasBorders) {
        // Font settings
        if (hasFont) {
          if (settings.cell.fontFamily && settings.cell.fontFamily !== 'default') {
            cellStyle.fontFamily = settings.cell.fontFamily;
          }
          if (settings.cell.fontSize && settings.cell.fontSize !== 'default') {
            cellStyle.fontSize = settings.cell.fontSize;
          }
          if (settings.cell.fontWeight && settings.cell.fontWeight !== 'default') {
            cellStyle.fontWeight = settings.cell.fontWeight;
          }
          
          // Font styles
          if (settings.cell.fontStyle) {
            const styles = settings.cell.fontStyle;
            if (styles.includes('bold')) cellStyle.fontWeight = 'bold';
            if (styles.includes('italic')) cellStyle.fontStyle = 'italic';
            if (styles.includes('underline')) cellStyle.textDecoration = 'underline';
          }
        }
        
        // Colors
        if (hasColors) {
          if (settings.cell.textColor !== null && settings.cell.textColor !== undefined) {
            cellStyle.color = settings.cell.textColor;
          }
          if (settings.cell.backgroundColor !== null && settings.cell.backgroundColor !== undefined) {
            cellStyle.backgroundColor = settings.cell.backgroundColor;
          }
        }
        
        // Alignment
        if (hasAlignment) {
          if (settings.cell.horizontalAlign) {
            cellStyle.textAlign = settings.cell.horizontalAlign;
            cellStyle.justifyContent = settings.cell.cellTextAlign === 'center' ? 'center' : 
                                      settings.cell.cellTextAlign === 'right' ? 'flex-end' : 'flex-start';
          }
          
          if (settings.cell.cellVerticalAlign) {
            cellStyle.alignItems = settings.cell.cellVerticalAlign === 'top' ? 'flex-start' :
                                  settings.cell.cellVerticalAlign === 'bottom' ? 'flex-end' : 'center';
          }
        }
        
        // Borders
        if (hasBorders) {
          const borderStyle = `${settings.cell.cellBorderWidth || '1px'} ${settings.cell.cellBorderStyle || 'solid'} ${settings.cell.cellBorderColor || '#ccc'}`;
          
          switch (settings.cell.cellBorderSides) {
            case 'all':
              cellStyle.border = borderStyle;
              break;
            case 'horizontal':
              cellStyle.borderTop = cellStyle.borderBottom = borderStyle;
              break;
            case 'vertical':
              cellStyle.borderLeft = cellStyle.borderRight = borderStyle;
              break;
            default:
              if (settings.cell.cellBorderSides) {
                const side = settings.cell.cellBorderSides;
                cellStyle[`border${side.charAt(0).toUpperCase()}${side.slice(1)}`] = borderStyle;
              }
          }
        }
      }
      
      // Create cellStyle function only if there are styles to apply
      if (Object.keys(cellStyle).length > 1) { // > 1 because display: 'flex' is always there
        // Create cache key from style properties
        const cacheKey = JSON.stringify(cellStyle);
        
        // Check cache first
        let cachedStyle = styleCache.current.get(cacheKey);
        if (!cachedStyle) {
          cachedStyle = cellStyle;
          styleCache.current.set(cacheKey, cachedStyle);
        }
        
        // Use a function to ensure styles are applied with higher precedence
        newCol.cellStyle = () => cachedStyle;
      }
      
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
      // Handle suppressCellFlash -> enableCellChangeFlash conversion (opposite values)
      if (settings.cell.suppressCellFlash !== undefined) {
        // Remove deprecated property
        delete newCol.suppressCellFlash;
        // Apply v33 property with inverted value
        newCol.enableCellChangeFlash = !settings.cell.suppressCellFlash;
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
        // Remove deprecated suppressFilter
        delete newCol.suppressFilter;
        // Use filter property instead (false to disable filtering)
        newCol.filter = settings.filter.filterable ? (settings.filter.filter || 'agTextColumnFilter') : false;
      }
      // Remove deprecated filterMenuTab - no longer used in v33
      delete newCol.filterMenuTab;
      
      if (settings.filter.suppressFilterButton !== undefined) {
        // Remove deprecated suppressFilterButton
        delete newCol.suppressFilterButton;
        // Apply v33 property
        newCol.suppressFloatingFilterButton = settings.filter.suppressFilterButton;
      }
      if (settings.filter.includeInQuickFilter !== undefined) {
        // Remove deprecated suppressQuickFilter - no longer used in v33
        delete newCol.suppressQuickFilter;
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
      // Note: enterNavigatesVertically, enterNavigatesVerticallyAfterEdit, and stopEditingWhenCellsLoseFocus 
      // are grid-level options, not column-level options in AG Grid v33+
      // These should be set at the grid options level, not on individual columns
      
      // Remove these deprecated properties if they exist
      delete newCol.enterMovesDown;
      delete newCol.enterMovesDownAfterEdit;
      delete newCol.enterNavigatesVertically;
      delete newCol.enterNavigatesVerticallyAfterEdit;
      delete newCol.stopEditingWhenCellsLoseFocus;
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
              <TabsList className="w-full justify-start rounded-none border-b px-3 bg-transparent h-9">
                <TabsTrigger 
                  value="header" 
                  className={`rounded-none text-xs ${FORM_CONTROL_HEIGHTS.compact}`}
                >
                  Header
                </TabsTrigger>
                <TabsTrigger 
                  value="cell" 
                  className={`rounded-none text-xs ${FORM_CONTROL_HEIGHTS.compact}`}
                >
                  Cell
                </TabsTrigger>
                <TabsTrigger 
                  value="formatter" 
                  className={`rounded-none text-xs ${FORM_CONTROL_HEIGHTS.compact}`}
                >
                  Formatter
                </TabsTrigger>
                <TabsTrigger 
                  value="filter" 
                  className={`rounded-none text-xs ${FORM_CONTROL_HEIGHTS.compact}`}
                >
                  Filter
                </TabsTrigger>
                <TabsTrigger 
                  value="editors" 
                  className={`rounded-none text-xs ${FORM_CONTROL_HEIGHTS.compact}`}
                >
                  Editors
                </TabsTrigger>
              </TabsList>

              <div className="flex-1 overflow-hidden">
                <TabsContent value="header" className="h-full m-0 p-4 overflow-y-auto dialog-scrollbar">
                  <HeaderTab
                    settings={state.settings.header || {}}
                    onSettingsChange={(updates) => updateSettings('header', updates)}
                    isModified={state.modifiedColumns.has(state.selectedColumn)}
                    bulkUpdateMode={state.bulkUpdateMode}
                  />
                </TabsContent>

                <TabsContent value="cell" className="h-full m-0 p-4 overflow-y-auto dialog-scrollbar">
                  <CellTab
                    settings={state.settings.cell || {}}
                    onSettingsChange={(updates) => updateSettings('cell', updates)}
                    isModified={state.modifiedColumns.has(state.selectedColumn)}
                    bulkUpdateMode={state.bulkUpdateMode}
                  />
                </TabsContent>

                <TabsContent value="formatter" className="h-full m-0 p-4 overflow-y-auto dialog-scrollbar">
                  <FormatterTab
                    settings={state.settings.formatter || {}}
                    onSettingsChange={(updates) => updateSettings('formatter', updates)}
                    isModified={state.modifiedColumns.has(state.selectedColumn)}
                    bulkUpdateMode={state.bulkUpdateMode}
                  />
                </TabsContent>

                <TabsContent value="filter" className="h-full m-0 p-4 overflow-y-auto dialog-scrollbar">
                  <FilterTab
                    settings={state.settings.filter || {}}
                    onSettingsChange={(updates) => updateSettings('filter', updates)}
                    isModified={state.modifiedColumns.has(state.selectedColumn)}
                    bulkUpdateMode={state.bulkUpdateMode}
                  />
                </TabsContent>

                <TabsContent value="editors" className="h-full m-0 p-4 overflow-y-auto dialog-scrollbar">
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

        <DialogFooter className="border-t px-4 py-2 flex-shrink-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} className={`${BUTTON_CLASSES}`}>
            Cancel
          </Button>
          <div className="flex gap-1.5">
            <Button variant="outline" onClick={handleReset} className={`${BUTTON_CLASSES}`}>
              {state.bulkUpdateMode ? "Clear Selection" : "Reset"}
            </Button>
            <Button
              onClick={async () => {
                setIsApplying(true);
                await applyChanges();
                setIsApplying(false);
              }}
              disabled={isApplyDisabled || isApplying}
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