# AG-Grid Settings Management System

## Overview

This document outlines the architecture for a comprehensive settings management system for AG-Grid. The system centralizes grid settings across multiple customization dialogs, provides real-time updates to the grid, and ensures proper persistence through profiles.

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                          User Interface                          │
└───────────────┬────────────────────────────┬───────────────────┘
                │                            │
                ▼                            ▼
┌───────────────────────────┐    ┌────────────────────────────┐
│       Dialog Boxes        │    │         AG-Grid            │
│ ┌───────────────────────┐ │    │  ┌──────────────────────┐  │
│ │ Column Settings       │ │    │  │ Component            │  │
│ ├───────────────────────┤ │    │  │  ├─ Grid API         │  │
│ │ Filter Settings       │ │    │  │  └─ Event Handlers   │  │
│ ├───────────────────────┤ │    │  └──────────────────────┘  │
│ │ Toolbar Settings      │ │    │                            │
│ ├───────────────────────┤ │    │                            │
│ │ Theme Settings        │ │◄──►│                            │
│ ├───────────────────────┤ │    │                            │
│ │ Export Settings       │ │    │                            │
│ ├───────────────────────┤ │    │                            │
│ │ Sort/Group Settings   │ │    │                            │
│ └───────────────────────┘ │    │                            │
└──────────┬────────────────┘    └─────────────┬──────────────┘
           │                                    │
           │                                    │
           ▼                                    ▼
┌──────────────────────────────────────────────────────────────┐
│                    Settings Management Layer                  │
│ ┌────────────────────────┐      ┌───────────────────────────┐│
│ │ Settings Store         │      │ Settings Controller       ││
│ │ ┌────────────────────┐ │      │ ┌─────────────────────┐   ││
│ │ │ Current Settings   │ │      │ │ Apply Settings      │   ││
│ │ │ ┌─────────────────┐│ │      │ ├─────────────────────┤   ││
│ │ │ │Column Settings  ││ │      │ │ Extract Settings    │   ││
│ │ │ ├─────────────────┤│ │      │ ├─────────────────────┤   ││
│ │ │ │Filter Settings  ││ │◄────►│ │ Transform Settings  │   ││
│ │ │ ├─────────────────┤│ │      │ └─────────────────────┘   ││
│ │ │ │Theme Settings   ││ │      │                           ││
│ │ │ ├─────────────────┤│ │      │                           ││
│ │ │ │Export Settings  ││ │      │                           ││
│ │ │ └─────────────────┘│ │      │                           ││
│ │ └────────────────────┘ │      │                           ││
│ └────────────────────────┘      └───────────────────────────┘│
└──────────────────────┬───────────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────────┐
│                     Profile Management Layer                  │
│ ┌────────────────────────┐      ┌───────────────────────────┐│
│ │ Profile Store          │      │ Profile Manager           ││
│ │ ┌────────────────────┐ │      │ ┌─────────────────────┐   ││
│ │ │ Profiles           │ │      │ │ Load Profile        │   ││
│ │ │                    │ │      │ ├─────────────────────┤   ││
│ │ │                    │ │◄────►│ │ Save Profile        │   ││
│ │ │                    │ │      │ ├─────────────────────┤   ││
│ │ │                    │ │      │ │ Create/Delete       │   ││
│ │ └────────────────────┘ │      │ └─────────────────────┘   ││
│ └────────────────────────┘      └───────────────────────────┘│
└──────────────────────────────────────────────────────────────┘
```

## Key Components

### 1. Settings Store

The Settings Store acts as the single source of truth for all grid settings during an active session.

```typescript
export class SettingsStore {
  private static instance: SettingsStore;
  
  // Main settings categories
  private currentSettings: {
    column: ColumnSettings;
    filter: FilterSettings;
    toolbar: ToolbarSettings;
    theme: ThemeSettings;
    export: ExportSettings;
    sort: SortSettings;
    // Additional categories as needed
  };
  
  private listeners: Array<(category: string, settings: any) => void> = [];
  
  // Singleton pattern
  public static getInstance(): SettingsStore {
    if (!SettingsStore.instance) {
      SettingsStore.instance = new SettingsStore();
    }
    return SettingsStore.instance;
  }
  
  // Methods for updating, getting, and resetting settings
  public updateSettings(category: string, settings: any): void { ... }
  public getAllSettings(): any { ... }
  public getSettings(category: string): any { ... }
  public addListener(listener: Function): () => void { ... }
  public resetToDefaults(): void { ... }
}
```

### 2. Settings Controller

The Settings Controller mediates between the Settings Store and AG-Grid, applying settings to the grid and extracting current settings.

```typescript
export class SettingsController {
  private gridApi: GridApi | null = null;
  private settingsStore: SettingsStore;
  
