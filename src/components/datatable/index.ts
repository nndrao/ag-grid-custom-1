/**
 * DataTable component and related exports
 * This is a self-contained AG-Grid wrapper with customization and profile management
 */
export { DataTable } from './data-table';
export type { ColumnDef } from './data-table';

// Optional exports for advanced usage
export { SettingsController } from './services/settings-controller';
export { GridStateProvider } from './services/gridStateProvider';  
export { ProfileManager } from './services/profile-manager';
export { SettingsStore } from './stores/settings-store';
export { ProfileStore } from './stores/profile-store';

// Types
export type {
  Profile,
  ProfileSettings,
  GridSettings,
  ToolbarSettings
} from './types/profile.types';

export type { ProfileManager as ProfileManagerInterface } from './types/ProfileManager';

// Hooks
export { useProfileManager2 } from './hooks/useProfileManager2';
export { useAgGridTheme } from './hooks/useAgGridTheme';
export { useDebounce, useDebouncedValue } from './hooks/useDebounce';