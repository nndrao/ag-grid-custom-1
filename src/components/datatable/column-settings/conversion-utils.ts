import { ColDef } from 'ag-grid-community';
import { 
  ColumnSettings, 
  HeaderSettings, 
  CellSettings, 
  FormatterSettings, 
  FilterSettings, 
  EditorSettings 
} from './types';
import { generateHeaderClass, generateHeaderStyle, generateCellClass, generateCellStyle, createValueFormatter } from './utils';

/**
 * Convert ColumnSettings to AG-Grid ColDef properties
 */
export function convertSettingsToColDef(settings: ColumnSettings): Partial<ColDef> {
  const colDef: Partial<ColDef> = {};
  
  // Header settings
  if (settings.header) {
    if (settings.header.displayName) {
      colDef.headerName = settings.header.displayName;
    }
    if (settings.header.tooltip) {
      colDef.headerTooltip = settings.header.tooltip;
    }
    
    // Generate header class
    const headerClass = generateHeaderClass(settings.header);
    
    // Add custom class for font styles
    let customClasses: string[] = [];
    if (headerClass) {
      customClasses.push(headerClass);
    }
    
    // Add specific classes for font styles that AG-Grid might override
    if (settings.header.fontStyle) {
      const styles = settings.header.fontStyle.split(' ').filter(s => s);
      styles.forEach(style => {
        if (style === 'italic') customClasses.push('header-style-italic');
        if (style === 'underline') customClasses.push('header-style-underline');
        if (style === 'bold') customClasses.push('header-style-bold');
      });
    }
    
    if (customClasses.length > 0) {
      colDef.headerClass = customClasses.join(' ');
    }
    
    // Generate header style object for AG-Grid v33
    const headerStyle = generateHeaderStyle(settings.header);
    if (headerStyle && Object.keys(headerStyle).length > 0) {
      // Use a function to ensure styles are applied with higher precedence
      colDef.headerStyle = (params: any) => {
        return headerStyle;
      };
    }
  }
  
  // Cell settings
  if (settings.cell) {
    // Generate cell class
    const cellClass = generateCellClass(settings.cell);
    
    // Add custom class for font styles
    let customCellClasses: string[] = [];
    if (cellClass) {
      customCellClasses.push(cellClass);
    }
    
    // Add specific classes for font styles that AG-Grid might override
    if (settings.cell.fontStyle) {
      const styles = settings.cell.fontStyle.split(' ').filter(s => s);
      styles.forEach(style => {
        if (style === 'italic') customCellClasses.push('cell-style-italic');
        if (style === 'underline') customCellClasses.push('cell-style-underline');
        if (style === 'bold') customCellClasses.push('cell-style-bold');
      });
    }
    
    if (customCellClasses.length > 0) {
      colDef.cellClass = customCellClasses.join(' ');
    }
    
    // Generate cell style
    const cellStyle = generateCellStyle(settings.cell);
    if (cellStyle && Object.keys(cellStyle).length > 0) {
      // Use a function to ensure styles are applied with higher precedence
      colDef.cellStyle = (params: any) => {
        return cellStyle;
      };
    }
    
    // Cell-specific properties
    if (settings.cell.wrapText !== undefined) {
      colDef.wrapText = settings.cell.wrapText;
    }
    if (settings.cell.autoHeight !== undefined) {
      colDef.autoHeight = settings.cell.autoHeight;
    }
    if (settings.cell.cellRenderer) {
      colDef.cellRenderer = settings.cell.cellRenderer;
    }
  }
  
  // Formatter settings
  if (settings.formatter && settings.formatter.type !== 'text') {
    colDef.valueFormatter = createValueFormatter(settings.formatter);
  }
  
  // Filter settings
  if (settings.filter) {
    colDef.filter = settings.filter.filter || settings.filter.filterType || 'agTextColumnFilter';
    colDef.floatingFilter = settings.filter.floatingFilter;
    
    // Create filter params
    const filterParams: any = {};
    
    if (settings.filter.filterType === 'text') {
      filterParams.filterOptions = [settings.filter.defaultFilterOption || 'contains'];
      filterParams.caseSensitive = settings.filter.caseSensitive;
    } else if (settings.filter.filterType === 'number') {
      filterParams.filterOptions = [settings.filter.defaultFilterOption || 'equals'];
      filterParams.allowedCharPattern = settings.filter.allowedCharacters;
    } else if (settings.filter.filterType === 'date') {
      filterParams.filterOptions = [settings.filter.defaultFilterOption || 'equals'];
      filterParams.browserDatePicker = settings.filter.browserDatePicker;
      if (settings.filter.minValidYear) {
        filterParams.minValidDate = new Date(settings.filter.minValidYear, 0, 1);
      }
      if (settings.filter.maxValidYear) {
        filterParams.maxValidDate = new Date(settings.filter.maxValidYear, 11, 31);
      }
    }
    
    if (Object.keys(filterParams).length > 0) {
      colDef.filterParams = filterParams;
    }
  }
  
  // Editor settings
  if (settings.editor) {
    colDef.editable = settings.editor.editable;
    
    if (settings.editor.cellEditor) {
      colDef.cellEditor = settings.editor.cellEditor;
    }
    
    if (settings.editor.singleClickEdit !== undefined) {
      colDef.singleClickEdit = settings.editor.singleClickEdit;
    }
    
    // Create editor params
    const cellEditorParams: any = {};
    
    if (settings.editor.editorType === 'select') {
      if (settings.editor.valueSource === 'csv' && settings.editor.csvValues) {
        cellEditorParams.values = settings.editor.csvValues.split(',').map(v => v.trim());
      } else if (settings.editor.valueSource === 'json' && settings.editor.jsonValues) {
        try {
          const parsed = JSON.parse(settings.editor.jsonValues);
          cellEditorParams.values = parsed.values || parsed;
        } catch (e) {
          console.error('Invalid JSON for select values:', e);
        }
      }
    }
    
    if (Object.keys(cellEditorParams).length > 0) {
      colDef.cellEditorParams = cellEditorParams;
    }
  }
  
  return colDef;
}

