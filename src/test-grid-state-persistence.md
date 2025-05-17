# Testing Grid State Persistence

## Test Procedures

### 1. Save Grid State Test
1. Open the app
2. Modify column widths by dragging column borders
3. Change column order by dragging columns
4. Apply sorting to one or more columns
5. Apply filters
6. Click "Save Profile" button
7. Check console logs for:
   - "Collected grid state:" log with state object
   - Verify columnState array has width values
   - Verify sortState array if sorting applied
   - Verify filterState object if filters applied

### 2. Load Grid State on App Load
1. After saving profile with modifications (step 1)
2. Refresh the page
3. Check console logs for:
   - "🚀 Grid ready event fired"
   - "Setting grid API in SettingsController"
   - "📊 Initial application of profile settings on grid ready"
   - "Applying grid state:" with the saved state
   - "🔄 Starting grid state application with state:"
   - Verify column widths, order, sorts, and filters are restored

### 3. Profile Switch Test
1. Create a second profile with different grid state
2. Switch between profiles
3. Check console logs for:
   - "🔄 Profile switched from X to Y"
   - "📊 Applying settings after profile switch"
   - "Applying grid state:" with the profile's state
   - Verify grid state changes to match selected profile

## What to Look For

### In Console Logs:

1. **State Collection**:
   ```
   Collected grid state: {
     columnState: [...],  // Should have width values
     filterState: {...},  // If filters applied
     sortState: [...]     // If sorting applied
   }
   ```

2. **State Application**:
   ```
   🔄 Starting grid state application with state: {
     hasColumnState: true,
     columnCount: X,
     hasFilterState: true/false,
     hasSortState: true/false
   }
   ```

3. **Column State Details**:
   - Each column should have:
     - colId
     - width or actualWidth
     - hide (true/false)
     - sort (if sorting applied)
     - sortIndex (if multi-sort)

### Visual Verification:

1. Column widths match saved state
2. Column order matches saved state
3. Sort indicators appear on correct columns
4. Filter icons show on filtered columns
5. Filtered data matches saved filters

## Debugging Steps

If grid state is not being restored:

1. Check if grid API is available:
   - Look for "Setting grid API in SettingsController" log
   - Verify it happens before state application

2. Check if state is being saved:
   - Look at "Collected grid state:" log
   - Verify state object is not empty

3. Check if state is being loaded:
   - Look at "Applying grid state:" log
   - Verify the state object matches saved state

4. Check timing issues:
   - Grid might not be fully ready
   - Try increasing delays in code

5. Check for errors:
   - Look for any red error messages in console
   - Particularly "Cannot apply grid state" errors