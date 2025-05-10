import React, { createContext, useContext, useState, useEffect } from 'react';
import { ColumnState, FilterModel, GridApi } from 'ag-grid-community';

// Simple UUID generation function
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Define the structure of a grid profile
export interface GridProfile {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  columnState: ColumnState[];
  filterModel: FilterModel;
  rowGroupColumns: string[];
  columnGroupState: any;
  pivotMode: boolean;
}

// Define the context state
interface ProfileContextState {
  profiles: GridProfile[];
  currentProfileId: string | null;
  saveProfile: (name: string) => Promise<void>;
  updateProfile: () => Promise<void>;
  loadProfile: (id: string) => Promise<void>;
  deleteProfile: (id: string) => Promise<void>;
  renameProfile: (id: string, newName: string) => Promise<void>;
  getCurrentGridState: () => Partial<GridProfile> | null;
  gridApi: GridApi | null;
  setGridApi: (api: GridApi | null) => void;
}

// Create the context with default values
const ProfileContext = createContext<ProfileContextState>({
  profiles: [],
  currentProfileId: null,
  saveProfile: async () => {},
  updateProfile: async () => {},
  loadProfile: async () => {},
  deleteProfile: async () => {},
  renameProfile: async () => {},
  getCurrentGridState: () => null,
  gridApi: null,
  setGridApi: () => {},
});

// Storage key for profiles
const STORAGE_KEY = 'ag-grid-profiles';
const CURRENT_PROFILE_KEY = 'ag-grid-current-profile';

