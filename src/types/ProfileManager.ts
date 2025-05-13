export interface Profile {
  id: string;
  name: string;
  settings: ProfileSettings;
}

export interface ProfileSettings {
  toolbar?: {
    fontFamily?: string;
    [key: string]: any;
  };
  [key: string]: any;
}

export interface ProfileManager {
  profiles: Profile[];
  activeProfile: Profile | null;
  loading: boolean;
  saveCurrentProfile: () => Promise<void>;
  selectProfile: (profileId: string) => Promise<void>;
  createProfile: (name: string) => Promise<Profile>;
  deleteProfile: (profileId: string) => Promise<void>;
} 