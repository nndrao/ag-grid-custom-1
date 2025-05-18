import { ColDef } from 'ag-grid-community';
import {
  CellSettings,
  FormatterSettings,
  HeaderSettings,
  FilterSettings,
  EditorSettings
} from './types';

/**
 * Generate CSS classes for header based on settings
 */
export function generateHeaderClass(settings: HeaderSettings): string {
  const classes: string[] = [];
  
  if (settings.headerClass) {
    classes.push(settings.headerClass);
  }
  
  if (settings.verticalAlign) {
    classes.push(`header-align-${settings.verticalAlign}`);
  }
  
  // Add text style classes
  if (settings.textStyle?.includes('bold')) {
    classes.push('font-bold');
  }
  if (settings.textStyle?.includes('italic')) {
    classes.push('italic');
  }
  if (settings.textStyle?.includes('underline')) {
    classes.push('underline');
  }
  
  return classes.join(' ');
}

/**
 * Generate inline styles for header based on settings
 */
export function generateHeaderStyle(settings: HeaderSettings): any {
  const style: any = {};
  
  // Font settings
  if (settings.fontFamily && settings.fontFamily !== 'default') {
    style.fontFamily = settings.fontFamily;
  }
  
  if (settings.fontSize && settings.fontSize !== 'default') {
    style.fontSize = settings.fontSize;
  }
  
  if (settings.fontWeight && settings.fontWeight !== 'default') {
    style.fontWeight = settings.fontWeight;
  }
  
  // Text styles
  if (settings.textStyle?.includes('bold')) {
    style.fontWeight = 'bold';
  }
  
  if (settings.textStyle?.includes('italic')) {
    style.fontStyle = 'italic';
  }
  
  if (settings.textStyle?.includes('underline')) {
    style.textDecoration = 'underline';
  }
  
  // Colors
  if (settings.textColorEnabled && settings.textColor) {
    style.color = settings.textColor;
  }
  
  if (settings.backgroundEnabled && settings.backgroundColor) {
    style.backgroundColor = settings.backgroundColor;
  }
  
  // Alignment
  if (settings.verticalAlign) {
    style.alignItems = settings.verticalAlign === 'top' ? 'flex-start' :
                      settings.verticalAlign === 'bottom' ? 'flex-end' : 'center';
  }
  
  // Borders
  if (settings.applyBorders) {
    const borderStyle = `${settings.borderWidth || 1}px ${settings.borderStyle || 'solid'} ${settings.borderColorEnabled ? settings.borderColor : '#ccc'}`;
    
    if (settings.borderSides === 'all') {
      style.border = borderStyle;
    } else {
      style[`border${settings.borderSides?.charAt(0).toUpperCase()}${settings.borderSides?.slice(1)}`] = borderStyle;
    }
  }
  
  return style;
}

/**
 * Generate CSS classes for cells based on settings
 */
export function generateCellClass(settings: CellSettings): string {
  const classes: string[] = [];
  
  if (settings.cellClass) {
    classes.push(settings.cellClass);
  }
  
  if (settings.wrapText) {
    classes.push('wrap-text');
  }
  
  if (settings.horizontalAlign) {
    classes.push(`cell-align-${settings.horizontalAlign}`);
  }
  
  return classes.join(' ');
}

/**
 * Generate inline styles for cells based on settings
 */
export function generateCellStyle(settings: CellSettings): any {
  const style: any = {};
  
  if (settings.horizontalAlign) {
    style.textAlign = settings.horizontalAlign;
    style.justifyContent = settings.horizontalAlign === 'center' ? 'center' : 
                          settings.horizontalAlign === 'right' ? 'flex-end' : 'flex-start';
  }
  
  if (settings.verticalAlign) {
    style.alignItems = settings.verticalAlign === 'top' ? 'flex-start' :
                      settings.verticalAlign === 'bottom' ? 'flex-end' : 'center';
  }
  
  if (settings.wrapText) {
    style.whiteSpace = 'normal';
    style.wordBreak = 'break-word';
  }
  
  return style;
}

/**
 * Create a value formatter function based on formatter settings
 */
