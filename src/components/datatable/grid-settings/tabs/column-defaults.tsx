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
    { value: 'start', label: 'Top' },
    { value: 'center', label: 'Middle' },
    { value: 'end', label: 'Bottom' }
  ];

  const horizontalAlignOptions = [
    { value: 'left', label: 'Left' },
    { value: 'center', label: 'Center' },
    { value: 'right', label: 'Right' }
  ];

  // Initialize local state with defaultColDef or empty object
  const [localSettings, setLocalSettings] = useState({
    defaultColDef: settings.defaultColDef || {}
  });
  
  // Update local state when settings prop changes
  useEffect(() => {
    setLocalSettings({
      defaultColDef: settings.defaultColDef || {}
    });
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
    
    // Pass the entire defaultColDef object to the parent component
    // Strip out deprecated alignment props before passing to AG Grid
type ColDefGrid = typeof newDefaultColDef;
const { verticalAlign, horizontalAlign, ...colDefForGrid } = newDefaultColDef as ColDefGrid;
onChange('defaultColDef', colDefForGrid);
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
    
    // Pass the entire defaultColDef object to the parent component
    // Strip out deprecated alignment props before passing to AG Grid
type ColDefGrid = typeof newDefaultColDef;
const { verticalAlign, horizontalAlign, ...colDefForGrid } = newDefaultColDef as ColDefGrid;
onChange('defaultColDef', colDefForGrid);
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
    
    // Pass the entire defaultColDef object to the parent component
    // Strip out deprecated alignment props before passing to AG Grid
type ColDefGrid = typeof newDefaultColDef;
const { verticalAlign, horizontalAlign, ...colDefForGrid } = newDefaultColDef as ColDefGrid;
onChange('defaultColDef', colDefForGrid);
  };

  // Handler for select options
  const handleSelectChange = (option: string, value: string) => {
    // Store alignment values
    let newDefaultColDef = { ...localSettings.defaultColDef };
    
    // Update alignment options
    if (option === 'verticalAlign' || option === 'horizontalAlign') {
      // Handle default selection (revert to default)
      if (value === 'default') {
        delete newDefaultColDef[option];
      } else {
        newDefaultColDef[option] = value as any;
      }
      
      // Update the cellStyle function
      updateCellStyleFunction(newDefaultColDef);
    } else {
      // For other select options that aren't alignment related
      newDefaultColDef = {
        ...newDefaultColDef,
        [option]: value
      };
    }
    
    setLocalSettings(prev => ({
      ...prev,
      defaultColDef: newDefaultColDef
    }));
    
    // Pass the entire defaultColDef object to the parent component
    // Strip out deprecated alignment props before passing to AG Grid
type ColDefGrid = typeof newDefaultColDef;
const { verticalAlign, horizontalAlign, ...colDefForGrid } = newDefaultColDef as ColDefGrid;
onChange('defaultColDef', colDefForGrid);
  };

  // Helper to generate the cellStyle function based on alignment settings
  const updateCellStyleFunction = (colDef: any) => {
    const verticalAlign = colDef.verticalAlign as 'start' | 'center' | 'end' | undefined;
    const horizontalAlign = colDef.horizontalAlign as 'left' | 'center' | 'right' | undefined;
    
    // Only create cellStyle if at least one alignment is specified
    if (verticalAlign || horizontalAlign) {
      // Create a function that returns the style object
      colDef.cellStyle = () => {
        const styleObj: any = { display: 'flex' };
        
        // Add vertical alignment
        if (verticalAlign) {
          styleObj.alignItems = verticalAlign;
        }
        
        // Add horizontal alignment
        if (horizontalAlign) {
          switch (horizontalAlign) {
            case 'left':
              styleObj.justifyContent = 'flex-start';
              break;
            case 'center':
              styleObj.justifyContent = 'center';
              break;
            case 'right':
              styleObj.justifyContent = 'flex-end';
              break;
          }
        }
        
        return styleObj;
      };
    } else {
      // If both alignments are unset, remove the cellStyle function
      delete colDef.cellStyle;
    }
  };

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
              value={localSettings.defaultColDef?.verticalAlign || 'default'}
              onValueChange={(value) => handleSelectChange('verticalAlign', value)}
            >
              <SelectTrigger id="verticalAlign">
                <SelectValue placeholder="Choose alignment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default</SelectItem>
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
              value={localSettings.defaultColDef?.horizontalAlign || 'default'}
              onValueChange={(value) => handleSelectChange('horizontalAlign', value)}
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