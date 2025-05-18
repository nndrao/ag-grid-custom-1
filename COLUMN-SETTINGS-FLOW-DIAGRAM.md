# Column Settings Flow Diagram

## 1. User Modifies Column Settings

```mermaid
sequenceDiagram
    participant User
    participant ColumnSettingsDialog
    participant GridApi
    participant ColumnSettingsPersistence
    participant ProfileStore
    participant ActiveProfile
    
    User->>ColumnSettingsDialog: Opens dialog
    ColumnSettingsDialog->>GridApi: gridApi.getColumnDefs()
    GridApi-->>ColumnSettingsDialog: Current column definitions
    
    Note over ColumnSettingsDialog: Also tries to load saved settings
    ColumnSettingsDialog->>ColumnSettingsPersistence: getColumnSettings()
    ColumnSettingsPersistence->>ProfileStore: getActiveProfile()
    ProfileStore-->>ColumnSettingsPersistence: Active profile data
    ColumnSettingsPersistence-->>ColumnSettingsDialog: Saved column settings (if any)
    
    User->>ColumnSettingsDialog: Modifies settings
    User->>ColumnSettingsDialog: Clicks "Apply Changes"
    
    ColumnSettingsDialog->>GridApi: gridApi.updateGridOptions({columnDefs})
    Note over GridApi: Updates grid immediately
    
    ColumnSettingsDialog->>ColumnSettingsPersistence: saveColumnSettings(columnDefs)
    ColumnSettingsPersistence->>ProfileStore: getActiveProfile()
    ProfileStore-->>ColumnSettingsPersistence: Active profile
    ColumnSettingsPersistence->>ProfileStore: updateProfile(id, {...profile, settings.custom.columnDefs})
    ProfileStore->>ActiveProfile: Updates profile with column settings
    Note over ActiveProfile: Settings stored in memory
```

## 2. User Saves Profile

```mermaid
sequenceDiagram
    participant User
    participant GridSettingsMenu
    participant ProfileManager
    participant SettingsController
    participant ProfileStore
    participant LocalStorage
    
    User->>GridSettingsMenu: Clicks "Save Settings to Profile"
    GridSettingsMenu->>ProfileManager: saveCurrentProfile()
    
    Note over ProfileManager: Collects all current settings
    ProfileManager->>SettingsController: collectCurrentSettings()
    SettingsController->>GridApi: getColumnDefs()
    GridApi-->>SettingsController: Current column definitions
    SettingsController-->>ProfileManager: All settings including custom.columnDefs
    
    ProfileManager->>ProfileStore: updateProfile(activeProfile.id, settings)
    ProfileStore->>LocalStorage: localStorage.setItem('ag-grid-profiles', profiles)
    Note over LocalStorage: Persisted to browser storage
```

## 3. App Load Flow

```mermaid
sequenceDiagram
    participant App
    participant DataTable
    participant ProfileManager
    participant ColumnSettingsPersistence
    participant ProfileStore
    participant LocalStorage
    participant GridApi
    
    App->>DataTable: Renders DataTable component
    DataTable->>ProfileManager: useProfileManager2()
    ProfileManager->>ProfileStore: getInstance()
    ProfileStore->>LocalStorage: localStorage.getItem('ag-grid-profiles')
    LocalStorage-->>ProfileStore: Stored profiles data
    ProfileStore-->>ProfileManager: Active profile
    
    Note over DataTable: Memoized column definitions
    DataTable->>ColumnSettingsPersistence: getColumnSettings()
    ColumnSettingsPersistence->>ProfileStore: getActiveProfile()
    ProfileStore-->>ColumnSettingsPersistence: Active profile with settings
    ColumnSettingsPersistence-->>DataTable: Saved column definitions
    
    DataTable->>DataTable: Merge saved columns with default columns
    DataTable->>AgGridReact: Pass merged columnDefs
    AgGridReact->>GridApi: Initialize with column definitions
    Note over GridApi: Grid displays with saved column settings
```

## 4. Profile Change Flow

```mermaid
sequenceDiagram
    participant User
    participant ProfileSelector
    participant ProfileManager
    participant SettingsController
    participant DataTable
    participant GridApi
    
    User->>ProfileSelector: Selects different profile
    ProfileSelector->>ProfileManager: switchProfile(profileId)
    ProfileManager->>ProfileStore: setActiveProfile(profileId)
    ProfileStore-->>ProfileManager: New active profile
    
    ProfileManager->>SettingsController: applyProfileSettings(profile.settings)
    SettingsController->>GridApi: setGridOption('columnDefs', settings.custom.columnDefs)
    Note over GridApi: Grid updates with new column settings
    
    Note over DataTable: Component re-renders with new profile
    DataTable->>DataTable: memoizedColumnDefs recalculates
    DataTable->>ColumnSettingsPersistence: getColumnSettings()
    ColumnSettingsPersistence-->>DataTable: New profile's column settings
    DataTable->>GridApi: Updates column definitions
```

## Data Structure

```typescript
// Profile structure in localStorage
{
  profiles: {
    [profileId]: {
      id: string,
      name: string,
      settings: {
        toolbar: {...},
        gridOptions: {...},
        custom: {
          columnDefs: [
            {
              field: 'name',
              headerName: 'Name',
              width: 200,
              // ... other column properties
            },
            // ... more columns
          ]
        }
      }
    }
  },
  activeProfileId: string
}
```

## Key Components

1. **ColumnSettingsDialog**: UI for modifying column settings
2. **ColumnSettingsPersistence**: Utility for saving/loading column settings
3. **ProfileStore**: Manages profile data in localStorage
4. **ProfileManager**: Orchestrates profile operations
5. **SettingsController**: Applies settings to AG Grid
6. **DataTable**: Main grid component that uses saved settings

## Flow Summary

1. **Modifying Settings**: Dialog → Grid API → Profile Store (in memory)
2. **Saving Profile**: Profile Manager → Settings Controller → Profile Store → LocalStorage
3. **Loading on App Start**: LocalStorage → Profile Store → DataTable → Grid API
4. **Profile Switch**: Profile Selector → Profile Manager → Settings Controller → Grid API