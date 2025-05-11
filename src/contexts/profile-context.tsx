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
  gridFont?: string; // Font setting for the grid
}

// Define the context state
interface ProfileContextState {
  profiles: GridProfile[];
  currentProfileId: string | null;
  saveProfile: (name: string, gridFont?: string) => Promise<void>;
  updateProfile: (gridFont?: string) => Promise<void>;
  loadProfile: (id: string) => Promise<{ gridFont?: string }>;
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
  loadProfile: async () => ({ gridFont: undefined }),
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
  console.log("📊 ProfileProvider initializing");
  
  const [profiles, setProfiles] = useState<GridProfile[]>([]);
  const [currentProfileId, setCurrentProfileId] = useState<string | null>(null);
  const [gridApi, setGridApi] = useState<GridApi | null>(null);

  // Load profiles from localStorage on mount
  useEffect(() => {
    console.log("📊 Loading profiles from localStorage");
    
    const storedProfiles = localStorage.getItem(STORAGE_KEY);
    if (storedProfiles) {
      try {
        const parsed = JSON.parse(storedProfiles);
        console.log("📊 Loaded profiles:", parsed);
        setProfiles(parsed);
      } catch (e) {
        console.error("📊 [ProfileProvider] Failed to parse profiles from localStorage:", e, storedProfiles);
      }
    } else {
      console.log("📊 No profiles found in localStorage");
    }
    
    const storedCurrentProfile = localStorage.getItem(CURRENT_PROFILE_KEY);
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
      if (profiles.length > 0) {
        console.log("📊 Saving profiles to localStorage:", profiles);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
      }
    } catch (error) {
      console.error("📊 [ProfileProvider] Error saving profiles to localStorage:", error);
    }
  }, [profiles]);

  // Save current profile ID to localStorage when it changes
  useEffect(() => {
    if (currentProfileId) {
      console.log("📊 Saving current profile ID to localStorage:", currentProfileId);
      localStorage.setItem(CURRENT_PROFILE_KEY, currentProfileId);
    } else {
      console.log("📊 Removing current profile ID from localStorage");
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
  const saveProfile = async (name: string, gridFont?: string): Promise<void> => {
    console.log("📊 saveProfile called with name:", name, "and font:", gridFont);
    
    if (!gridApi) {
      console.error("📊 Cannot save profile: Grid API is not available");
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
        console.error(`📊 Grid API is missing method: ${method}. Available methods:`, Object.keys(gridApi));
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

      console.log('📊 [ProfileProvider] Saving profile with columnState:', columnState);
      console.log('📊 [ProfileProvider] Saving profile with columnGroupState:', columnGroupState);
      if (gridFont) {
        console.log('📊 [ProfileProvider] Saving profile with font:', gridFont);
      }

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
        pivotMode,
        gridFont // Include the grid font if provided
      };

      console.log("📊 New profile object:", newProfile);

      // Create a new array with the new profile
      const newProfiles = [...profiles, newProfile];

      // Save to localStorage first
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newProfiles));
        localStorage.setItem(CURRENT_PROFILE_KEY, id);
        console.log("📊 Saved to localStorage successfully");
      } catch (err) {
        console.error("📊 Error saving to localStorage:", err);
      }

      // Update state - do this synchronously to ensure immediate update
      setProfiles(newProfiles);
      setCurrentProfileId(id);

      console.log("📊 Profile saved successfully with ID:", id);
    } catch (error) {
      console.error("📊 Error saving profile:", error);
      return;
    }
  };

  // Load a profile
  const loadProfile = async (id: string): Promise<{ gridFont?: string }> => {
    console.log("📊 loadProfile called with ID:", id);
    
    if (!gridApi) {
      console.log("📊 No grid API available, returning empty result");
      return { gridFont: undefined };
    }

    const profile = profiles.find(p => p.id === id);
    if (!profile) {
      console.log("📊 Profile not found with ID:", id);
      return { gridFont: undefined };
    }

    console.log('📊 [ProfileProvider] Loading profile with columnState:', profile.columnState);
    console.log('📊 [ProfileProvider] Loading profile with columnGroupState:', profile.columnGroupState);
    if (profile.gridFont) {
      console.log('📊 [ProfileProvider] Profile has font:', profile.gridFont);
    } else {
      console.log('📊 [ProfileProvider] Profile has no font defined');
    }

    try {
      // Apply column state (includes sort)
      gridApi.applyColumnState({
        state: profile.columnState,
        applyOrder: true,
      });
      console.log("📊 Applied column state");

      // Apply filter model
      gridApi.setFilterModel(profile.filterModel);
      console.log("📊 Applied filter model");

      // Apply row group columns in saved order
      gridApi.setRowGroupColumns(profile.rowGroupColumns);
      console.log("📊 Applied row group columns");

      // Apply column group state
      gridApi.setColumnGroupState(profile.columnGroupState);
      console.log("📊 Applied column group state");

      // Apply pivot mode
      if (typeof (gridApi as any).setPivotMode === 'function') {
        (gridApi as any).setPivotMode(profile.pivotMode);
        console.log("📊 Applied pivot mode");
      }

      setCurrentProfileId(id);
      console.log("📊 Set current profile ID to:", id);
      
      // Return the grid font so the component can apply it
      const result = { gridFont: profile.gridFont };
      console.log("📊 Returning from loadProfile:", result);
      return result;
    } catch (error) {
      console.error("📊 Error loading profile:", error);
      return { gridFont: profile.gridFont }; // Still return the font even if applying grid state fails
    }
  };

  // Delete a profile
  const deleteProfile = async (id: string) => {
    console.log("📊 deleteProfile called with ID:", id);
    
    const updatedProfiles = profiles.filter(p => p.id !== id);
    setProfiles(updatedProfiles);
    console.log("📊 Filtered out profile with ID:", id);

    if (currentProfileId === id) {
      console.log("📊 Clearing current profile ID because it was deleted");
      setCurrentProfileId(null);
    }
  };

  // Rename a profile
  const renameProfile = async (id: string, newName: string) => {
    console.log("📊 renameProfile called with ID:", id, "and new name:", newName);
    
    const profileIndex = profiles.findIndex(p => p.id === id);
    if (profileIndex === -1) {
      console.log("📊 Profile not found with ID:", id);
      return;
    }

    const updatedProfiles = [...profiles];
    updatedProfiles[profileIndex] = {
      ...updatedProfiles[profileIndex],
      name: newName,
      updatedAt: new Date().toISOString(),
    };

    console.log("📊 Renamed profile with ID:", id);
    setProfiles(updatedProfiles);
  };

  // Update a profile
  const updateProfile = async (gridFont?: string): Promise<void> => {
    console.log("📊 updateProfile called with font:", gridFont);
    
    if (!gridApi || !currentProfileId) {
      console.error("📊 Cannot update profile: Grid API or currentProfileId is not available");
      return;
    }
    const profileIndex = profiles.findIndex(p => p.id === currentProfileId);
    if (profileIndex === -1) {
      console.error("📊 Profile not found for update with ID:", currentProfileId);
      return;
    }
    
    try {
      const columnState = gridApi.getColumnState();
      const filterModel = gridApi.getFilterModel();
      const rowGroupColumns = gridApi.getRowGroupColumns().map(col => col.getColId());
      const columnGroupState = gridApi.getColumnGroupState();
      const pivotMode = gridApi.isPivotMode();
      const now = new Date().toISOString();

      console.log('📊 [ProfileProvider] Updating profile with columnState:', columnState);
      console.log('📊 [ProfileProvider] Updating profile with columnGroupState:', columnGroupState);
      if (gridFont) {
        console.log('📊 [ProfileProvider] Updating profile with font:', gridFont);
      }

      const currentProfile = profiles[profileIndex];
      console.log("📊 Current profile before update:", currentProfile);

      const updatedProfiles = [...profiles];
      updatedProfiles[profileIndex] = {
        ...updatedProfiles[profileIndex],
        columnState,
        filterModel,
        rowGroupColumns,
        columnGroupState,
        pivotMode,
        updatedAt: now,
        ...(gridFont !== undefined ? { gridFont } : {})
      };
      
      console.log("📊 Updated profile:", updatedProfiles[profileIndex]);
      setProfiles(updatedProfiles);
      
      // Ensure the updated profile is saved to localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProfiles));
      console.log("📊 Profile updated and saved to localStorage");
      
    } catch (error) {
      console.error("📊 Error updating profile:", error);
    }
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
