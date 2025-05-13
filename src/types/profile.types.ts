export interface Profile {
  id: string;
  name: string;
  isDefault: boolean;
  settings: ProfileSettings;
  metadata: ProfileMetadata;
}

export interface ProfileSettings {
  toolbar: ToolbarSettings;
  grid: GridSettings;
  custom: CustomSettings;
}

export interface ToolbarSettings {
  fontFamily: string;
  fontSize?: number;
  spacing?: number;
}

export interface GridSettings {
  columnState?: any;
  filterState?: any;
  sortState?: any;
  groupState?: any;
  sideBarState?: any;
}

export interface CustomSettings {
  [key: string]: any;
}

export interface ProfileMetadata {
  createdAt: Date;
  updatedAt: Date;
  version: string;
} 