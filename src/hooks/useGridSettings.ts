import { useEffect, useState, useCallback } from 'react';
import { SettingsStore, SettingsCategory } from '@/stores/settings-store';

/**
 * Hook for accessing and updating settings from the SettingsStore
 * @param category The settings category to access
 * @returns Current settings and update function
 */
export function useGridSettings<T>(category: SettingsCategory): [T, (settings: Partial<T>) => void] {
  const settingsStore = SettingsStore.getInstance();
  const [settings, setSettings] = useState<T>(settingsStore.getSettings(category) as T);
  
  // Subscribe to settings changes
  useEffect(() => {
    const unsubscribe = settingsStore.subscribe(category, (newSettings) => {
      setSettings(newSettings as T);
    });
    
    return unsubscribe;
  }, [category]);
  
  // Update settings function
  const updateSettings = useCallback((newSettings: Partial<T>) => {
    settingsStore.updateSettings(category, newSettings);
  }, [category]);
  
  return [settings, updateSettings];
}

/**
 * Hook for accessing toolbar settings
 */
export function useToolbarSettings() {
  return useGridSettings<{
    fontFamily?: string;
    fontSize?: number;
    spacing?: number;
    [key: string]: any;
  }>('toolbar');
}

/**
 * Hook for accessing column settings
 */
export function useColumnSettings() {
  return useGridSettings<{
    autoSizeColumns?: boolean;
    defaultWidth?: number;
    resizable?: boolean;
    sortable?: boolean;
    movable?: boolean;
    [key: string]: any;
  }>('column');
}

/**
 * Hook for accessing theme settings
 */
export function useThemeSettings() {
  return useGridSettings<{
    theme?: string;
    accentColor?: string;
    backgroundColor?: string;
    borderColor?: string;
    textColor?: string;
    [key: string]: any;
  }>('theme');
} 