/**
 * Extract ColumnSettings from a ColDef
 */
export function extractSettingsFromColDef(col: ColDef, columnId: string): ColumnSettings {
  const settings: ColumnSettings = {
    columnId,
    lastModified: Date.now(),
    isDirty: false
  };
  
  // Extract header settings
  settings.header = extractHeaderSettings(col);
  
  // Extract cell settings
  settings.cell = extractCellSettings(col);
  
  // Extract formatter settings
  settings.formatter = extractFormatterSettings(col);
  
  // Extract filter settings
  settings.filter = extractFilterSettings(col);
  
  // Extract editor settings
  settings.editor = extractEditorSettings(col);
  
  return settings;
}

function extractHeaderSettings(col: ColDef): HeaderSettings {
  const headerStyle = typeof col.headerStyle === 'function' ? {} : (col.headerStyle || {});
  
  return {
    displayName: col.headerName,
    tooltip: col.headerTooltip,
    headerClass: Array.isArray(col.headerClass) ? col.headerClass.join(' ') : col.headerClass as string | undefined,
    headerGroup: (col as any).headerGroup,
    fontFamily: headerStyle.fontFamily || 'Arial',
    fontSize: headerStyle.fontSize || '14px',
    fontWeight: headerStyle.fontWeight || 'normal',
    fontStyle: '',
    textColor: headerStyle.color || null,
    backgroundColor: headerStyle.backgroundColor || null,
    horizontalAlign: headerStyle.textAlign || 'left',
    verticalAlign: headerStyle.alignItems === 'flex-start' ? 'top' :
                   headerStyle.alignItems === 'flex-end' ? 'bottom' : 'middle',
    applyBorders: !!headerStyle.border,
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: headerStyle.borderColor || null,
    borderSides: 'all'
  };
}

