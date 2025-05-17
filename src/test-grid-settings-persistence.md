# Testing Grid Settings Persistence

## Overview
This document outlines the complete flow for testing grid settings persistence across the three key scenarios:
1. App Load
2. Profile Selection Change
3. Apply Changes in Grid Settings Dialog

## Test Procedures

### 1. Test Grid Settings Dialog Apply Changes
1. Open the app
2. Click on "Grid Settings" button in the toolbar
3. Change various settings:
   - Row Height
   - Header Height
   - Selection Options
   - Enable/Disable features
4. Before clicking "Apply Changes", check console for:
   - Current grid state being preserved
5. Click "Apply Changes"
6. Check console logs for:
   - "🔒 Preserving current grid state before applying settings"
   - "📝 Updating grid options in settings store"
   - "⚙️ Applying grid options to AG-Grid"
   - "🔓 Restoring grid state after applying settings"
7. Verify:
   - Grid settings are applied (row height, header height, etc.)
   - Grid state is preserved (column widths, sort, filters)

### 2. Test Profile Save with Grid Settings
1. After applying grid settings (step 1)
2. Modify grid state:
   - Change column widths
   - Apply sorting
   - Apply filters
3. Click "Save Profile" button
4. Check console logs for:
   - "Collected grid state:" with state object
   - "Collected all settings:" with full settings including gridOptions
5. Verify that saved settings include:
   ```javascript
   {
     toolbar: { ... },
     grid: { columnState, filterState, sortState, ... },
     custom: {
       gridOptions: { rowHeight, headerHeight, ... }
     }
   }
   ```

### 3. Test App Load with Grid Settings
1. After saving profile with grid settings (step 2)
2. Refresh the page
3. Check console logs for:
   - "🚀 Grid ready event fired"
   - "Setting grid API in SettingsController"
   - "📊 Initial application of profile settings on grid ready"
   - "Applying grid state:" with saved state
   - "⚙️ Applying grid options to AG-Grid"
4. Verify:
   - Grid settings are restored (row height, header height, etc.)
   - Grid state is restored (column widths, sort, filters)

### 4. Test Profile Selection Change
1. Create a second profile with different grid settings
2. Switch between profiles
3. Check console logs for:
   - "🔄 Profile switched from X to Y"
   - "📊 Applying settings after profile switch"
   - "⚙️ Applying grid options to AG-Grid"
   - "Applying grid state:" with profile's state
4. Verify:
   - Grid settings change to match selected profile
   - Grid state changes to match selected profile

## Expected Console Log Flow

### When Applying Grid Settings:
```
🔒 Preserving current grid state before applying settings: {...}
📝 Updating grid options in settings store: {...}
⚙️ Applying grid options to AG-Grid
🔓 Restoring grid state after applying settings
🔄 Final grid refresh after all settings applied
```

### When Saving Profile:
```
Collected grid state: {
  columnState: [...],
  filterState: {...},
  sortState: [...],
  ...
}
Collected all settings: {
  toolbar: {...},
  grid: {...},
  custom: {
    gridOptions: {
      rowHeight: 35,
      headerHeight: 50,
      ...
    }
  }
}
```

### When Loading App:
```
🚀 Grid ready event fired
Setting grid API in SettingsController
📊 Initial application of profile settings on grid ready
Applying grid state: {...}
⚙️ Applying grid options to AG-Grid
🔄 Starting grid state application with state: {...}
```

### When Switching Profiles:
```
🔄 Profile switched from profileA to profileB
Setting grid API in SettingsController
📊 Applying settings after profile switch
⚙️ Applying grid options to AG-Grid
Applying grid state: {...}
```

## Key Properties to Verify

### Grid Options (from Grid Settings Dialog):
- `rowHeight`
- `headerHeight`
- `rowSelection`
- `cellSelection`
- `pagination`
- `paginationPageSize`
- `animateRows`
- `suppressRowHoverHighlight`
- `suppressCopyRowsToClipboard`
- `floatingFiltersHeight`

### Grid State (preserved during Apply Changes):
- Column widths
- Column order
- Sort state
- Filter state
- Selection state
- Scroll position
- Focused cell

## Troubleshooting

If settings are not persisting:

1. Check if `gridOptions` are being saved to profile:
   - Look at "Collected all settings" log
   - Verify `custom.gridOptions` contains your settings

2. Check if settings are being applied:
   - Look for "⚙️ Applying grid options to AG-Grid" log
   - Verify the options object contains your settings

3. Check if grid state is being preserved:
   - Look for "🔒 Preserving current grid state" log
   - Look for "🔓 Restoring grid state" log

4. Check for timing issues:
   - Look for proper sequence of logs
   - Grid API must be available before applying settings

5. Check browser storage:
   - Open Developer Tools > Application > Local Storage
   - Look for `ag-grid-profiles` key
   - Verify profiles contain `custom.gridOptions`