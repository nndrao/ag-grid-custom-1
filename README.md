# AG-Grid Profile Management System

This project implements an AG-Grid table with a profile management system that allows users to save and restore grid configurations.

## Features

### Profile Management
- **Save Profile**: Save the current grid state and toolbar settings as a named profile
- **Load Profile**: Switch between different saved profiles
- **Delete Profile**: Remove unwanted profiles
- **Create Profile**: Create new profiles with custom names

### Saved Settings
The profile management system saves:

1. **Toolbar Settings**
   - Font family
   - Font size
   - Spacing

2. **Grid Settings**
   - Column state (width, visibility, order)
   - Filter state
   - Sort state
   - Group state
   - Sidebar state

## Usage

### Creating a Profile
1. Configure your grid and toolbar settings as desired
2. Click on the "New Profile" button
3. Enter a name for your profile
4. Click "Create Profile"

### Switching Profiles
1. Use the profile dropdown to select from available profiles
2. The grid will automatically update to the saved configuration

### Updating a Profile
1. Select the profile you want to update
2. Make your changes to the grid or toolbar
3. Click "Save Profile" to update the current profile

### Deleting a Profile
1. Select the profile you want to delete
2. Click the "Delete" button
3. Confirm the deletion in the dialog

## Technical Details

The profile management system uses the browser's localStorage to persist profiles between sessions. The implementation follows a clean architecture with separate responsibilities:

- **ProfileStore**: Handles saving and loading profiles from localStorage
- **GridStateProvider**: Extracts and applies grid state
- **SettingsController**: Coordinates between toolbar and grid settings
- **UI Components**: React components for user interaction

## Development

To extend the profile management system, you can:

1. Add new toolbar settings by updating the `ToolbarSettings` interface
2. Add new grid settings by extending the `GridSettings` interface
3. Create new UI components in the `src/components/datatable/profile` directory
