# Column Settings V2 Implementation

## Overview

This implementation follows the refined workflow for column settings management in AG-Grid with the following improvements:

1. **Map-based state management** for O(1) column lookup performance
2. **Better separation of concerns** between base column definitions and styling
3. **Improved error handling and validation**
4. **Optimized grid updates** with single operations
5. **Enhanced persistence** with additional column metadata

## Key Components

### 1. Type Definitions (`types.ts`)

```typescript
// Core column settings structure
interface ColumnSettings {
  columnId: string;              // Column identifier
  header?: HeaderSettings;       // Header styling
  cell?: CellSettings;          // Cell styling
  formatter?: FormatterSettings; // Value formatting
  filter?: FilterSettings;      // Filter configuration
  editor?: EditorSettings;      // Editor configuration
  lastModified?: number;        // Timestamp
  isDirty?: boolean;           // Change tracking
}

// Map structure for efficient lookup
interface ColumnSettingsMap {
  [columnId: string]: ColumnSettings;
}

// Profile storage structure
interface ProfileCustomSettings {
  columnSettings: ColumnSettingsMap;
  columnOrder?: string[];     // Column order tracking
  hiddenColumns?: string[];   // Hidden columns
  columnState?: any[];        // AG-Grid column state
}
```

### 2. Conversion Utilities (`conversion-utils.ts`)

Provides functions to:
- Convert `ColumnSettings` to AG-Grid `ColDef` properties
- Extract `ColumnSettings` from existing `ColDef`
- Validate column settings
- Merge settings with proper precedence

### 3. Persistence V2 (`column-settings-persistence-v2.ts`)

Enhanced persistence utility that:
- Saves/loads settings using the Map structure
- Handles additional metadata (column order, visibility)
- Provides import/export functionality
- Maintains backward compatibility

### 4. Column Settings Dialog V2 (`ColumnSettingsDialog-v2.tsx`)

Improved dialog with:
- Map-based state management
- Better error handling with user feedback
- Loading states and progress indicators
- Optimized performance for bulk operations
- Validation before applying changes

### 5. Data Table V2 (`data-table-v2.tsx`)

Updated data table that:
- Applies saved settings on initialization
- Uses the V2 persistence utility
- Handles column state restoration
- Provides better error recovery

## Workflow

### 1. Opening the Dialog

```typescript
// Load column definitions from grid
const currentColDefs = gridApi.getColumnDefs();

// Clone and reset style properties
const editableColDefs = currentColDefs.map(col => ({
  ...col,
  headerClass: undefined,
  cellClass: undefined,
  headerStyle: undefined,
  cellStyle: undefined,
  valueFormatter: undefined
}));

// Load saved settings from profile
const savedSettings = ColumnSettingsPersistenceV2.getColumnSettings();
const columnSettingsMap = savedSettings?.columnSettings || {};
```

### 2. Modifying Settings

```typescript
// Update settings for specific column and tab
const updateColumnSettings = (tabName, updates) => {
  const columnId = selectedColumn;
  const existing = columnSettingsMap[columnId];
  
  const updatedSettings = mergeColumnSettings(existing, {
    [tabName]: {
      ...existing?.[tabName],
      ...updates
    }
  });
  
  setColumnSettingsMap({
    ...columnSettingsMap,
    [columnId]: updatedSettings
  });
};
```

### 3. Applying Changes

```typescript
const applyChanges = async () => {
  // Validate settings
  for (const [columnId, settings] of Object.entries(columnSettingsMap)) {
    const errors = validateColumnSettings(settings);
    if (errors.length > 0) throw new Error(errors.join(', '));
  }
  
  // Apply to grid
  const updatedColDefs = currentColDefs.map(col => {
    const settings = columnSettingsMap[col.field];
    if (!settings) return col;
    
    return {
      ...col,
      ...convertSettingsToColDef(settings)
    };
  });
  
  gridApi.updateGridOptions({
    columnDefs: updatedColDefs,
    suppressColumnMoveAnimation: true,
    maintainColumnOrder: true
  });
  
  // Save to profile
  ColumnSettingsPersistenceV2.saveColumnSettings(columnSettingsMap);
};
```

### 4. Loading on App Start

```typescript
// In DataTableV2
const memoizedColumnDefs = useMemo(() => {
  const savedSettings = ColumnSettingsPersistenceV2.getColumnSettings();
  
  if (savedSettings?.columnSettings) {
    return columnDefs.map(col => {
      const settings = savedSettings.columnSettings[col.field];
      if (!settings) return col;
      
      return {
        ...col,
        ...convertSettingsToColDef(settings)
      };
    });
  }
  
  return columnDefs;
}, [columnDefs]);
```

## Benefits

1. **Performance**: Map structure provides O(1) lookup for column settings
2. **Reliability**: Better error handling and validation
3. **User Experience**: Loading states, progress indicators, and error messages
4. **Maintainability**: Clear separation of concerns and well-organized code
5. **Extensibility**: Easy to add new settings or features

## Migration from V1

To migrate from the old implementation:

1. Update imports to use V2 components
2. Update data structure from array to map
3. Update persistence calls to use V2 utility
4. Update dialog references to V2 version

The V2 implementation maintains backward compatibility where possible, but the data structure change requires careful migration of existing saved settings.

## Testing

Use the test component at `/src/test-column-settings-v2.tsx` to verify:
- Column settings dialog functionality
- Save/load persistence
- Error handling
- Performance with many columns
- Bulk operations