function extractCellSettings(col: ColDef): CellSettings {
  const cellStyle = typeof col.cellStyle === 'function' ? {} : (col.cellStyle || {});
  
  return {
    fontFamily: cellStyle?.fontFamily || 'Arial',
    fontSize: cellStyle?.fontSize || '12px',
    fontWeight: cellStyle?.fontWeight || 'normal',
    fontStyle: '',
    textColor: cellStyle?.color || null,
    backgroundColor: cellStyle?.backgroundColor || null,
    horizontalAlign: cellStyle?.textAlign || 'left',
    verticalAlign: cellStyle?.alignItems === 'flex-start' ? 'top' :
                   cellStyle?.alignItems === 'flex-end' ? 'bottom' : 'middle',
    applyBorders: !!cellStyle?.border,
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: cellStyle?.borderColor || null,
    borderSides: 'all',
    wrapText: col.wrapText,
    autoHeight: col.autoHeight,
    cellClass: Array.isArray(col.cellClass) ? col.cellClass.join(' ') : col.cellClass as string | undefined,
    cellRenderer: col.cellRenderer as string | undefined,
    suppressCellFlash: !(col.enableCellChangeFlash !== false)
  };
}

function extractFormatterSettings(col: ColDef): FormatterSettings {
  return {
    type: 'text',
    decimals: 2,
    use1000Separator: true,
    currency: 'USD',
    dateFormat: 'MM/DD/YYYY',
    multiplyBy100: false,
    prefix: '',
    suffix: ''
  };
}

function extractFilterSettings(col: ColDef): FilterSettings {
  return {
    filter: col.filter || 'agTextColumnFilter',
    floatingFilter: col.floatingFilter || false,
    filterable: col.filter !== false,
    filterMenuTab: 'filtersTab',
    suppressFilterButton: col.suppressHeaderFilterButton || false,
    includeInQuickFilter: true,
    quickFilterText: '',
    defaultFilterOption: 'contains',
    caseSensitive: false,
    suppressKeyboardEvent: false
  };
}

function extractEditorSettings(col: ColDef): EditorSettings {
  return {
    editable: col.editable !== false,
    cellEditor: col.cellEditor || 'agTextCellEditor',
    singleClickEdit: col.singleClickEdit || false,
    enterMovesDown: true,
    enterMovesDownAfterEdit: true,
    stopEditingWhenCellsLoseFocus: true,
    suppressPaste: false,
    navigateToNextCell: false,
    cellDataType: col.cellDataType as string || ''
  };
}

/**
 * Validate column settings
 */
export function validateColumnSettings(settings: ColumnSettings): string[] {
  const errors: string[] = [];
  
  if (!settings.columnId) {
    errors.push('Column ID is required');
  }
  
  // Validate header settings
  if (settings.header) {
    if (settings.header.fontSize && !settings.header.fontSize.match(/^\d+(\.\d+)?(px|em|rem|%)$/)) {
      errors.push('Invalid font size format');
    }
    if (settings.header.borderWidth && settings.header.borderWidth < 0) {
      errors.push('Border width cannot be negative');
    }
  }
  
  // Validate cell settings
  if (settings.cell) {
    if (settings.cell.fontSize && !settings.cell.fontSize.match(/^\d+(\.\d+)?(px|em|rem|%)$/)) {
      errors.push('Invalid cell font size format');
    }
  }
  
  // Validate formatter settings
  if (settings.formatter) {
    if (settings.formatter.decimals !== undefined && settings.formatter.decimals < 0) {
      errors.push('Decimal places cannot be negative');
    }
  }
  
  return errors;
}

/**
 * Merge two column settings, with newer taking precedence
 */
export function mergeColumnSettings(
  existing: ColumnSettings | undefined, 
  updates: Partial<ColumnSettings>
): ColumnSettings {
  return {
    ...(existing || { columnId: updates.columnId || '' }),
    ...updates,
    lastModified: Date.now(),
    isDirty: true
  };
}