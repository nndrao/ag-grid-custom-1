import { ColDef } from 'ag-grid-community';

// Font and styling types
export interface FontSettings {
  fontFamily?: string;
  fontSize?: string;
  fontWeight?: string;
  fontStyle?: string;
  textStyle?: ('bold' | 'italic' | 'underline')[];
}

export interface ColorSettings {
  textColor?: string;
  backgroundColor?: string;
  textColorEnabled?: boolean;
  backgroundEnabled?: boolean;
}

export interface BorderSettings {
  borderStyle?: 'none' | 'solid' | 'dashed' | 'dotted';
  borderSides?: 'all' | 'top' | 'right' | 'bottom' | 'left';
  borderWidth?: number;
  borderColor?: string;
  applyBorders?: boolean;
  borderColorEnabled?: boolean;
}

export interface AlignmentSettings {
  horizontalAlign?: 'left' | 'center' | 'right';
  verticalAlign?: 'top' | 'middle' | 'bottom';
}

// Header and Cell settings
export interface HeaderSettings extends FontSettings, ColorSettings, BorderSettings, AlignmentSettings {
  headerName?: string;
  headerClass?: string;
  headerGroup?: string;
  enableBulkEdit?: boolean;
  showCheckAll?: boolean;
  autoComplete?: string;
  clearSelectionOnChange?: boolean;
  removeColumnsOnTidy?: boolean;
}

export interface CellSettings extends FontSettings, ColorSettings, BorderSettings, AlignmentSettings {
  wrapText?: boolean;
  autoHeight?: boolean;
  cellClass?: string;
  cellRenderer?: string;
  useFullWidthRow?: boolean;
  suppressCellFlash?: boolean;
  includeButtonsInRowDrag?: boolean;
}

// Formatter settings
export type FormatterType = 'text' | 'number' | 'currency' | 'percentage' | 'date' | 'boolean' | 'link' | 'none' | 'percent' | 'custom';

export interface FormatterSettings {
  type?: FormatterType;
  decimals?: number;
  use1000Separator?: boolean;
  currency?: string;
  multiplyBy100?: boolean;
  dateFormat?: string;
  openInNewTab?: boolean;
  showAsButton?: boolean;
  prefix?: string;
  suffix?: string;
  // Legacy or alternative names
  formatterType?: FormatterType;
  decimalPlaces?: number;
  currencySymbol?: string;
  symbolPosition?: 'before' | 'after';
  customFormat?: string;
  previewValue?: string;
  thousandsSeparator?: boolean;
  numberPreset?: 'default' | 'scientific' | 'engineering' | 'compact';
}

// Filter settings
export type FilterType = 'text' | 'number' | 'date' | 'set' | 'multi';

export interface FilterSettings {
  filter?: string | boolean;
  floatingFilter?: boolean;
  filterable?: boolean;
  filterMenuTab?: string;
  suppressFilterButton?: boolean;
  includeInQuickFilter?: boolean;
  quickFilterText?: string;
  defaultFilterOption?: string;
  caseSensitive?: boolean;
  suppressKeyboardEvent?: boolean;
  // Additional properties from reference
  filterType?: FilterType;
  defaultOption?: string;
  allowedCharacters?: string;
  browserDatePicker?: boolean;
  minValidYear?: number;
  maxValidYear?: number;
  selectAllOnMiniFilter?: boolean;
  enableSearch?: boolean;
  showFilterButtons?: boolean;
  closeOnApply?: boolean;
  debounce?: number;
}

// Editor settings
export type EditorType = 'none' | 'default' | 'text' | 'select' | 'date';

export interface EditorSettings {
  editable?: boolean;
  cellEditor?: string;
  singleClickEdit?: boolean;
  enterMovesDown?: boolean;
  enterMovesDownAfterEdit?: boolean;
  stopEditingWhenCellsLoseFocus?: boolean;
  suppressPaste?: boolean;
  suppressKeyboardEvent?: boolean;
  navigateToNextCell?: boolean;
  cellDataType?: string;
  pattern?: string;
  min?: number;
  max?: number;
  maxLength?: number;
  // Additional properties from reference
  editorType?: EditorType;
  valueSource?: 'csv' | 'json' | 'rest';
  csvValues?: string;
  jsonValues?: string;
  restUrl?: string;
  placeholder?: string;
}

// Combined column settings
export interface ColumnSettings {
  header?: HeaderSettings;
  cell?: CellSettings;
  formatter?: FormatterSettings;
  filter?: FilterSettings;
  editor?: EditorSettings;
  // AG-Grid specific properties
  colDef?: Partial<ColDef>;
}

// Component props
export interface ColumnSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  gridApi: any | null;
  column?: ColDef;
}

// State interfaces
export interface ColumnSettingsState {
  selectedColumn: string;
  selectedColumns: string[];
  bulkUpdateMode: boolean;
  settings: ColumnSettings;
  modifiedColumns: Set<string>;
  hasChanges: boolean;
  activeTab: 'header' | 'cell' | 'formatter' | 'filter' | 'editors';
  searchTerm: string;
  columns: ColDef[];
}

export interface FormatterExample {
  name: string;
  format: string;
  preview: Array<{
    value: number;
    display: string;
    color?: string;
  }>;
}