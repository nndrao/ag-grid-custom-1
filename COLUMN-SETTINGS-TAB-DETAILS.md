# Column Settings Tab Details

## 1. Header Tab Settings

Controls the appearance and behavior of column headers.

```typescript
interface HeaderStyles {
  // Basic Properties
  headerName: string;                    // Column header text
  
  // Font Settings
  headerFontFamily: string;              // Font family (e.g., 'Arial', 'monospace')
  headerFontSize: string;                // Font size (e.g., '14px')
  headerFontWeight: string;              // Font weight ('normal', 'bold', '600')
  headerFontStyle: string;               // Font style (combination of 'bold', 'italic', 'underline')
  
  // Color Settings
  headerTextColor: string | null;        // Text color (hex or rgba)
  headerBackgroundColor: string | null;  // Background color (hex or rgba)
  
  // Alignment
  headerTextAlign: string;               // Horizontal alignment ('left', 'center', 'right')
  headerVerticalAlign: string;           // Vertical alignment ('top', 'middle', 'bottom')
  
  // Border Settings
  applyHeaderBorders: boolean;           // Enable/disable borders
  headerBorderStyle: string;             // Border style ('solid', 'dashed', 'dotted')
  headerBorderWidth: string;             // Border width (e.g., '1px', '2px')
  headerBorderColor: string;             // Border color (hex or rgba)
  headerBorderSides: string;             // Which sides ('all', 'top', 'right', 'bottom', 'left')
}
```

## 2. Cell Tab Settings

Controls the appearance of the cells in the column.

```typescript
interface CellStyles {
  // Sample Text for Preview
  sampleText: string;                    // Preview text for cell styling
  
  // Font Settings
  cellFontFamily: string;               // Font family (e.g., 'Arial', 'monospace')
  cellFontSize: string;                 // Font size (e.g., '12px')
  cellFontWeight: string;               // Font weight ('normal', 'bold', '600')
  cellFontStyle: string;                // Font style (combination of 'bold', 'italic', 'underline')
  
  // Color Settings
  cellTextColor: string | null;         // Text color (hex or rgba)
  cellBackgroundColor: string | null;   // Background color (hex or rgba)
  
  // Alignment
  cellTextAlign: string;                // Horizontal alignment ('left', 'center', 'right')
  cellVerticalAlign: string;            // Vertical alignment ('top', 'middle', 'bottom')
  
  // Border Settings
  applyCellBorders: boolean;            // Enable/disable borders
  cellBorderStyle: string;              // Border style ('solid', 'dashed', 'dotted')
  cellBorderWidth: string;              // Border width (e.g., '1px')
  cellBorderColor: string;              // Border color (hex or rgba)
  cellBorderSides: string;              // Which sides ('all', 'horizontal', 'vertical', specific side)
}
```

## 3. Formatter Tab Settings

Controls how values are displayed (formatting).

```typescript
interface FormatterSettings {
  formatterType: string;                // 'text', 'number', 'currency', 'percentage', 'date', 'custom'
  
  // Number Formatting
  decimalPrecision?: number;            // Number of decimal places
  
  // Date Formatting
  dateFormat?: string;                  // Date format string (e.g., 'MM/DD/YYYY')
  
  // Currency Formatting
  currencySymbol?: string;              // Currency symbol (e.g., '$', '€')
  currencyDecimalPlaces?: number;       // Decimal places for currency
  symbolPosition?: string;              // 'before' or 'after' the value
  
  // Percentage Formatting
  percentDecimalPlaces?: number;        // Decimal places for percentages
  
  // Custom Formatting
  customFormat?: string;                // Custom format string with conditionals
  previewValue?: string;                // Value to use for preview
}
```

### Example Custom Formats:
- Color conditionals: `[>0][Green]"$"#,##0.00;[<0][Red]"$"#,##0.00;$0.00`
- Status indicators: `[=1][Green]"✓";[=0][Red]"✗";"N/A"`
- Score ranges: `[>=90][#00B800]0"%";[>=70][#007C00]0"%";[#FF0000]0"%"`

## 4. Filter Tab Settings

Controls filtering behavior for the column.

```typescript
interface FilterSettings {
  // Basic Filter Settings
  enableFilter: boolean;                // Enable/disable filtering
  enableFloatingFilter: boolean;        // Show floating filter
  filterType: string;                   // 'text', 'number', 'date', 'set', 'multi'
  
  // Text Filter Options
  textDefaultOption?: string;           // Default filter option ('contains', 'equals', 'startsWith')
  textCaseSensitive?: boolean;          // Case sensitive text filtering
  
  // Number Filter Options
  numberDefaultOption?: string;         // Default option ('equals', 'greaterThan', 'lessThan')
  numberAllowedCharPattern?: string;    // Regex pattern for allowed characters
  
  // Date Filter Options
  dateDefaultOption?: string;           // Default option ('equals', 'greaterThan', 'lessThan')
  useBrowserDatePicker?: boolean;       // Use browser's native date picker
  dateMinYear?: number;                 // Minimum year allowed
  dateMaxYear?: number;                 // Maximum year allowed
  
  // Set Filter Options
  setSelectAllOnMiniFilter?: boolean;   // Select all by default in mini filter
  setEnableSearch?: boolean;            // Enable search in set filter
  
  // Multi Filter Options
  multiFilterTypes?: string[];          // Array of filter types to combine
  
  // Common Settings
  showFilterButtons?: boolean;          // Show Apply/Cancel buttons
  closeOnApply?: boolean;               // Close filter after applying
  debounceMs?: number;                  // Debounce delay in milliseconds
}
```

## 5. Editors Tab Settings

Controls in-cell editing behavior.

```typescript
interface EditorSettings {
  editorType: string;                   // 'none', 'text', 'select', 'date'
  
  // Select Editor Options
  selectValueSource?: string;           // 'csv', 'json', 'rest'
  selectCsvValues?: string;             // CSV string of options (e.g., "Option1,Option2,Option3")
  selectJsonValues?: string;            // JSON string of options
  selectRestUrl?: string;               // REST endpoint URL for dynamic options
}
```

## Tab Features Summary

1. **Header Tab**: Controls column header appearance (text, fonts, colors, borders, alignment)
2. **Cell Tab**: Controls cell appearance (similar to header but for data cells)
3. **Formatter Tab**: Controls value display formatting (numbers, dates, currency, custom)
4. **Filter Tab**: Controls filtering behavior and options
5. **Editors Tab**: Controls in-cell editing type and options

Each tab provides:
- Live preview of changes
- Support for bulk updates across multiple columns
- Reset functionality
- Type-safe settings with proper validation