// Provider component
export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profiles, setProfiles] = useState<GridProfile[]>([]);
  const [currentProfileId, setCurrentProfileId] = useState<string | null>(null);
  const [gridApi, setGridApi] = useState<GridApi | null>(null);

  // Load profiles from localStorage on mount
  useEffect(() => {
    const storedProfiles = localStorage.getItem(STORAGE_KEY);
    if (storedProfiles) {
      try {
        const parsed = JSON.parse(storedProfiles);
        setProfiles(parsed);
      } catch (e) {
        console.error("[ProfileProvider] Failed to parse profiles from localStorage:", e, storedProfiles);
      }
    }
    const storedCurrentProfile = localStorage.getItem(CURRENT_PROFILE_KEY);
    if (storedCurrentProfile) {
      setCurrentProfileId(storedCurrentProfile);
    }
  }, []);

  // Save profiles to localStorage when they change
  useEffect(() => {
    try {
      if (profiles.length > 0) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
      }
    } catch (error) {
      console.error("[ProfileProvider] Error saving profiles to localStorage:", error);
    }
  }, [profiles]);

  // Save current profile ID to localStorage when it changes
  useEffect(() => {
    if (currentProfileId) {
      localStorage.setItem(CURRENT_PROFILE_KEY, currentProfileId);
    } else {
      localStorage.removeItem(CURRENT_PROFILE_KEY);
    }
  }, [currentProfileId]);

  // Get the current state of the grid
  const getCurrentGridState = (): Partial<GridProfile> | null => {
    if (!gridApi) return null;

    return {
      columnState: typeof gridApi.getColumnState === 'function' ? gridApi.getColumnState() : [],
      filterModel: typeof gridApi.getFilterModel === 'function' ? gridApi.getFilterModel() : {},
      rowGroupColumns: typeof gridApi.getRowGroupColumns === 'function' ? gridApi.getRowGroupColumns().map(col => col.getColId()) : [],
      columnGroupState: typeof gridApi.getColumnGroupState === 'function' ? gridApi.getColumnGroupState() : [],
      pivotMode: typeof gridApi.isPivotMode === 'function' ? gridApi.isPivotMode() : false,
    };
  };

  // Save a new profile or update an existing one
  const saveProfile = async (name: string): Promise<void> => {
    if (!gridApi) {
      console.error("Cannot save profile: Grid API is not available");
      return;
    }
    // Defensive: check for required methods
    const requiredMethods = [
      'getColumnState',
      'getFilterModel',
      'getRowGroupColumns',
      'getColumnGroupState',
    ];
    for (const method of requiredMethods) {
      if (typeof (gridApi as any)[method] !== 'function') {
        console.error(`Grid API is missing method: ${method}. Available methods:`, Object.keys(gridApi));
        return;
      }
    }
    try {
      // Get current grid state
      const columnState = gridApi.getColumnState();
      const filterModel = gridApi.getFilterModel();
      const rowGroupColumns = gridApi.getRowGroupColumns().map(col => col.getColId());
      const columnGroupState = gridApi.getColumnGroupState();
      const pivotMode = gridApi.isPivotMode();

      console.log('[ProfileProvider] Saving profile with columnState:', columnState);
      console.log('[ProfileProvider] Saving profile with columnGroupState:', columnGroupState);

      const now = new Date().toISOString();
      const id = generateUUID();

      // Create new profile object
      const newProfile: GridProfile = {
        id,
        name,
        createdAt: now,
        updatedAt: now,
        columnState,
        filterModel,
        rowGroupColumns,
        columnGroupState,
        pivotMode
      };

      // Create a new array with the new profile
      const newProfiles = [...profiles, newProfile];

      // Save to localStorage first
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newProfiles));
        localStorage.setItem(CURRENT_PROFILE_KEY, id);
      } catch (err) {
        console.error("Error saving to localStorage:", err);
      }

      // Update state - do this synchronously to ensure immediate update
      setProfiles(newProfiles);
      setCurrentProfileId(id);

      console.log("Profile saved successfully");
    } catch (error) {
      console.error("Error saving profile:", error);
      return;
    }
  };

  // Load a profile
  const loadProfile = async (id: string): Promise<void> => {
    if (!gridApi) return;

    const profile = profiles.find(p => p.id === id);
    if (!profile) return;

    console.log('[ProfileProvider] Loading profile with columnState:', profile.columnState);
    console.log('[ProfileProvider] Loading profile with columnGroupState:', profile.columnGroupState);

    // Apply column state (includes sort)
    gridApi.applyColumnState({
      state: profile.columnState,
      applyOrder: true,
    });

    // Apply filter model
    gridApi.setFilterModel(profile.filterModel);

    // Apply row group columns in saved order
    gridApi.setRowGroupColumns(profile.rowGroupColumns);

    // Apply column group state
    gridApi.setColumnGroupState(profile.columnGroupState);

    // Apply pivot mode
    if (typeof (gridApi as any).setPivotMode === 'function') {
      (gridApi as any).setPivotMode(profile.pivotMode);
    }

    setCurrentProfileId(id);
  };

  // Delete a profile
  const deleteProfile = async (id: string) => {
    const updatedProfiles = profiles.filter(p => p.id !== id);
    setProfiles(updatedProfiles);

    if (currentProfileId === id) {
      setCurrentProfileId(null);
    }
  };

  // Rename a profile
  const renameProfile = async (id: string, newName: string) => {
    const profileIndex = profiles.findIndex(p => p.id === id);
    if (profileIndex === -1) return;

    const updatedProfiles = [...profiles];
    updatedProfiles[profileIndex] = {
      ...updatedProfiles[profileIndex],
      name: newName,
      updatedAt: new Date().toISOString(),
    };

    setProfiles(updatedProfiles);
  };

  // Update a profile
  const updateProfile = async (): Promise<void> => {
    if (!gridApi || !currentProfileId) {
      console.error("Cannot update profile: Grid API or currentProfileId is not available");
      return;
    }
    const profileIndex = profiles.findIndex(p => p.id === currentProfileId);
    if (profileIndex === -1) {
      console.error("Profile not found for update");
      return;
    }
    const columnState = gridApi.getColumnState();
    const filterModel = gridApi.getFilterModel();
    const rowGroupColumns = gridApi.getRowGroupColumns().map(col => col.getColId());
    const columnGroupState = gridApi.getColumnGroupState();
    const pivotMode = gridApi.isPivotMode();
    const now = new Date().toISOString();

    console.log('[ProfileProvider] Updating profile with columnState:', columnState);
    console.log('[ProfileProvider] Updating profile with columnGroupState:', columnGroupState);

    const updatedProfiles = [...profiles];
    updatedProfiles[profileIndex] = {
      ...updatedProfiles[profileIndex],
      columnState,
      filterModel,
      rowGroupColumns,
      columnGroupState,
      pivotMode,
      updatedAt: now,
    };
    setProfiles(updatedProfiles);
    // localStorage will be updated by useEffect
  };

  return (
    <ProfileContext.Provider
      value={{
        profiles,
        currentProfileId,
        saveProfile,
        updateProfile,
        loadProfile,
        deleteProfile,
        renameProfile,
        getCurrentGridState,
        gridApi,
        setGridApi,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

// Custom hook to use the profile context
export function useProfile() {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
}
