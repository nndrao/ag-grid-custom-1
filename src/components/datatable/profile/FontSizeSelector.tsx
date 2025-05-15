import { useCallback, useEffect, useState } from 'react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { DEFAULT_FONT_SIZE, HEADER_FONT_SIZE_OFFSET, SettingsController } from '@/services/settingsController';

interface FontSizeSelectorProps {
  settingsController: SettingsController | null;
}

const fontSizeOptions = [
  { value: '12', label: '12px' },
  { value: '13', label: '13px' },
  { value: '14', label: '14px' },
  { value: '15', label: '15px' },
  { value: '16', label: '16px' },
  { value: '18', label: '18px' },
  { value: '20', label: '20px' },
];

export function FontSizeSelector({ settingsController }: FontSizeSelectorProps) {
  const [fontSize, setFontSize] = useState<string>(DEFAULT_FONT_SIZE.toString());
  
  // Initialize with current settings
  useEffect(() => {
    if (settingsController) {
      const currentSettings = settingsController.getCurrentToolbarSettings();
      // Explicitly check for undefined or null to ensure default is applied
      if (currentSettings.fontSize !== undefined && currentSettings.fontSize !== null) {
        setFontSize(currentSettings.fontSize.toString());
      } else {
        // If fontSize is not set in the profile, use the default
        setFontSize(DEFAULT_FONT_SIZE.toString());
        // Also update the toolbar settings to ensure it's properly saved
        settingsController.updateToolbarSettings({ fontSize: DEFAULT_FONT_SIZE });
      }
    }
  }, [settingsController]);
  
  // Subscribe to settings changes
  useEffect(() => {
    if (!settingsController) return;
    
    const unsubscribe = settingsController.onToolbarSettingsChange((settings) => {
      // Explicitly check for undefined or null to ensure default is applied
      if (settings.fontSize !== undefined && settings.fontSize !== null) {
        setFontSize(settings.fontSize.toString());
      } else {
        // If fontSize is not set or becomes undefined, reset to default
        setFontSize(DEFAULT_FONT_SIZE.toString());
        // Ensure the default is applied to toolbar settings
        settingsController.updateToolbarSettings({ 
          fontSize: DEFAULT_FONT_SIZE
        });
      }
    });
    
    return unsubscribe;
  }, [settingsController]);
  
  // Apply the font size to the grid
  const applyFontSizeToGrid = useCallback((cellFontSize: number) => {
    if (!settingsController) return;
    
    const headerFontSize = cellFontSize + HEADER_FONT_SIZE_OFFSET;
    
    // 1. Try applying to grid options
    const gridApi = settingsController.getCurrentGridOptions()?.api;
    if (gridApi) {
      try {
        // First, try to update theme parameters if using AG-Grid's theming
        const gridDiv = gridApi.gridBodyCtrl?.eGridDiv;
        if (gridDiv) {
          // Apply CSS variables for font sizes
          gridDiv.style.setProperty('--ag-font-size', `${cellFontSize}px`);
          gridDiv.style.setProperty('--ag-header-font-size', `${headerFontSize}px`);
          
          // Force refresh to ensure changes are applied
          gridApi.refreshCells({ force: true });
          gridApi.refreshHeader();
          
          // Update default column definition to include the new font size
          try {
            const currentColDef = gridApi.getGridOption('defaultColDef') || {};
            const updatedColDef = {
              ...currentColDef,
              // Add font size to cell style if it exists
              cellStyle: (params: any) => {
                const existingStyle = typeof currentColDef.cellStyle === 'function' 
                  ? currentColDef.cellStyle(params) || {} 
                  : currentColDef.cellStyle || {};
                
                return {
                  ...existingStyle,
                  fontSize: `${cellFontSize}px`,
                };
              }
            };
            
            // Apply the updated column definition
            gridApi.setGridOption('defaultColDef', updatedColDef);
          } catch (error) {
            console.error('Error updating defaultColDef with font size:', error);
          }
        }
      } catch (error) {
        console.error('Error applying font size through grid API:', error);
      }
    }
    
    // 2. Fallback to applying CSS directly to AG-Grid elements
    try {
      // Use more specific selectors to target the correct elements
      const rootWrapper = document.querySelector('.ag-root-wrapper');
      if (rootWrapper) {
        (rootWrapper as HTMLElement).style.setProperty('--ag-font-size', `${cellFontSize}px`);
        (rootWrapper as HTMLElement).style.setProperty('--ag-header-font-size', `${headerFontSize}px`);
      }
      
      // Apply to cell elements with specificity
      const cellElements = document.querySelectorAll('.ag-cell:not(.ag-header-cell)');
      cellElements.forEach(element => {
        (element as HTMLElement).style.fontSize = `${cellFontSize}px`;
      });
      
      // Apply to header elements
      const headerElements = document.querySelectorAll('.ag-header-cell');
      headerElements.forEach(element => {
        (element as HTMLElement).style.fontSize = `${headerFontSize}px`;
      });
      
      // Apply to filter elements
      const filterElements = document.querySelectorAll('.ag-filter');
      filterElements.forEach(element => {
        (element as HTMLElement).style.fontSize = `${cellFontSize}px`;
      });
    } catch (error) {
      console.error('Error applying font size to grid elements:', error);
    }
  }, [settingsController]);
  
  // Initial application of font size when component mounts
  useEffect(() => {
    if (fontSize) {
      applyFontSizeToGrid(parseInt(fontSize, 10));
    }
  }, [fontSize, applyFontSizeToGrid]);
  
  // Re-apply font size when grid API changes or becomes available
  useEffect(() => {
    if (!settingsController) return;
    
    // Get the current grid API
    const gridApi = settingsController.getCurrentGridOptions()?.api;
    
    // If we have both a grid API and a font size, apply the font size
    if (gridApi && fontSize) {
      // Wait a short moment for the grid to be fully initialized
      const timeoutId = setTimeout(() => {
        applyFontSizeToGrid(parseInt(fontSize, 10));
      }, 100);
      
      return () => clearTimeout(timeoutId);
    }
  }, [settingsController, fontSize, applyFontSizeToGrid]);
  
  const handleFontSizeChange = useCallback((value: string) => {
    setFontSize(value);
    const numericValue = parseInt(value, 10);
    
    if (settingsController) {
      // Update toolbar settings
      settingsController.updateToolbarSettings({ fontSize: numericValue });
      
      // Apply font size to grid
      applyFontSizeToGrid(numericValue);
    }
  }, [settingsController, applyFontSizeToGrid]);
  
  return (
    <div className="flex items-center">
      <Tooltip>
        <TooltipTrigger>
          <div>
            <Select value={fontSize} onValueChange={handleFontSizeChange}>
              <SelectTrigger className="h-8 w-[80px] text-xs">
                <SelectValue placeholder="Font Size" />
              </SelectTrigger>
              <SelectContent>
                {fontSizeOptions.map((option) => (
                  <SelectItem 
                    key={option.value} 
                    value={option.value}
                    style={{ fontSize: `${parseInt(option.value, 10)}px` }}
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>Change grid font size</p>
          <p className="text-xs text-muted-foreground">Headers: +2px larger</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
} 