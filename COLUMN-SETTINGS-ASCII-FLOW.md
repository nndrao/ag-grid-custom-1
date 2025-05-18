# Column Settings Flow - ASCII Diagrams

## 1. Column Settings Dialog - Apply Changes Flow

```
┌─────────────────────┐     ┌──────────────────┐     ┌───────────────────────┐
│  User Opens Dialog  │────>│  Load Current    │────>│  Load Saved Settings  │
│                     │     │  Column Defs     │     │  from Profile Store   │
└─────────────────────┘     └──────────────────┘     └───────────────────────┘
                                     │                          │
                                     ▼                          ▼
                            ┌──────────────────┐     ┌───────────────────────┐
                            │  Current Columns │     │   Saved Settings      │
                            │  from Grid API   │     │  (if available)       │
                            └──────────────────┘     └───────────────────────┘
                                     │                          │
                                     └────────┬─────────────────┘
                                              ▼
                                    ┌──────────────────┐
                                    │  Merge & Display │
                                    │   in Dialog      │
                                    └──────────────────┘
                                              │
                                              ▼
                                    ┌──────────────────┐
                                    │  User Modifies   │
                                    │    Settings      │
                                    └──────────────────┘
                                              │
                                              ▼
                                    ┌──────────────────┐
                                    │  Click "Apply"   │
                                    └──────────────────┘
                                              │
                                ┌─────────────┴─────────────┐
                                ▼                           ▼
                    ┌───────────────────────┐   ┌───────────────────────┐
                    │  Apply to Grid        │   │  Save via             │
                    │  updateGridOptions()  │   │  ColumnSettings       │
                    └───────────────────────┘   │  Persistence          │
                                                └───────────────────────┘
                                                           │
                                                           ▼
                                                ┌───────────────────────┐
                                                │  Update Profile       │
                                                │  in Memory           │
                                                └───────────────────────┘
```

## 2. Save Profile Button Flow

```
┌─────────────────────┐
│ User Clicks "Save"  │
│ Settings to Profile │
└─────────────────────┘
           │
           ▼
┌─────────────────────┐     ┌──────────────────────┐
│  ProfileManager     │────>│  SettingsController  │
│  saveCurrentProfile │     │  collectCurrentSettings│
└─────────────────────┘     └──────────────────────┘
                                      │
                            ┌─────────┴──────────┐
                            ▼                    ▼
                    ┌──────────────┐    ┌──────────────┐
                    │ Get Column   │    │ Get Other    │
                    │ Definitions  │    │ Settings     │
                    └──────────────┘    └──────────────┘
                            │                    │
                            └─────────┬──────────┘
                                      ▼
                            ┌──────────────────┐
                            │ Combine All      │
                            │ Settings         │
                            └──────────────────┘
                                      │
                                      ▼
                            ┌──────────────────┐     ┌──────────────┐
                            │ ProfileStore     │────>│ LocalStorage │
                            │ updateProfile    │     │ persist      │
                            └──────────────────┘     └──────────────┘
```

## 3. App Load Flow

```
┌─────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│   App Starts    │────>│ DataTable Renders│────>│ ProfileManager   │
└─────────────────┘     └──────────────────┘     │ Initializes      │
                                                 └──────────────────┘
                                                          │
                                                          ▼
                                                 ┌──────────────────┐
                                                 │ Load Profiles    │
                                                 │ from LocalStorage│
                                                 └──────────────────┘
                                                          │
                                                          ▼
                                                 ┌──────────────────┐
                                                 │ Get Active       │
                                                 │ Profile          │
                                                 └──────────────────┘
                                                          │
                                                          ▼
                                                 ┌──────────────────┐
                                                 │ ColumnSettings   │
                                                 │ Persistence      │
                                                 │ getColumnSettings│
                                                 └──────────────────┘
                                                          │
                                                          ▼
                                                 ┌──────────────────┐
                                                 │ Extract Saved    │
                                                 │ Column Defs      │
                                                 └──────────────────┘
                                                          │
                                                          ▼
                                                 ┌──────────────────┐
                                                 │ Merge with       │
                                                 │ Default Columns  │
                                                 └──────────────────┘
                                                          │
                                                          ▼
                                                 ┌──────────────────┐
                                                 │ Pass to AG-Grid  │
                                                 └──────────────────┘
                                                          │
                                                          ▼
                                                 ┌──────────────────┐
                                                 │ Grid Renders     │
                                                 │ with Settings    │
                                                 └──────────────────┘
```

## 4. Profile Switch Flow

```
┌─────────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│ User Selects        │────>│ ProfileManager   │────>│ Set New Active   │
│ Different Profile   │     │ switchProfile    │     │ Profile          │
└─────────────────────┘     └──────────────────┘     └──────────────────┘
                                                              │
                                                              ▼
                                                     ┌──────────────────┐
                                                     │ Settings         │
                                                     │ Controller       │
                                                     │ applyProfile     │
                                                     │ Settings         │
                                                     └──────────────────┘
                                                              │
                                                              ▼
                                                     ┌──────────────────┐
                                                     │ Extract Column   │
                                                     │ Defs from New    │
                                                     │ Profile          │
                                                     └──────────────────┘
                                                              │
                                                              ▼
                                                     ┌──────────────────┐
                                                     │ Apply to Grid    │
                                                     │ setGridOption    │
                                                     └──────────────────┘
                                                              │
                                                              ▼
                                                     ┌──────────────────┐
                                                     │ Grid Re-renders  │
                                                     │ with New Settings│
                                                     └──────────────────┘
```

## Key Storage Structure

```
LocalStorage['ag-grid-profiles'] = {
    profiles: {
        "profile-123": {
            id: "profile-123",
            name: "Custom View",
            settings: {
                toolbar: { ... },
                gridOptions: { ... },
                custom: {
                    columnDefs: [
                        {
                            field: "name",
                            headerName: "Name",
                            width: 200,
                            sort: "asc",
                            // ... other column properties
                        },
                        // ... more columns
                    ]
                }
            }
        }
    },
    activeProfileId: "profile-123"
}
```

## Component Relationships

```
                        ┌─────────────────────────┐
                        │   User Interface        │
                        ├─────────────────────────┤
                        │ • Column Settings Dialog│
                        │ • Profile Selector      │
                        │ • Save Profile Button   │
                        └───────────┬─────────────┘
                                    │
                        ┌───────────▼─────────────┐
                        │   Service Layer         │
                        ├─────────────────────────┤
                        │ • ColumnSettingsPersist │
                        │ • ProfileManager        │
                        │ • SettingsController    │
                        └───────────┬─────────────┘
                                    │
                        ┌───────────▼─────────────┐
                        │   Storage Layer         │
                        ├─────────────────────────┤
                        │ • ProfileStore          │
                        │ • LocalStorage          │
                        └─────────────────────────┘
                                    │
                        ┌───────────▼─────────────┐
                        │   Presentation Layer    │
                        ├─────────────────────────┤
                        │ • AG-Grid               │
                        │ • DataTable Component   │
                        └─────────────────────────┘
```