export function createValueFormatter(settings: FormatterSettings): (params: any) => string {
  return (params: any) => {
    if (params.value == null) return '';
    
    let formatted = params.value;
    
    switch (settings.type) {
      case 'number':
        formatted = Number(params.value).toFixed(settings.decimals || 0);
        if (settings.use1000Separator) {
          formatted = formatted.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        }
        break;
        
      case 'currency':
        formatted = Number(params.value).toFixed(settings.decimals || 2);
        if (settings.use1000Separator) {
          formatted = formatted.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        }
        formatted = `${settings.currency || '$'}${formatted}`;
        break;
        
      case 'percentage':
        let value = Number(params.value);
        if (settings.multiplyBy100) {
          value = value * 100;
        }
        formatted = `${value.toFixed(settings.decimals || 1)}%`;
        break;
        
      case 'date':
        if (params.value instanceof Date) {
          formatted = formatDate(params.value, settings.dateFormat || 'MM/DD/YYYY');
        }
        break;
        
      case 'boolean':
        formatted = params.value ? 'Yes' : 'No';
        break;
        
      case 'link':
        formatted = params.value; // Links need custom cell renderer
        break;
    }
    
    // Apply prefix/suffix
    if (settings.prefix) {
      formatted = `${settings.prefix}${formatted}`;
    }
    if (settings.suffix) {
      formatted = `${formatted}${settings.suffix}`;
    }
    
    return formatted;
  };
}

/**
 * Format a date according to a format string
 */
export function formatDate(date: Date, format: string): string {
  const pad = (n: number) => n.toString().padStart(2, '0');
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const replacements: Record<string, string> = {
    'YYYY': date.getFullYear().toString(),
    'YY': date.getFullYear().toString().slice(-2),
    'MM': pad(date.getMonth() + 1),
    'MMM': monthNames[date.getMonth()],
    'DD': pad(date.getDate()),
    'HH': pad(date.getHours()),
    'mm': pad(date.getMinutes()),
    'ss': pad(date.getSeconds())
  };
  
  return format.replace(/YYYY|YY|MMM|MM|DD|HH|mm|ss/g, match => replacements[match]);
}

/**
 * Filter columns based on search term
 */
export function filterColumns(columns: ColDef[], searchTerm: string): ColDef[] {
  if (!searchTerm.trim()) {
    return columns;
  }
  
  const term = searchTerm.toLowerCase();
  return columns.filter(col => {
    const field = col.field?.toLowerCase() || '';
    const headerName = col.headerName?.toLowerCase() || '';
    return field.includes(term) || headerName.includes(term);
  });
}

/**
 * Check if a column has been modified
 */
export function isColumnModified(
  original: ColDef,
  current: ColDef,
  settings: any
): boolean {
  // Check header changes
  if (settings.header?.headerName !== original.headerName) return true;
  
  // Check cell style changes
  const originalStyle = typeof original.cellStyle === 'function' ? {} : original.cellStyle || {};
  const currentStyle = settings.cell || {};
  
  if (currentStyle.horizontalAlign !== (originalStyle.textAlign || 'left')) return true;
  if (currentStyle.verticalAlign !== (originalStyle.alignItems || 'middle')) return true;
  
  // Check other changes
  if (settings.filter?.filter !== original.filter) return true;
  if (settings.filter?.floatingFilter !== original.floatingFilter) return true;
  if (settings.editor?.editable !== original.editable) return true;
  if (settings.editor?.cellEditor !== original.cellEditor) return true;
  
  return false;
}

/**
 * Get default settings for a column type
 */
export function getDefaultSettingsForType(columnType: string): Partial<FormatterSettings> {
  switch (columnType) {
    case 'number':
      return {
        type: 'number',
        decimals: 2,
        use1000Separator: true
      };
      
    case 'currency':
      return {
        type: 'currency',
        decimals: 2,
        use1000Separator: true,
        currency: '$'
      };
      
    case 'percentage':
      return {
        type: 'percentage',
        decimals: 1,
        multiplyBy100: true
      };
      
    case 'date':
      return {
        type: 'date',
        dateFormat: 'MM/DD/YYYY'
      };
      
    case 'boolean':
      return {
        type: 'boolean'
      };
      
    default:
      return {
        type: 'text'
      };
  }
}