import { Profile } from '@/types/profile.types';
import { SingletonRegistry } from '@/lib/singleton-registry';

const PROFILE_STORAGE_KEY = 'ag-grid-profiles';
const ACTIVE_PROFILE_KEY = 'ag-grid-active-profile';

export class ProfileStore {

  private constructor() {}

  static getInstance(options?: { reset?: boolean }): ProfileStore {
    return SingletonRegistry.getInstance(
      'ProfileStore',
      () => new ProfileStore(),
      options
    );
  }
  
  // Clear singleton instance (useful for testing)
  static clearInstance(): void {
    SingletonRegistry.clearInstance('ProfileStore');
  }

  async getAllProfiles(): Promise<Profile[]> {
    try {
      const data = localStorage.getItem(PROFILE_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      return [];
    }
  }

  async saveProfile(profile: Profile): Promise<void> {
    const profiles = await this.getAllProfiles();
    const index = profiles.findIndex(p => p.id === profile.id);
    
    if (index >= 0) {
      profiles[index] = profile;
    } else {
      profiles.push(profile);
    }
    
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profiles));
  }

  async deleteProfile(profileId: string): Promise<void> {
    const profiles = await this.getAllProfiles();
    const filtered = profiles.filter(p => p.id !== profileId);
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(filtered));
  }

  async getActiveProfileId(): Promise<string | null> {
    return localStorage.getItem(ACTIVE_PROFILE_KEY);
  }

  async setActiveProfileId(profileId: string): Promise<void> {
    localStorage.setItem(ACTIVE_PROFILE_KEY, profileId);
  }

  async createProfile(name: string, settings: any): Promise<Profile> {
    const newProfile: Profile = {
      id: `profile-${Date.now()}`,
      name,
      isActive: false,
      settings,
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        lastUsed: new Date()
      }
    };

    await this.saveProfile(newProfile);
    return newProfile;
  }
} 