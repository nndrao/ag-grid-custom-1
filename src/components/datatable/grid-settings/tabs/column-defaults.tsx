import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ColumnDefaultsProps {
  settings: {
    defaultColDef?: {
      sortable?: boolean;
      resizable?: boolean;
      filter?: boolean;
      editable?: boolean;
      flex?: number;
      minWidth?: number;
      maxWidth?: number;
      cellClass?: string;
      headerClass?: string;
      cellStyle?: any;
      verticalAlign?: 'start' | 'center' | 'end';
      horizontalAlign?: 'left' | 'center' | 'right';
    };
  };
  onChange: (option: string, value: any) => void;
  initialProperties?: string[];
}

export function ColumnDefaults({ settings, onChange }: ColumnDefaultsProps) {
  // Available alignment options
  const verticalAlignOptions = [
    { value: 'top', label: 'Top' },
    { value: 'middle', label: 'Middle' },
    { value: 'bottom', label: 'Bottom' }
  ];

  const horizontalAlignOptions = [
    { value: 'left', label: 'Left' },
    { value: 'center', label: 'Center' },
    { value: 'right', label: 'Right' }
  ];

  // Define specific types for alignment values to satisfy TypeScript
  type VerticalAlignType = 'top' | 'middle' | 'bottom' | 'start' | 'center' | 'end';
  type HorizontalAlignType = 'left' | 'center' | 'right' | 'default';
  
  // Track vertical and horizontal alignment separately for UI state
  const [verticalAlign, setVerticalAlign] = useState<VerticalAlignType>(() => {
    // Extract alignment from defaultColDef.cellStyle if it exists
    try {
      const colDef = settings.defaultColDef;
      if (colDef?.cellStyle && typeof colDef.cellStyle === 'function') {
        // Test the cellStyle function to see what alignment it's using
        const testStyle = colDef.cellStyle({ colDef: { type: undefined } });
        console.debug('[ColumnDefaults] Extracted style from existing cellStyle:', testStyle);
        
        // Map CSS alignment values to UI options
        if (testStyle && testStyle.alignItems) {
          if (testStyle.alignItems === 'flex-start') {
            return 'top';
          } else if (testStyle.alignItems === 'center') {
            return 'middle';
          } else if (testStyle.alignItems === 'flex-end') {
            return 'bottom';
          }
        }
      }
      
      // Also check for the stored verticalAlign property
      if (colDef?.verticalAlign) {
        return colDef.verticalAlign as VerticalAlignType;
      }
      
      return 'middle'; // Default to middle as that's the default in DEFAULT_GRID_OPTIONS
    } catch (e) {
      console.error('[ColumnDefaults] Error extracting vertical alignment:', e);
      return 'middle'; // Default to middle alignment
    }
  });
  
  const [horizontalAlign, setHorizontalAlign] = useState<HorizontalAlignType>(
    (settings.defaultColDef?.horizontalAlign as HorizontalAlignType) || 'default'
  );
  
  // Initialize local state with defaultColDef or empty object
  const [localSettings, setLocalSettings] = useState({
    defaultColDef: settings.defaultColDef || {}
  });
  
  console.debug('[ColumnDefaults] Initial state:', {
    verticalAlign,
    horizontalAlign,
    defaultColDef: settings.defaultColDef
  });
  
  // Update local state when settings prop changes
  useEffect(() => {
    console.debug('[ColumnDefaults] Settings changed:', settings.defaultColDef);
    
    // Update local settings
    setLocalSettings({
      defaultColDef: settings.defaultColDef || {}
    });
    
    // Update alignment state variables
    if (settings.defaultColDef) {
      // First check for explicit verticalAlign property
      if (settings.defaultColDef.verticalAlign) {
        setVerticalAlign(settings.defaultColDef.verticalAlign as VerticalAlignType);
      } 
      // Otherwise try to extract from cellStyle function
      else if (settings.defaultColDef.cellStyle && typeof settings.defaultColDef.cellStyle === 'function') {
        try {
          // Test the cellStyle function to see what alignment it's using
          const testStyle = settings.defaultColDef.cellStyle({ colDef: { type: undefined } });
          console.debug('[ColumnDefaults] Extracted style from settings cellStyle:', testStyle);
          
          // Map CSS alignment values to UI options
          if (testStyle && testStyle.alignItems) {
            if (testStyle.alignItems === 'flex-start') {
              setVerticalAlign('top');
            } else if (testStyle.alignItems === 'center') {
              setVerticalAlign('middle');
            } else if (testStyle.alignItems === 'flex-end') {
              setVerticalAlign('bottom');
            }
          }
        } catch (e) {
          console.error('[ColumnDefaults] Error extracting alignment from cellStyle:', e);
        }
      }
      
      if (settings.defaultColDef.horizontalAlign) {
        setHorizontalAlign(settings.defaultColDef.horizontalAlign as HorizontalAlignType);
      }
    }
  }, [settings]);

  // Handler for checkbox options
  const handleCheckboxChange = (option: string, checked: boolean) => {
    // Create a new defaultColDef object with the updated property
    const newDefaultColDef = {
      ...localSettings.defaultColDef,
      [option]: checked
    };
    
    setLocalSettings(prev => ({
      ...prev,
      defaultColDef: newDefaultColDef
    }));
    
    // Pass the entire defaultColDef object to the parent component, including alignment
    onChange('defaultColDef', newDefaultColDef);
  };

  // Handler for number inputs
  const handleNumberChange = (option: string, value: string) => {
    const numValue = value ? parseInt(value, 10) : undefined;
    
    // Create a new defaultColDef object with the updated property
    const newDefaultColDef = {
      ...localSettings.defaultColDef,
      [option]: numValue
    };
    
    setLocalSettings(prev => ({
      ...prev,
      defaultColDef: newDefaultColDef
    }));
    
    // Pass the entire defaultColDef object to the parent component, including alignment
    onChange('defaultColDef', newDefaultColDef);
  };

  // Handler for text inputs
  const handleTextChange = (option: string, value: string) => {
    // Create a new defaultColDef object with the updated property
    const newDefaultColDef = {
      ...localSettings.defaultColDef,
      [option]: value
    };
    
    setLocalSettings(prev => ({
      ...prev,
      defaultColDef: newDefaultColDef
    }));
    
    // Pass the entire defaultColDef object to the parent component, including alignment
    onChange('defaultColDef', newDefaultColDef);
  };

  // Helper: generate cellStyle function for flex alignment
  function generateCellStyle(verticalAlign?: string, horizontalAlign?: string) {
    if (!verticalAlign && !horizontalAlign) return undefined;
    
    // Debug the input values
    console.debug('[ColumnDefaults] generateCellStyle input values:', { verticalAlign, horizontalAlign });
    
    return (params: any) => {
      // Create a style object for flexbox alignment
      const style: Record<string, string> = { display: 'flex' };
      
      // Map UI vertical alignment values to CSS flexbox alignItems values
      if (verticalAlign && verticalAlign !== 'default') {
        if (verticalAlign === 'top' || verticalAlign === 'start') {
          style.alignItems = 'flex-start';
        } else if (verticalAlign === 'middle' || verticalAlign === 'center') {
          style.alignItems = 'center';
        } else if (verticalAlign === 'bottom' || verticalAlign === 'end') {
          style.alignItems = 'flex-end';
        }
      }
      
      // Map UI horizontal alignment values to CSS flexbox justifyContent values
      if (horizontalAlign && horizontalAlign !== 'default') {
        if (horizontalAlign === 'left') {
          style.justifyContent = 'flex-start';
        } else if (horizontalAlign === 'center') {
          style.justifyContent = 'center';
        } else if (horizontalAlign === 'right') {
          style.justifyContent = 'flex-end';
        }
      }
      
      // Handle numeric column type for right alignment
      if (!horizontalAlign && params.colDef.type === 'numericColumn') {
        style.justifyContent = 'flex-end'; // Right align numbers by default
      } else if (!horizontalAlign) {
        style.justifyContent = 'flex-start'; // Left align text by default
      }
      
      console.debug('[ColumnDefaults] cellStyle generated for', verticalAlign, ':', style);
      return style;
    };
  }

  // Handler for select options
  const handleSelectChange = (option: string, value: any) => {
    console.debug(`[ColumnDefaults] handleSelectChange: ${option} = ${value}`);
    
    // Update the appropriate state variable based on the option
    if (option === 'verticalAlign') {
      setVerticalAlign(value as VerticalAlignType);
    } else if (option === 'horizontalAlign') {
      setHorizontalAlign(value as HorizontalAlignType);
    }
    
    // Create a new defaultColDef object with the updated property
    let newDefaultColDef = { ...localSettings.defaultColDef } as Record<string, any>;
    
    // Special direct handling for vertical alignment
    if (option === 'verticalAlign') {
      try {
        // Determine the CSS value for the selected alignment
        let alignValue = 'flex-start'; // Default for 'top'
        
        if (value === 'middle') {
          alignValue = 'center';
        } else if (value === 'bottom') {
          alignValue = 'flex-end';
        }
        
        console.debug(`[ColumnDefaults] Converting vertical alignment: ${value} → ${alignValue}`);
        
        // Create a simple cellStyle function that aligns vertically
        const cellStyleFn = (params: any) => {
          // Create style with correct vertical alignment
          const style: Record<string, string> = {
            display: 'flex',
            alignItems: alignValue
          };
          
          // Add horizontal alignment based on column type
          if (params.colDef.type === 'numericColumn') {
            style.justifyContent = 'flex-end';  // Right align numbers
          } else {
            style.justifyContent = 'flex-start'; // Left align text
          }
          
          return style;
        };
        
        // Create new defaultColDef with the alignment function AND the UI value
        const alignedColDef = {
          ...newDefaultColDef,
          cellStyle: cellStyleFn,
          // IMPORTANT: Store the UI value so it can be serialized and restored
          verticalAlign: value,
          // Also add a serializable version of the alignment for storage
          // This helps in cases where cellStyle function doesn't get serialized
          _cellAlignItems: alignValue
        };
        
        // Apply to local state
        setLocalSettings(prev => ({
          ...prev,
          defaultColDef: alignedColDef
        }));
        
        // Test to make sure it works
        const testStyle = cellStyleFn({ colDef: { type: undefined } });
        console.debug('[ColumnDefaults] Test vertical alignment style:', testStyle);
        
        // Send to parent including the metadata properties
        onChange('defaultColDef', alignedColDef);
        
        // Force a refresh of the grid
        setTimeout(() => {
          console.debug('[ColumnDefaults] Vertical alignment applied:', value);
        }, 50);
        
        return; // Skip the rest of the function
      } catch (err) {
        console.error('[ColumnDefaults] Error applying vertical alignment:', err);
      }
    }
    // Standard handling for horizontal alignment or non-alignment options
    else if (option === 'horizontalAlign' || option === 'verticalAlign') {
      // Handle default selection (revert to default)
      if (value === 'default') {
        delete newDefaultColDef[option];
      } else {
        newDefaultColDef[option] = value;
      }
      
      // Update local settings state
      setLocalSettings(prev => ({
        ...prev,
        defaultColDef: newDefaultColDef
      }));
      
      // For alignment options, create a cellStyle function
      // Get the current values for both alignments
      const currentVertical = option === 'verticalAlign' ? value : verticalAlign;
      const currentHorizontal = option === 'horizontalAlign' ? value : horizontalAlign;
      
      console.debug('[ColumnDefaults] Current alignment values:', { 
        currentVertical, 
        currentHorizontal 
      });
      
      // Generate the cellStyle function
      const cellStyle = generateCellStyle(
        currentVertical === 'default' ? undefined : currentVertical,
        currentHorizontal === 'default' ? undefined : currentHorizontal
      );
      
      // Create a grid-ready version of the column definition
      const colDefForGrid = { ...newDefaultColDef };
      
      // Add the cellStyle function if we have alignment settings
      if (cellStyle) {
        colDefForGrid.cellStyle = cellStyle;
        
        // Test the cellStyle function with a mock parameter
        const testStyle = cellStyle({ 
          colDef: { type: undefined } 
        });
        console.debug('[ColumnDefaults] Test cellStyle result:', testStyle);
      } else {
        delete colDefForGrid.cellStyle;
      }
      
      // Remove UI-only properties before sending to the grid
      delete colDefForGrid.verticalAlign;
      delete colDefForGrid.horizontalAlign;
      
      console.debug('[ColumnDefaults] Applying to grid:', {
        option,
        value,
        verticalAlign: currentVertical,
        horizontalAlign: currentHorizontal,
        hasFunction: !!cellStyle,
        colDefForGrid
      });
      
      // Apply the changes to the grid
      onChange('defaultColDef', colDefForGrid);
      
      // Add a slight delay then check if our cellStyle was applied correctly
      setTimeout(() => {
        try {
          // This logging is for debugging only
          console.debug('[ColumnDefaults] Verifying cellStyle was applied...');
          
          // Test the cellStyle again - this would be in the context of the actual grid
          if (colDefForGrid.cellStyle) {
            const testResult = colDefForGrid.cellStyle({ 
              colDef: { type: undefined } 
            });
            console.debug('[ColumnDefaults] Final cellStyle result:', testResult);
          }
        } catch (err) {
          console.error('[ColumnDefaults] Error verifying cellStyle:', err);
        }
      }, 100);
    } else {
      // For non-alignment options
      newDefaultColDef[option] = value;
      
      setLocalSettings(prev => ({
        ...prev,
        defaultColDef: newDefaultColDef
      }));
      
      onChange('defaultColDef', newDefaultColDef);
    }
  };

  // Note: The generateCellStyle function above handles all cell styling needs

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Column Behavior Defaults</CardTitle>
          <CardDescription>
            Set default behaviors for all columns in the grid.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="sortable" 
              checked={!!localSettings.defaultColDef?.sortable}
              onCheckedChange={(checked) => handleCheckboxChange('sortable', !!checked)} 
            />
            <Label htmlFor="sortable" className="font-normal">
              Sortable by default
            </Label>
          </div>
          
          <div className="flex items-center space-x-2 pt-2">
            <Checkbox 
              id="resizable" 
              checked={!!localSettings.defaultColDef?.resizable}
              onCheckedChange={(checked) => handleCheckboxChange('resizable', !!checked)} 
            />
            <Label htmlFor="resizable" className="font-normal">
              Resizable by default
            </Label>
          </div>
          
          <div className="flex items-center space-x-2 pt-2">
            <Checkbox 
              id="filter" 
              checked={!!localSettings.defaultColDef?.filter}
              onCheckedChange={(checked) => handleCheckboxChange('filter', !!checked)} 
            />
            <Label htmlFor="filter" className="font-normal">
              Filterable by default
            </Label>
          </div>
          
          <div className="flex items-center space-x-2 pt-2">
            <Checkbox 
              id="editable" 
              checked={!!localSettings.defaultColDef?.editable}
              onCheckedChange={(checked) => handleCheckboxChange('editable', !!checked)} 
            />
            <Label htmlFor="editable" className="font-normal">
              Editable by default
            </Label>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Column Sizing Defaults</CardTitle>
          <CardDescription>
            Configure default sizing for all columns.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="flex">Default Flex Grow</Label>
            <Input
              id="flex"
              type="number"
              value={localSettings.defaultColDef?.flex || ''}
              onChange={(e) => handleNumberChange('flex', e.target.value)}
              placeholder="1"
              min={0}
              step={1}
            />
            <p className="text-xs text-muted-foreground">
              Flex grow factor when columns take available space.
            </p>
          </div>
          
          <div className="space-y-2 pt-2">
            <Label htmlFor="minWidth">Default Minimum Width (px)</Label>
            <Input
              id="minWidth"
              type="number"
              value={localSettings.defaultColDef?.minWidth || ''}
              onChange={(e) => handleNumberChange('minWidth', e.target.value)}
              placeholder="100"
              min={1}
            />
          </div>
          
          <div className="space-y-2 pt-2">
            <Label htmlFor="maxWidth">Default Maximum Width (px)</Label>
            <Input
              id="maxWidth"
              type="number"
              value={localSettings.defaultColDef?.maxWidth || ''}
              onChange={(e) => handleNumberChange('maxWidth', e.target.value)}
              placeholder="Unlimited"
              min={1}
            />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Column Styling Defaults</CardTitle>
          <CardDescription>
            Configure default styling for all columns.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cellClass">Default Cell Class</Label>
            <Input
              id="cellClass"
              value={localSettings.defaultColDef?.cellClass || ''}
              onChange={(e) => handleTextChange('cellClass', e.target.value)}
              placeholder="my-cell-class"
            />
            <p className="text-xs text-muted-foreground">
              CSS class names to apply to all cells.
            </p>
          </div>
          
          <div className="space-y-2 pt-2">
            <Label htmlFor="headerClass">Default Header Class</Label>
            <Input
              id="headerClass"
              value={localSettings.defaultColDef?.headerClass || ''}
              onChange={(e) => handleTextChange('headerClass', e.target.value)}
              placeholder="my-header-class"
            />
            <p className="text-xs text-muted-foreground">
              CSS class names to apply to all column headers.
            </p>
          </div>

          <div className="space-y-2 pt-4">
            <Label htmlFor="verticalAlign">Vertical Cell Alignment</Label>
            <Select
              value={verticalAlign}
              onValueChange={(value) => {
                console.debug('[ColumnDefaults] Vertical alignment selected in dropdown:', value);
                // Debug current settings before change
                if (typeof localSettings.defaultColDef?.cellStyle === 'function') {
                  try {
                    const testStyle = localSettings.defaultColDef.cellStyle({ colDef: { type: undefined } });
                    console.debug('[ColumnDefaults] Current cellStyle before change:', testStyle);
                  } catch (e) {
                    console.error('[ColumnDefaults] Error testing current cellStyle:', e);
                  }
                }
                handleSelectChange('verticalAlign', value);
              }}
            >
              <SelectTrigger id="verticalAlign">
                <SelectValue placeholder="Choose alignment" />
              </SelectTrigger>
              <SelectContent>
                {verticalAlignOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Vertical alignment of content within cells.
            </p>
          </div>

          <div className="space-y-2 pt-2">
            <Label htmlFor="horizontalAlign">Horizontal Cell Alignment</Label>
            <Select
              value={horizontalAlign}
              onValueChange={(value) => {
                console.log('Horizontal alignment selected:', value);
                handleSelectChange('horizontalAlign', value);
              }}
            >
              <SelectTrigger id="horizontalAlign">
                <SelectValue placeholder="Choose alignment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default</SelectItem>
                {horizontalAlignOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Horizontal alignment of content within cells.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 