  constructor() {
    this.settingsStore = SettingsStore.getInstance();
    this.settingsStore.addListener(this.handleSettingsChange.bind(this));
  }
  
  // Methods to integrate with grid and apply settings
  public setGridApi(api: GridApi): void { ... }
  private handleSettingsChange(category: string, settings: any): void { ... }
  public extractCurrentSettings(): any { ... }
  public applyProfileSettings(profileSettings: any): void { ... }
  
  // Category-specific methods
  private applyColumnSettings(settings: any): void { ... }
  private applyFilterSettings(settings: any): void { ... }
  private extractColumnSettings(): any { ... }
  private extractFilterSettings(): any { ... }
}
```

### 3. Dialog Components

Each settings dialog updates the Settings Store when settings are changed.

```typescript
export function ColumnSettingsDialog({ isOpen, onClose }) {
  const settingsStore = SettingsStore.getInstance();
  const [settings, setSettings] = useState(settingsStore.getSettings('column'));
  
  const handleSettingChange = (key, value) => { ... }
  const handleApply = () => {
    settingsStore.updateSettings('column', settings);
    onClose();
  }
  
  return (
    <Dialog open={isOpen} onClose={onClose}>
      {/* Dialog content with form fields */}
      <Button onClick={handleApply}>Apply</Button>
    </Dialog>
  );
}
```

### 4. Profile Management

The Profile Manager integrates with the Settings Store to save and load profiles.

```typescript
export class ProfileManager {
  private settingsStore: SettingsStore;
  private settingsController: SettingsController;
  private profiles: Profile[] = [];
  private activeProfile: Profile | null = null;
  
  // Profile management methods
  public async loadProfiles(): Promise<void> { ... }
  public async saveCurrentProfile(): Promise<void> { ... }
  public async selectProfile(profileId: string): Promise<void> { ... }
  public async createProfile(name: string): Promise<void> { ... }
  private async saveProfileToStorage(profile: Profile): Promise<void> { ... }
}
```

### 5. AG-Grid Integration

The Data Table component connects all these layers to create a cohesive system.

```typescript
export function DataTable({ data, columns }) {
  const gridRef = useRef(null);
  const settingsControllerRef = useRef<SettingsController | null>(null);
  const profileManagerRef = useRef<ProfileManager | null>(null);
  
  // Initialize controller and manager
  useEffect(() => { ... })
  
  // Grid integration
  const onGridReady = (params) => { ... }
  
  return (
    <div className="data-table-container">
      <div className="data-table-toolbar">
        <ProfileSelector profileManager={profileManagerRef.current} />
        <SaveProfileButton onClick={() => profileManagerRef.current?.saveCurrentProfile()} />
        <SettingsDialogButton settingsStore={SettingsStore.getInstance()} />
      </div>
      
      <AgGridReact
        ref={gridRef}
        columnDefs={columns}
        rowData={data}
        onGridReady={onGridReady}
        // other grid props
      />
    </div>
  );
}
```

## Settings Categories

The system will support the following settings categories (expandable as needed):

| Category | Description | Example Settings |
|----------|-------------|-----------------|
| Column | Column-related settings | Width, visibility, order, pinning |
| Filter | Filtering configuration | Filter model, quick filter, advanced filters |
| Toolbar | Toolbar customization | Visible buttons, position, size |
| Theme | Visual appearance | Colors, fonts, spacing, borders |
| Export | Export configuration | CSV/Excel options, exported columns |
| Sort | Sorting behavior | Multi-sort keys, default sort order |
| Group | Grouping configuration | Group columns, expansion state |
| Cell | Cell rendering options | Cell padding, alignment, overflow |
| Selection | Selection behavior | Row/cell selection mode, multi-select |
| Pagination | Pagination settings | Page size, navigation buttons |

## Implementation Plan

### Phase 1: Core Infrastructure

1. Implement the Settings Store
2. Refactor existing SettingsController to use the Store
3. Update ProfileManager to work with the Store
4. Add basic integration with existing dialogs

### Phase 2: Enhanced Dialog Framework

1. Create a reusable dialog component framework
2. Implement settings category interfaces and validation
3. Build core dialogs for most common settings
4. Add real-time preview capabilities

### Phase 3: Advanced Features

1. Implement settings presets and templates
2. Add import/export functionality for settings
3. Create advanced dialogs for specialized grid features
4. Implement fine-grained permission control for settings

## Benefits

1. **Centralization**: All settings in one place
2. **Consistency**: Uniform treatment of different setting types
3. **Real-time Updates**: Changes immediately reflected in the grid
4. **Extensibility**: Easy addition of new settings and dialogs
5. **Performance**: Optimized updates to minimize grid refreshes

This architecture provides a robust foundation for managing complex AG-Grid settings across multiple customization dialogs while ensuring proper persistence through profiles. 