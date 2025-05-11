import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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
  columnState?: ColumnState[];
  filterModel?: FilterModel;
  rowGroupColumns?: string[];
  columnGroupState?: any; // Consider a more specific type from AG Grid if available
  pivotMode?: boolean;
  gridFont?: string; // Font setting for the grid
}

// Define the context state
interface ProfileContextState {
  profiles: GridProfile[];
  currentProfileId: string | null;
  gridApi: GridApi | null;
  setGridApi: (api: GridApi | null) => void;
  saveNewProfile: (name: string, font: string) => Promise<string | null>;
  updateCurrentProfile: (font: string) => Promise<void>;
  loadProfile: (id: string) => Promise<GridProfile | null>;
  deleteProfile: (id: string) => Promise<void>;
  renameProfile: (id: string, newName: string) => Promise<void>;
  getActiveProfile: () => GridProfile | null;
}

// Create the context with default values
const ProfileContext = createContext<ProfileContextState | undefined>(undefined);

// Storage key for profiles
const PROFILES_STORAGE_KEY = 'ag-grid-app-profiles';
const CURRENT_PROFILE_ID_KEY = 'ag-grid-app-current-profile-id';

// Provider component
export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  console.log("📊 ProfileProvider initializing");
  
  const [profiles, setProfiles] = useState<GridProfile[]>([]);
  const [currentProfileId, setCurrentProfileId] = useState<string | null>(null);
  const [gridApi, setGridApi] = useState<GridApi | null>(null);

  // Load profiles from localStorage on mount
  useEffect(() => {
    console.log("📊 Loading profiles from localStorage");
    
    const storedProfiles = localStorage.getItem(PROFILES_STORAGE_KEY);
    if (storedProfiles) {
      try {
        const parsed = JSON.parse(storedProfiles);
        console.log("📊 Loaded profiles:", parsed);
        setProfiles(parsed);
      } catch (e) {
        console.error("📊 [ProfileProvider] Failed to parse profiles from localStorage:", e, storedProfiles);
        setProfiles([]);
      }
    } else {
      console.log("📊 No profiles found in localStorage");
    }
    
    const storedCurrentProfile = localStorage.getItem(CURRENT_PROFILE_ID_KEY);
    if (storedCurrentProfile) {
      console.log("📊 Setting current profile ID from localStorage:", storedCurrentProfile);
      setCurrentProfileId(storedCurrentProfile);
    } else {
      console.log("📊 No current profile ID in localStorage");
    }
  }, []);

  // Save profiles to localStorage when they change
  useEffect(() => {
    try {
      // Only save if there are profiles, to avoid writing an empty array string constantly if not needed
      // Or, to clear it if profiles array becomes empty after a deletion.
      if (profiles.length > 0) {
        console.log("📊 Saving profiles to localStorage:", profiles);
        localStorage.setItem(PROFILES_STORAGE_KEY, JSON.stringify(profiles));
      } else {
        // If profiles is empty, remove it from localStorage to keep it clean
        localStorage.removeItem(PROFILES_STORAGE_KEY);
        console.log("📊 Profiles empty, removed from localStorage");
      }
    } catch (error) {
      console.error("📊 [ProfileProvider] Error saving profiles to localStorage:", error);
    }
  }, [profiles]);

  // Save current profile ID to localStorage when it changes
  useEffect(() => {
    if (currentProfileId) {
      console.log("📊 Saving current profile ID to localStorage:", currentProfileId);
      localStorage.setItem(CURRENT_PROFILE_ID_KEY, currentProfileId);
    } else {
      console.log("📊 Removing current profile ID from localStorage");
      localStorage.removeItem(CURRENT_PROFILE_ID_KEY);
    }
  }, [currentProfileId]);

  const getLiveGridState = useCallback(() => {
    if (!gridApi) return {};
    return {
      columnState: gridApi.getColumnState ? gridApi.getColumnState() : undefined,
      filterModel: gridApi.getFilterModel ? gridApi.getFilterModel() : undefined,
      rowGroupColumns: gridApi.getRowGroupColumns ? gridApi.getRowGroupColumns().map(col => col.getColId()) : undefined,
      columnGroupState: gridApi.getColumnGroupState ? gridApi.getColumnGroupState() : undefined,
      pivotMode: gridApi.isPivotMode ? gridApi.isPivotMode() : undefined,
    };
  }, [gridApi]);

  const saveNewProfile = useCallback(async (name: string, font: string): Promise<string | null> => {
    if (!name.trim()) {
      console.error('[ProfileProvider] Profile name cannot be empty');
      return null;
    }
    const now = new Date().toISOString();
    const newProfile: GridProfile = {
      id: generateUUID(),
      name,
      createdAt: now,
      updatedAt: now,
      gridFont: font,
      ...getLiveGridState(),
    };
    setProfiles(prev => [...prev, newProfile]);
    setCurrentProfileId(newProfile.id);
    return newProfile.id;
  }, [getLiveGridState]);

  const updateCurrentProfile = useCallback(async (font: string) => {
    if (!currentProfileId) {
      console.warn('[ProfileProvider] No current profile to update.');
      return;
    }
    setProfiles(prev =>
      prev.map(p =>
        p.id === currentProfileId
          ? { ...p, ...getLiveGridState(), gridFont: font, updatedAt: new Date().toISOString() }
          : p
      )
    );
  }, [currentProfileId, getLiveGridState]);

  const loadProfile = useCallback(async (id: string): Promise<GridProfile | null> => {
    console.log("📊 loadProfile called with ID:", id);
    
    const profileToLoad = profiles.find(p => p.id === id);
    if (!profileToLoad) {
      console.warn(`[ProfileProvider] Profile with id ${id} not found for loading.`);
      return null;
    }

    // Only attempt to apply to grid if API is available
    if (gridApi) {
      console.log('📊 [ProfileProvider] Applying to grid. Profile:', profileToLoad);
      try {
        if (profileToLoad.columnState) {
          gridApi.applyColumnState({ state: profileToLoad.columnState, applyOrder: true });
          console.log("📊 Applied column state");
        }
        if (profileToLoad.filterModel) {
          gridApi.setFilterModel(profileToLoad.filterModel);
          console.log("📊 Applied filter model");
        }
        if (profileToLoad.rowGroupColumns) {
          gridApi.setRowGroupColumns(profileToLoad.rowGroupColumns);
          console.log("📊 Applied row group columns");
        }
        if (profileToLoad.columnGroupState) {
          gridApi.setColumnGroupState(profileToLoad.columnGroupState);
          console.log("📊 Applied column group state");
        }
        if (profileToLoad.pivotMode !== undefined && typeof gridApi.setPivotMode === 'function') {
          gridApi.setPivotMode(profileToLoad.pivotMode);
          console.log("📊 Applied pivot mode");
        }
      } catch (error) {
        console.error("📊 Error applying profile to grid:", error);
        // Potentially return null or don't set currentProfileId if critical parts fail
      }
    } else {
      console.warn("📊 Grid API not available during loadProfile for ID:", id, "Profile state will not be applied to grid.");
    }

    setCurrentProfileId(id); // Set as current even if gridApi wasn't ready (font might still load)
    console.log("📊 Set current profile ID to:", id);
    return profileToLoad;
  }, [profiles, gridApi]);

  const deleteProfile = useCallback(async (id: string) => {
    setProfiles(prev => prev.filter(p => p.id !== id));
    if (currentProfileId === id) {
      setCurrentProfileId(null);
    }
  }, [currentProfileId]);

  const renameProfile = useCallback(async (id: string, newName: string) => {
    if (!newName.trim()) {
      console.error('[ProfileProvider] New profile name cannot be empty');
      return;
    }
    setProfiles(prev =>
      prev.map(p => (p.id === id ? { ...p, name: newName, updatedAt: new Date().toISOString() } : p))
    );
  }, []);

  const getActiveProfile = useCallback(() => {
    return profiles.find(p => p.id === currentProfileId) || null;
  }, [profiles, currentProfileId]);

  return (
    <ProfileContext.Provider
      value={{
        profiles,
        currentProfileId,
        gridApi,
        setGridApi,
        saveNewProfile,
        updateCurrentProfile,
        loadProfile,
        deleteProfile,
        renameProfile,
        getActiveProfile,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};

export function useProfile() {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
} 