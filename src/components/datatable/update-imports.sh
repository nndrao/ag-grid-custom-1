#!/bin/bash

# Array of files to update
files=(
  "services/settings-controller.ts"
  "services/gridStateProvider.ts"
  "services/profile-manager.ts"
  "stores/settings-store.ts"
  "stores/profile-store.ts"
  "hooks/useProfileManager2.ts"
  "hooks/useAgGridTheme.ts"
  "hooks/useAgGridProfileSync.ts"
  "grid-settings/grid-settings-menu.tsx"
  "grid-settings/grid-settings-dialog.tsx"
  "column-settings/ColumnSettingsDialog.tsx"
  "grid-settings/settings-dialog-base.tsx"
  "grid-settings/settings-manager.tsx"
  "profile/FontFamilySelector.tsx"
  "profile/FontSizeSelector.tsx"  
  "profile/SpacingSelector.tsx"
)

# Update imports in each file
for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "Updating $file..."
    
    # Update service imports
    sed -i '' 's|from "@/services/settings-controller"|from "../services/settings-controller"|g' "$file"
    sed -i '' 's|from "@/services/gridStateProvider"|from "../services/gridStateProvider"|g' "$file"
    sed -i '' 's|from "@/services/profile-manager"|from "../services/profile-manager"|g' "$file"
    
    # Update store imports
    sed -i '' 's|from "@/stores/settings-store"|from "../stores/settings-store"|g' "$file"
    sed -i '' 's|from "@/lib/profile-store"|from "../stores/profile-store"|g' "$file"
    
    # Update hook imports
    sed -i '' 's|from "@/hooks/useProfileManager2"|from "../hooks/useProfileManager2"|g' "$file"
    sed -i '' 's|from "@/hooks/useGridSettings"|from "../hooks/useGridSettings"|g' "$file"
    
    # Update type imports
    sed -i '' 's|from "@/types/profile.types"|from "../types/profile.types"|g' "$file"
    sed -i '' 's|from "@/types/ProfileManager"|from "../types/ProfileManager"|g' "$file"
    
    # Update utility imports
    sed -i '' 's|from "@/utils/deepClone"|from "../utils/deepClone"|g' "$file"
    sed -i '' 's|from "@/utils/comparison"|from "../utils/comparison"|g' "$file"
    sed -i '' 's|from "@/lib/utils"|from "../lib/utils"|g' "$file"
    sed -i '' 's|from "@/lib/singleton-registry"|from "../lib/singleton-registry"|g' "$file"
    
    # Update component imports
    sed -i '' 's|from "@/components/theme-provider"|from "../theme/theme-provider"|g' "$file"
    sed -i '' 's|from "@/components/GoogleFontsLoader"|from "../theme/GoogleFontsLoader"|g' "$file"
    sed -i '' 's|from "@/components/datatable/|from "../|g' "$file"
  fi
done

echo "Import updates completed!"