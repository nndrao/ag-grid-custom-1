import React, { useState, useEffect, ChangeEvent } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { GridApi, ColDef } from 'ag-grid-community';
import { cn } from '@/lib/utils';
import { AlignLeft, AlignCenter, AlignRight, AlignStartVertical, AlignCenterVertical, AlignEndVertical } from 'lucide-react';
import { Slider } from '@/components/ui/slider';

type FormatterExample = {
  name: string;
  format: string;
  preview: Array<{
    value: number;
    display: string;
    color?: string;
  }>;
};

interface ColumnSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  gridApi: GridApi | null;
  column?: ColDef;
}

/**
 * Column settings dialog component
 */
export function ColumnSettingsDialog({
  open,
  onOpenChange,
  gridApi,
  column
}: ColumnSettingsDialogProps) {
  const [activeTab, setActiveTab] = useState("header");
  const [settings, setSettings] = useState<Record<string, unknown>>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [selectedColumn, setSelectedColumn] = useState<string>('');
  const [columns, setColumns] = useState<ColDef[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [bulkUpdateMode, setBulkUpdateMode] = useState(false);
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  
  // Load columns when dialog opens
  useEffect(() => {
    if (open && gridApi) {
      const columnDefs = gridApi.getColumnDefs() as ColDef[];
      if (columnDefs) {
        setColumns(columnDefs);
        
        // If a column is provided, set it as selected
        if (column) {
          setSelectedColumn(column.field || '');
        }
      }
    }
  }, [open, gridApi, column]);

  // Helper function to determine column data type
  const getColumnDataType = (col: ColDef): string => {
    if (col.type === 'numericColumn' || 
        col.filter === 'agNumberColumnFilter' || 
        col.cellEditor === 'agNumberCellEditor') {
      return 'number';
    } else if (col.type === 'dateColumn' || 
              col.filter === 'agDateColumnFilter' || 
              col.cellEditor === 'agDateCellEditor') {
      return 'date';
    } else if (col.cellEditor === 'agSelectCellEditor' || 
              col.cellRenderer === 'agSelectCellRenderer') {
      return 'select';
    } else if (col.cellRenderer === 'agCheckboxCellRenderer') {
      return 'boolean';
    }
    return 'text';
  };

  // Handle column selection change
  const handleColumnChange = (columnField: string) => {
    if (bulkUpdateMode) {
      // In bulk mode, toggle selection in the array
      if (selectedColumns.includes(columnField)) {
        setSelectedColumns(selectedColumns.filter(field => field !== columnField));
      } else {
        setSelectedColumns([...selectedColumns, columnField]);
      }
    } else {
      // In single mode, set as the active column
      setSelectedColumn(columnField);
      const col = columns.find(c => c.field === columnField);
      if (col) {
        setSettings(col as Record<string, unknown>);
      }
    }
  };

  // Apply changes and close dialog
  const applyChanges = () => {
    if (!gridApi) return;
    
    if (bulkUpdateMode && selectedColumns.length > 0) {
      // For bulk updates, apply settings to all selected columns
      const columnDefs = gridApi.getColumnDefs() as ColDef[];
      if (columnDefs) {
        const updatedColumnDefs = columnDefs.map(col => {
          if (selectedColumns.includes(col.field || '')) {
            return { ...col, ...settings };
          }
          return col;
        });
        
        gridApi.setGridOption('columnDefs', updatedColumnDefs);
      }
    } else if (selectedColumn) {
      // For single column update
      const columnDefs = gridApi.getColumnDefs() as ColDef[];
      if (columnDefs) {
        const updatedColumnDefs = columnDefs.map(col => {
          if (col.field === selectedColumn) {
            return { ...col, ...settings };
          }
          return col;
        });
        
        gridApi.setGridOption('columnDefs', updatedColumnDefs);
      }
    }
    
    setHasChanges(false);
    // Refresh grid cells to apply changes
    gridApi.refreshCells({ force: true });
  };
  
  // Update a setting
  const updateSetting = (key: string, value: unknown) => {
    setSettings(prev => {
      const updated = { ...prev, [key]: value };
      setHasChanges(true);
      return updated;
    });
  };

  // Filter columns based on search term and type filter
  const filteredColumns = columns.filter(col => {
    const fieldMatch = col.field?.toLowerCase().includes(searchTerm.toLowerCase());
    const headerMatch = col.headerName?.toLowerCase().includes(searchTerm.toLowerCase());
    const typeMatch = typeFilter === 'all' || getColumnDataType(col) === typeFilter;
    return (fieldMatch || headerMatch) && typeMatch;
  });

  // Generate column list items
  const columnListItems = filteredColumns.map(col => {
    // Determine data type based on column properties
    const colType = getColumnDataType(col);
    let dataTypeSymbol = "Aa"; // Default: text
    
    if (colType === 'number') {
      dataTypeSymbol = "#"; // Number
    } else if (colType === 'date') {
      dataTypeSymbol = "📅"; // Date
    } else if (colType === 'select') {
      dataTypeSymbol = "▼"; // Select/dropdown
    } else if (colType === 'boolean') {
      dataTypeSymbol = "☑"; // Boolean/checkbox
    }
    
    const columnName = col.headerName || col.field || '';
    const isSelected = bulkUpdateMode 
      ? selectedColumns.includes(col.field || '') 
      : selectedColumn === col.field;
    
    return (
      <div 
        key={col.field} 
        className={cn(
          "flex items-center gap-2 px-4 py-2.5 cursor-pointer hover:bg-muted/50 rounded-md transition-colors",
          isSelected && "bg-muted"
        )}
        onClick={() => handleColumnChange(col.field || '')}
      >
        {bulkUpdateMode && (
          <Checkbox 
            checked={selectedColumns.includes(col.field || '')} 
            id={`col-${col.field}`}
            className="flex-shrink-0"
          />
        )}
        <Label 
          htmlFor={`col-${col.field}`} 
          className="cursor-pointer flex-1 font-medium text-xs overflow-hidden flex items-center"
          title={columnName}
        >
          <span className="text-muted-foreground mr-2 w-5 flex-shrink-0 text-center" title="Column data type">
            {dataTypeSymbol}
          </span>
          <span className="whitespace-nowrap overflow-hidden text-ellipsis inline-block flex-1">
            {columnName}
          </span>
        </Label>
      </div>
    );
  });

  // Example format presets for custom formatters
  const formatExamples: FormatterExample[] = [
    {
      name: "Color & Conditionals",
      format: "[>0][Green]\"^\"$#,##0.00;[<0][Red]\"v\"$#,##0.00;$0.00",
      preview: [
        { value: 1234.56, display: "^1,234.56", color: "var(--success)" },
        { value: -1234.56, display: "v-1,234.56", color: "var(--destructive)" },
        { value: 0, display: "$0.00" }
      ]
    },
    {
      name: "Status Indicators",
      format: "[=1][Green]\"✓\";[=0][Red]\"✗\";\"N/A\"",
      preview: [
        { value: 1, display: "✓", color: "var(--success)" },
        { value: 0, display: "✗", color: "var(--destructive)" },
        { value: 2, display: "N/A" }
      ]
    },
    {
      name: "Score Ranges",
      format: "[>=90][#00BB00]0\"%\";[>=70][#0070C0]0\"%\";[Red]0\"%\"",
      preview: [
        { value: 95, display: "95.00%", color: "var(--success)" },
        { value: 75, display: "75.00%", color: "var(--info)" },
        { value: 65, display: "65.00%", color: "var(--destructive)" }
      ]
    }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] h-[90vh] max-h-[800px] flex flex-col p-0 gap-0 overflow-hidden dark:bg-background">
        <DialogHeader className="p-3 border-b dark:border-border">
          <DialogTitle>Column Settings</DialogTitle>
          <div className="flex items-center mt-1">
            <div className="text-xs text-muted-foreground">
              Configure display and behavior for this column
            </div>
            <div className="flex items-center gap-2 ml-10">
              <Label htmlFor="bulkUpdate" className="text-xs font-normal">
                Bulk update
              </Label>
              <Checkbox 
                id="bulkUpdate" 
                checked={bulkUpdateMode}
                onCheckedChange={(checked) => setBulkUpdateMode(!!checked)}
              />
            </div>
          </div>
        </DialogHeader>
        
        <div className="flex flex-1 overflow-hidden">
          {/* Column list sidebar */}
          <div className="w-56 border-r dark:border-border overflow-hidden bg-card dark:bg-card/50">
            <div className="p-2">
              <div className="flex gap-2 mb-2">
                <Input
                  placeholder="Search columns..."
                  className="h-8 text-xs flex-1"
                  value={searchTerm}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                />
                <Select
                  value={typeFilter}
                  onValueChange={(value) => setTypeFilter(value)}
                >
                  <SelectTrigger className="h-8 text-xs w-[90px]" title="Filter by column type">
                    <SelectValue>
                      {typeFilter === 'all' && 'All Types'}
                      {typeFilter === 'text' && <span title="Text">Aa</span>}
                      {typeFilter === 'number' && <span title="Number">#</span>}
                      {typeFilter === 'date' && <span title="Date">📅</span>}
                      {typeFilter === 'select' && <span title="Select">▼</span>}
                      {typeFilter === 'boolean' && <span title="Boolean">☑</span>}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-5 text-center">*</span>
                        <span>All Types</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="number" className="text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-5 text-center">#</span>
                        <span>Number</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="date" className="text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-5 text-center">📅</span>
                        <span>Date</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="select" className="text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-5 text-center">▼</span>
                        <span>Select</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="boolean" className="text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-5 text-center">☑</span>
                        <span>Boolean</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="text" className="text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-5 text-center">Aa</span>
                        <span>Text</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <ScrollArea className="h-[calc(100vh-180px)]" type="auto">
                <div className="space-y-0.5 pr-2">
                  {columnListItems.length > 0 ? (
                    columnListItems
                  ) : (
                    <div className="text-center py-3 text-xs text-muted-foreground">
                      No columns found
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>
          
          {/* Settings content */}
          <div className="flex-1 flex flex-col">
            <div className="border-b dark:border-border">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="w-full justify-start bg-transparent px-3 h-10">
                  <TabsTrigger value="header" className="text-xs data-[state=active]:bg-background rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
                    Header
                  </TabsTrigger>
                  <TabsTrigger value="cell" className="text-xs data-[state=active]:bg-background rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
                    Cell
                  </TabsTrigger>
                  <TabsTrigger value="formatter" className="text-xs data-[state=active]:bg-background rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
                    Formatter
                  </TabsTrigger>
                  <TabsTrigger value="filter" className="text-xs data-[state=active]:bg-background rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
                    Filter
                  </TabsTrigger>
                  <TabsTrigger value="editors" className="text-xs data-[state=active]:bg-background rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
                    Editors
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            
            <ScrollArea className="flex-1" type="auto">
              <div className="p-3">
                <Tabs value={activeTab}>
                  {/* Header Tab */}
                  <TabsContent value="header" className="m-0">
                    <div className="p-3 bg-muted/10 dark:bg-muted/5 h-full flex flex-col">
                      {/* Header Preview */}
                      <div className="bg-primary mb-3 rounded-sm flex-shrink-0">
                        <div className="text-center font-medium text-primary-foreground text-xs py-1">
                          Header Preview
                        </div>
                      </div>
                      
                      {/* Header Caption Input */}
                      <div className="mb-4 flex-shrink-0">
                        <Label className="text-xs mb-1 block">Header Caption</Label>
                        <Input 
                          value={(settings.headerName as string) || ''}
                          onChange={(e) => updateSetting('headerName', e.target.value)}
                          placeholder="Enter header caption"
                          className="h-7 text-xs bg-muted/20 border-border"
                        />
                      </div>
                      
                      {/* Typography Section */}
                      <div className="mb-4 flex-1">
                        <div className="grid grid-cols-2 gap-x-2 gap-y-3">
                          <div>
                            <Label className="text-xs mb-1 block">Font Family</Label>
                            <Select 
                              defaultValue="Arial" 
                              onValueChange={(value) => updateSetting('headerFontFamily', value)}
                            >
                              <SelectTrigger className="h-7 text-xs bg-muted/20 border-border">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {[
                                  { value: "Inter", label: "Inter" },
                                  { value: "Arial", label: "Arial" },
                                  { value: "Verdana", label: "Verdana" },
                                  { value: "Helvetica", label: "Helvetica" }
                                ].map((item) => (
                                  <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-xs mb-1 block">Font Size</Label>
                            <Select 
                              defaultValue="14px" 
                              onValueChange={(value) => updateSetting('headerFontSize', value)}
                            >
                              <SelectTrigger className="h-7 text-xs bg-muted/20 border-border">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="12px">12px</SelectItem>
                                <SelectItem value="14px">14px</SelectItem>
                                <SelectItem value="16px">16px</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-xs mb-1 block">Font Weight</Label>
                            <Select 
                              defaultValue="normal" 
                              onValueChange={(value) => updateSetting('headerFontWeight', value)}
                            >
                              <SelectTrigger className="h-7 text-xs bg-muted/20 border-border">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="normal">Normal</SelectItem>
                                <SelectItem value="500">Medium</SelectItem>
                                <SelectItem value="600">Semi-Bold</SelectItem>
                                <SelectItem value="bold">Bold</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-xs mb-1 block">Style</Label>
                            <div className="flex gap-1 h-7">
                              <Button 
                                variant="outline" 
                                size="icon"
                                onClick={() => updateSetting('headerFontStyle', 'bold')}
                                className="font-bold flex-1 h-7 bg-muted/20 border-border"
                              >
                                B
                              </Button>
                              <Button 
                                variant="outline" 
                                size="icon"
                                onClick={() => updateSetting('headerFontStyle', 'italic')}
                                className="italic flex-1 h-7 bg-muted/20 border-border"
                              >
                                I
                              </Button>
                              <Button 
                                variant="outline" 
                                size="icon"
                                onClick={() => updateSetting('headerFontStyle', 'underline')}
                                className="underline flex-1 h-7 bg-muted/20 border-border"
                              >
                                U
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Colors Section */}
                      <div className="mb-4 flex-1">
                        <div className="grid grid-cols-2 gap-x-2 gap-y-3">
                          <div>
                            <div className="flex justify-between mb-1">
                              <Label className="text-xs">Text Color</Label>
                              <div className="flex items-center">
                                <span className="text-xs mr-1">Apply</span>
                                <Checkbox 
                                  id="applyHeaderTextColor" 
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      updateSetting('headerTextColor', (document.getElementById('headerTextColor') as HTMLInputElement)?.value);
                                    }
                                  }}
                                  className=""
                                />
                              </div>
                            </div>
                            <div className="flex items-center">
                              <Input 
                                type="color" 
                                id="headerTextColor"
                                defaultValue="#ffffff"
                                className="h-7 w-full border-border p-0.5"
                                onChange={(e) => {
                                  // Update the hex display when color changes
                                  const hexDisplay = document.getElementById('headerTextColorHex');
                                  if (hexDisplay) hexDisplay.textContent = e.target.value.toUpperCase();
                                }}
                              />
                              <div 
                                id="headerTextColorHex" 
                                className="ml-2 text-xs w-16 font-mono"
                              >
                                #FFFFFF
                              </div>
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between mb-1">
                              <Label className="text-xs">Background</Label>
                              <div className="flex items-center">
                                <span className="text-xs mr-1">Apply</span>
                                <Checkbox 
                                  id="applyHeaderBgColor" 
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      updateSetting('headerBackgroundColor', (document.getElementById('headerBgColor') as HTMLInputElement)?.value);
                                    }
                                  }}
                                  className=""
                                />
                              </div>
                            </div>
                            <div className="flex items-center">
                              <Input 
                                type="color" 
                                id="headerBgColor"
                                defaultValue="#FF00FF"
                                className="h-7 w-full border-border p-0.5"
                                onChange={(e) => {
                                  // Update the hex display when color changes
                                  const hexDisplay = document.getElementById('headerBgColorHex');
                                  if (hexDisplay) hexDisplay.textContent = e.target.value.toUpperCase();
                                }}
                              />
                              <div 
                                id="headerBgColorHex" 
                                className="ml-2 text-xs w-16 font-mono"
                              >
                                #FF00FF
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Alignment Section */}
                      <div className="mb-4 flex-1">
                        <div className="grid grid-cols-1 gap-3">
                          <div>
                            <Label className="text-xs mb-1 block">Horizontal</Label>
                            <div className="grid grid-cols-3 gap-1">
                              <Button 
                                variant="outline" 
                                className="h-7 flex-1 px-0 bg-muted/20 border-border"
                                onClick={() => updateSetting('headerTextAlign', 'left')}
                              >
                                <AlignLeft className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                className="h-7 flex-1 px-0 bg-muted/20 border-border"
                                onClick={() => updateSetting('headerTextAlign', 'center')}
                              >
                                <AlignCenter className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                className="h-7 flex-1 px-0 bg-muted/20 border-border"
                                onClick={() => updateSetting('headerTextAlign', 'right')}
                              >
                                <AlignRight className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <div>
                            <Label className="text-xs mb-1 block">Vertical</Label>
                            <div className="grid grid-cols-3 gap-1">
                              <Button 
                                variant="outline" 
                                className="h-7 flex-1 px-0 bg-muted/20 border-border"
                                onClick={() => updateSetting('headerVerticalAlign', 'top')}
                              >
                                <AlignStartVertical className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                className="h-7 flex-1 px-0 bg-muted/20 border-border"
                                onClick={() => updateSetting('headerVerticalAlign', 'middle')}
                              >
                                <AlignCenterVertical className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                className="h-7 flex-1 px-0 bg-muted/20 border-border"
                                onClick={() => updateSetting('headerVerticalAlign', 'bottom')}
                              >
                                <AlignEndVertical className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Borders Section */}
                      <div className="flex-1">
                        <div className="flex justify-between mb-1">
                          <h3 className="text-xs font-medium">Borders</h3>
                          <div className="flex items-center">
                            <span className="text-xs mr-1">Apply Borders</span>
                            <Checkbox 
                              id="applyBorders" 
                              onCheckedChange={(checked) => updateSetting('applyHeaderBorders', checked)}
                              className=""
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-x-2 gap-y-3 mb-3">
                          <div>
                            <Label className="text-xs mb-1 block">Border Properties</Label>
                            <Select 
                              defaultValue="solid" 
                              onValueChange={(value) => updateSetting('headerBorderStyle', value)}
                            >
                              <SelectTrigger className="h-7 text-xs bg-muted/20 border-border">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="solid">Solid</SelectItem>
                                <SelectItem value="dashed">Dashed</SelectItem>
                                <SelectItem value="dotted">Dotted</SelectItem>
                                <SelectItem value="double">Double</SelectItem>
                                <SelectItem value="none">None</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div>
                            <div className="flex justify-between mb-1">
                              <Label className="text-xs">Width: {(settings.headerBorderWidth as string) || '2px'}</Label>
                            </div>
                            <Slider
                              defaultValue={[2]}
                              max={5}
                              step={1}
                              className="py-1"
                              onValueChange={(value) => updateSetting('headerBorderWidth', `${value[0]}px`)}
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-x-2">
                          <div>
                            <Label className="text-xs mb-1 block">Color</Label>
                            <div className="flex items-center">
                              <Input 
                                type="color" 
                                id="headerBorderColor"
                                defaultValue="#0000FF"
                                className="h-7 w-full border-border p-0.5"
                                onChange={(e) => {
                                  updateSetting('headerBorderColor', e.target.value);
                                  // Update the hex display when color changes
                                  const hexDisplay = document.getElementById('headerBorderColorHex');
                                  if (hexDisplay) hexDisplay.textContent = e.target.value.toUpperCase();
                                }}
                              />
                              <div 
                                id="headerBorderColorHex" 
                                className="ml-2 text-xs w-16 font-mono"
                              >
                                #0000FF
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <Label className="text-xs mb-1 block">Sides</Label>
                            <Select 
                              defaultValue="bottom" 
                              onValueChange={(value) => updateSetting('headerBorderSides', value)}
                            >
                              <SelectTrigger className="h-7 text-xs bg-muted/20 border-border">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">All</SelectItem>
                                <SelectItem value="top">Top</SelectItem>
                                <SelectItem value="right">Right</SelectItem>
                                <SelectItem value="bottom">Bottom</SelectItem>
                                <SelectItem value="left">Left</SelectItem>
                                <SelectItem value="horizontal">Horizontal</SelectItem>
                                <SelectItem value="vertical">Vertical</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  {/* Cell Tab */}
                  <TabsContent value="cell" className="m-0">
                    <div className="p-3 bg-muted/10 dark:bg-muted/5 h-full flex flex-col">
                      {/* Cell Preview */}
                      <div className="bg-primary mb-3 rounded-sm flex-shrink-0">
                        <div className="text-center font-medium text-primary-foreground text-xs py-1">
                          Cell Preview
                        </div>
                      </div>
                      
                      {/* Typography Section */}
                      <div className="mb-4 flex-1">
                        <div className="grid grid-cols-2 gap-x-2 gap-y-3">
                          <div>
                            <Label className="text-xs mb-1 block">Font Family</Label>
                            <Select 
                              defaultValue="Arial" 
                              onValueChange={(value) => updateSetting('cellFontFamily', value)}
                            >
                              <SelectTrigger className="h-7 text-xs bg-muted/20 border-border">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {[
                                  { value: "Inter", label: "Inter" },
                                  { value: "Arial", label: "Arial" },
                                  { value: "Verdana", label: "Verdana" },
                                  { value: "Helvetica", label: "Helvetica" }
                                ].map((item) => (
                                  <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-xs mb-1 block">Font Size</Label>
                            <Select 
                              defaultValue="14px" 
                              onValueChange={(value) => updateSetting('cellFontSize', value)}
                            >
                              <SelectTrigger className="h-7 text-xs bg-muted/20 border-border">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="12px">12px</SelectItem>
                                <SelectItem value="14px">14px</SelectItem>
                                <SelectItem value="16px">16px</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-xs mb-1 block">Font Weight</Label>
                            <Select 
                              defaultValue="normal" 
                              onValueChange={(value) => updateSetting('cellFontWeight', value)}
                            >
                              <SelectTrigger className="h-7 text-xs bg-muted/20 border-border">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="normal">Normal</SelectItem>
                                <SelectItem value="500">Medium</SelectItem>
                                <SelectItem value="600">Semi-Bold</SelectItem>
                                <SelectItem value="bold">Bold</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-xs mb-1 block">Style</Label>
                            <div className="flex gap-1 h-7">
                              <Button 
                                variant="outline" 
                                size="icon"
                                onClick={() => updateSetting('cellFontStyle', 'bold')}
                                className="font-bold flex-1 h-7 bg-muted/20 border-border"
                              >
                                B
                              </Button>
                              <Button 
                                variant="outline" 
                                size="icon"
                                onClick={() => updateSetting('cellFontStyle', 'italic')}
                                className="italic flex-1 h-7 bg-muted/20 border-border"
                              >
                                I
                              </Button>
                              <Button 
                                variant="outline" 
                                size="icon"
                                onClick={() => updateSetting('cellFontStyle', 'underline')}
                                className="underline flex-1 h-7 bg-muted/20 border-border"
                              >
                                U
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Colors Section */}
                      <div className="mb-4 flex-1">
                        <div className="grid grid-cols-2 gap-x-2 gap-y-3">
                          <div>
                            <div className="flex justify-between mb-1">
                              <Label className="text-xs">Text Color</Label>
                              <div className="flex items-center">
                                <span className="text-xs mr-1">Apply</span>
                                <Checkbox 
                                  id="applyCellTextColor" 
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      updateSetting('cellTextColor', (document.getElementById('cellTextColor') as HTMLInputElement)?.value);
                                    }
                                  }}
                                  className=""
                                />
                              </div>
                            </div>
                            <div className="flex items-center">
                              <Input 
                                type="color" 
                                id="cellTextColor"
                                defaultValue="#000000"
                                className="h-7 w-full border-border p-0.5"
                                onChange={(e) => {
                                  // Update the hex display when color changes
                                  const hexDisplay = document.getElementById('cellTextColorHex');
                                  if (hexDisplay) hexDisplay.textContent = e.target.value.toUpperCase();
                                }}
                              />
                              <div 
                                id="cellTextColorHex" 
                                className="ml-2 text-xs w-16 font-mono"
                              >
                                #000000
                              </div>
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between mb-1">
                              <Label className="text-xs">Background</Label>
                              <div className="flex items-center">
                                <span className="text-xs mr-1">Apply</span>
                                <Checkbox 
                                  id="applyCellBgColor" 
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      updateSetting('cellBackgroundColor', (document.getElementById('cellBgColor') as HTMLInputElement)?.value);
                                    }
                                  }}
                                  className=""
                                />
                              </div>
                            </div>
                            <div className="flex items-center">
                              <Input 
                                type="color" 
                                id="cellBgColor"
                                defaultValue="#FFFFFF"
                                className="h-7 w-full border-border p-0.5"
                                onChange={(e) => {
                                  // Update the hex display when color changes
                                  const hexDisplay = document.getElementById('cellBgColorHex');
                                  if (hexDisplay) hexDisplay.textContent = e.target.value.toUpperCase();
                                }}
                              />
                              <div 
                                id="cellBgColorHex" 
                                className="ml-2 text-xs w-16 font-mono"
                              >
                                #FFFFFF
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Alignment Section */}
                      <div className="mb-4 flex-1">
                        <div className="grid grid-cols-1 gap-3">
                          <div>
                            <Label className="text-xs mb-1 block">Horizontal</Label>
                            <div className="grid grid-cols-3 gap-1">
                              <Button 
                                variant="outline" 
                                className="h-7 flex-1 px-0 bg-muted/20 border-border"
                                onClick={() => updateSetting('cellTextAlign', 'left')}
                              >
                                <AlignLeft className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                className="h-7 flex-1 px-0 bg-muted/20 border-border"
                                onClick={() => updateSetting('cellTextAlign', 'center')}
                              >
                                <AlignCenter className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                className="h-7 flex-1 px-0 bg-muted/20 border-border"
                                onClick={() => updateSetting('cellTextAlign', 'right')}
                              >
                                <AlignRight className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <div>
                            <Label className="text-xs mb-1 block">Vertical</Label>
                            <div className="grid grid-cols-3 gap-1">
                              <Button 
                                variant="outline" 
                                className="h-7 flex-1 px-0 bg-muted/20 border-border"
                                onClick={() => updateSetting('cellVerticalAlign', 'top')}
                              >
                                <AlignStartVertical className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                className="h-7 flex-1 px-0 bg-muted/20 border-border"
                                onClick={() => updateSetting('cellVerticalAlign', 'middle')}
                              >
                                <AlignCenterVertical className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                className="h-7 flex-1 px-0 bg-muted/20 border-border"
                                onClick={() => updateSetting('cellVerticalAlign', 'bottom')}
                              >
                                <AlignEndVertical className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Borders Section */}
                      <div className="flex-1">
                        <div className="flex justify-between mb-1">
                          <h3 className="text-xs font-medium">Borders</h3>
                          <div className="flex items-center">
                            <span className="text-xs mr-1">Apply Borders</span>
                            <Checkbox 
                              id="applyCellBorders" 
                              onCheckedChange={(checked) => updateSetting('applyCellBorders', checked)}
                              className=""
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-x-2 gap-y-3 mb-3">
                          <div>
                            <Label className="text-xs mb-1 block">Border Properties</Label>
                            <Select 
                              defaultValue="solid" 
                              onValueChange={(value) => updateSetting('cellBorderStyle', value)}
                            >
                              <SelectTrigger className="h-7 text-xs bg-muted/20 border-border">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="solid">Solid</SelectItem>
                                <SelectItem value="dashed">Dashed</SelectItem>
                                <SelectItem value="dotted">Dotted</SelectItem>
                                <SelectItem value="double">Double</SelectItem>
                                <SelectItem value="none">None</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div>
                            <div className="flex justify-between mb-1">
                              <Label className="text-xs">Width: {(settings.cellBorderWidth as string) || '1px'}</Label>
                            </div>
                            <Slider
                              defaultValue={[1]}
                              max={5}
                              step={1}
                              className="py-1"
                              onValueChange={(value) => updateSetting('cellBorderWidth', `${value[0]}px`)}
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-x-2">
                          <div>
                            <Label className="text-xs mb-1 block">Color</Label>
                            <div className="flex items-center">
                              <Input 
                                type="color" 
                                id="cellBorderColor"
                                defaultValue="#DDDDDD"
                                className="h-7 w-full border-border p-0.5"
                                onChange={(e) => {
                                  updateSetting('cellBorderColor', e.target.value);
                                  // Update the hex display when color changes
                                  const hexDisplay = document.getElementById('cellBorderColorHex');
                                  if (hexDisplay) hexDisplay.textContent = e.target.value.toUpperCase();
                                }}
                              />
                              <div 
                                id="cellBorderColorHex" 
                                className="ml-2 text-xs w-16 font-mono"
                              >
                                #DDDDDD
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <Label className="text-xs mb-1 block">Sides</Label>
                            <Select 
                              defaultValue="all" 
                              onValueChange={(value) => updateSetting('cellBorderSides', value)}
                            >
                              <SelectTrigger className="h-7 text-xs bg-muted/20 border-border">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">All</SelectItem>
                                <SelectItem value="top">Top</SelectItem>
                                <SelectItem value="right">Right</SelectItem>
                                <SelectItem value="bottom">Bottom</SelectItem>
                                <SelectItem value="left">Left</SelectItem>
                                <SelectItem value="horizontal">Horizontal</SelectItem>
                                <SelectItem value="vertical">Vertical</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  {/* Formatter Tab */}
                  <TabsContent value="formatter" className="m-0">
                    <div className="bg-muted/10 dark:bg-muted/5 p-3">
                      <div className="mb-4 flex items-center">
                        <h3 className="text-xs font-medium flex items-center">
                          <span className="mr-2">≡</span>Formatter
                        </h3>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <Label className="text-xs mb-1 block">Formatter Type</Label>
                          <Select 
                            value={(settings.formatterType as string) || 'none'}
                            onValueChange={(value) => updateSetting('formatterType', value)}
                          >
                            <SelectTrigger className="h-8 text-xs bg-muted/20 border-border">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">None</SelectItem>
                              <SelectItem value="number">Number</SelectItem>
                              <SelectItem value="currency">Currency</SelectItem>
                              <SelectItem value="date">Date</SelectItem>
                              <SelectItem value="percent">Percent</SelectItem>
                              <SelectItem value="custom">Custom</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        {/* Dynamic second field based on formatter type */}
                        {(settings.formatterType === 'number' || settings.formatterType === 'currency' || settings.formatterType === 'percent') && (
                          <div>
                            <Label className="text-xs mb-1 block">Decimal Places</Label>
                            <Input 
                              type="number" 
                              min={0} 
                              max={10}
                              value={(settings.decimalPlaces as number) || 0}
                              onChange={(e) => updateSetting('decimalPlaces', Number(e.target.value))}
                              className="h-8 text-xs bg-muted/20 border-border"
                            />
                          </div>
                        )}
                        
                        {settings.formatterType === 'date' && (
                          <div>
                            <Label className="text-xs mb-1 block">Date Format</Label>
                            <Select 
                              value={(settings.dateFormat as string) || 'MM/DD/YYYY'}
                              onValueChange={(value) => updateSetting('dateFormat', value)}
                            >
                              <SelectTrigger className="h-8 text-xs bg-muted/20 border-border">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                                <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                                <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                                <SelectItem value="MMM DD, YYYY">MMM DD, YYYY</SelectItem>
                                <SelectItem value="DD MMM YYYY">DD MMM YYYY</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                        
                        {settings.formatterType === 'currency' && (
                          <div>
                            <Label className="text-xs mb-1 block">Currency Symbol</Label>
                            <Select 
                              value={(settings.currencySymbol as string) || '$'}
                              onValueChange={(value) => updateSetting('currencySymbol', value)}
                            >
                              <SelectTrigger className="h-8 text-xs bg-muted/20 border-border">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="$">$</SelectItem>
                                <SelectItem value="€">€</SelectItem>
                                <SelectItem value="£">£</SelectItem>
                                <SelectItem value="¥">¥</SelectItem>
                                <SelectItem value="₹">₹</SelectItem>
                                <SelectItem value="₽">₽</SelectItem>
                                <SelectItem value="R$">R$</SelectItem>
                                <SelectItem value="kr">kr</SelectItem>
                                <SelectItem value="₿">₿</SelectItem>
                                <SelectItem value="₩">₩</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                        
                        {settings.formatterType === 'number' && (
                          <div>
                            <Label className="text-xs mb-1 block">Format Preset</Label>
                            <Select 
                              value={(settings.numberPreset as string) || 'default'}
                              onValueChange={(value) => updateSetting('numberPreset', value)}
                            >
                              <SelectTrigger className="h-8 text-xs bg-muted/20 border-border">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="default">Default</SelectItem>
                                <SelectItem value="scientific">Scientific</SelectItem>
                                <SelectItem value="engineering">Engineering</SelectItem>
                                <SelectItem value="compact">Compact</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      </div>
                      
                      {/* Additional options based on formatter type */}
                      {settings.formatterType === 'currency' && (
                        <div className="mb-4">
                          <Label className="text-xs mb-1 block">Symbol Position</Label>
                          <Select 
                            value={(settings.symbolPosition as string) || 'before'}
                            onValueChange={(value) => updateSetting('symbolPosition', value)}
                          >
                            <SelectTrigger className="h-8 text-xs bg-muted/20 border-border">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="before">Before ($100)</SelectItem>
                              <SelectItem value="after">After (100$)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                      
                      {settings.formatterType === 'number' && (
                        <div className="mb-4">
                          <div className="flex items-center space-x-2">
                            <Switch 
                              id="thousandsSeparator" 
                              checked={settings.thousandsSeparator as boolean}
                              onCheckedChange={(checked) => updateSetting('thousandsSeparator', checked)}
                            />
                            <Label htmlFor="thousandsSeparator" className="text-xs">Thousands Separator</Label>
                          </div>
                        </div>
                      )}
                      
                      {/* Custom Formatter Section */}
                      {settings.formatterType === 'custom' && (
                        <>
                          <div className="flex mb-4">
                            <div className="grid grid-cols-2 gap-2 w-full">
                              <Button 
                                variant="outline" 
                                className="text-xs h-8 bg-muted/20 border-border"
                                onClick={() => updateSetting('showFormatEditor', true)}
                              >
                                Format Editor
                              </Button>
                              <Button 
                                variant="outline" 
                                className="text-xs h-8 bg-primary text-primary-foreground"
                                onClick={() => updateSetting('showExamples', true)}
                              >
                                Examples
                              </Button>
                            </div>
                          </div>
                          
                          {settings.showFormatEditor && (
                            <div className="mb-4">
                              <Label className="text-xs mb-1 block">Custom Format</Label>
                              <div className="relative">
                                <Input 
                                  value={(settings.customFormat as string) || '[>0][Green]"^"$#,##0.00;[<0][Red]"v"$#,##0.00;$0.00'}
                                  onChange={(e) => updateSetting('customFormat', e.target.value)}
                                  className="pr-8 h-8 text-xs font-mono bg-muted/20 border-border"
                                />
                                <div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs cursor-help text-muted-foreground">
                                  ?
                                </div>
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">
                                Supports Excel-like formats. Click the ? for help.
                              </div>
                            </div>
                          )}
                          
                          {settings.showExamples && (
                            <div className="space-y-4">
                              <Label className="text-xs block">Click an example to apply it:</Label>
                              
                              {formatExamples.map((example, index) => (
                                <div key={index} className="border border-border rounded-md p-3 bg-background/50">
                                  <div className="flex justify-between mb-2">
                                    <h4 className="text-xs font-medium">{example.name}</h4>
                                    <Button 
                                      size="sm"
                                      onClick={() => updateSetting('customFormat', example.format)}
                                      className="h-6 text-xs px-3 bg-primary text-primary-foreground"
                                    >
                                      Apply
                                    </Button>
                                  </div>
                                  <div className="text-xs mb-2 font-mono bg-muted/50 p-2 rounded-md overflow-x-auto">
                                    {example.format}
                                  </div>
                                  <div className="grid grid-cols-3 gap-2">
                                    {example.preview.map((item, idx) => (
                                      <div key={idx} className="flex items-center">
                                        <span className="text-xs text-muted-foreground mr-1">{item.value}:</span>
                                        <span className="text-xs" style={{ color: item.color }}>{item.display}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </>
                      )}
                      
                      {/* Preview Section */}
                      {settings.formatterType !== 'none' && (
                        <div className="mt-4">
                          <div className="mb-2 grid grid-cols-2 gap-4">
                            <div>
                              <Label className="text-xs mb-1 block">Preview Value:</Label>
                              <Input 
                                type="text" 
                                value={(settings.previewValue as string) || '1234.56'}
                                onChange={(e) => updateSetting('previewValue', e.target.value)}
                                className="h-8 text-xs bg-muted/20 border-border"
                              />
                            </div>
                          </div>
                          
                          <div className="border border-border rounded-md p-3 bg-background/50">
                            <Label className="text-xs mb-1 block">Preview:</Label>
                            <div className="min-h-10 p-2 bg-muted/30 rounded-md flex items-center">
                              {settings.formatterType === 'custom' && settings.customFormat === '[>0][Green]"^"$#,##0.00;[<0][Red]"v"$#,##0.00;$0.00' && (
                                <span className="text-sm font-mono text-success">^$1,234.56</span>
                              )}
                              
                              {settings.formatterType === 'custom' && settings.customFormat === '[=1][Green]"✓";[=0][Red]"✗";"N/A"' && (
                                <span className="text-sm font-mono">
                                  {settings.previewValue === '1' ? (
                                    <span className="text-success">✓</span>
                                  ) : settings.previewValue === '0' ? (
                                    <span className="text-destructive">✗</span>
                                  ) : (
                                    <span>N/A</span>
                                  )}
                                </span>
                              )}
                              
                              {settings.formatterType === 'currency' && (
                                <span className="text-sm font-mono">
                                  {settings.symbolPosition === 'before' 
                                    ? `${settings.currencySymbol}${parseFloat(settings.previewValue as string || '0').toFixed(settings.decimalPlaces as number || 0)}`
                                    : `${parseFloat(settings.previewValue as string || '0').toFixed(settings.decimalPlaces as number || 0)}${settings.currencySymbol}`
                                  }
                                </span>
                              )}
                              
                              {settings.formatterType === 'number' && (
                                <span className="text-sm font-mono">
                                  {parseFloat(settings.previewValue as string || '0').toFixed(settings.decimalPlaces as number || 0)}
                                </span>
                              )}
                              
                              {settings.formatterType === 'percent' && (
                                <span className="text-sm font-mono">
                                  {`${parseFloat(settings.previewValue as string || '0').toFixed(settings.decimalPlaces as number || 0)}%`}
                                </span>
                              )}
                              
                              {settings.formatterType === 'date' && (
                                <span className="text-sm font-mono">
                                  {/* Simplified date display for preview */}
                                  {settings.dateFormat || 'MM/DD/YYYY'}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                  
                  {/* Filter Tab */}
                  <TabsContent value="filter" className="m-0">
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <Checkbox 
                          id="enableFilter" 
                          className="mr-2 h-3 w-3" 
                          checked={settings.filter as boolean}
                          onCheckedChange={(checked) => updateSetting('filter', checked)}
                        />
                        <Label htmlFor="enableFilter" className="font-medium text-xs">Enable Filter</Label>
                      </div>
                      
                      <div className="space-y-1">
                        <Label className="text-xs">Filter Type</Label>
                        <Select 
                          value={(settings.filterType as string) || 'text'}
                          onValueChange={(value) => updateSetting('filterType', value)}
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="Select filter type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="text">Text Filter</SelectItem>
                            <SelectItem value="number">Number Filter</SelectItem>
                            <SelectItem value="date">Date Filter</SelectItem>
                            <SelectItem value="set">Set Filter</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-1 pt-1">
                        <div className="flex items-center space-x-2">
                          <Switch 
                            id="enableFloating" 
                            checked={settings.floatingFilter as boolean}
                            onCheckedChange={(checked) => updateSetting('floatingFilter', checked)}
                            className="h-4 w-7 data-[state=checked]:bg-primary"
                          />
                          <Label htmlFor="enableFloating" className="text-xs">Enable Floating Filters</Label>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  {/* Editors Tab */}
                  <TabsContent value="editors" className="m-0">
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <Checkbox 
                          id="enableEditor" 
                          className="mr-2 h-3 w-3"
                          checked={settings.editable as boolean}
                          onCheckedChange={(checked) => updateSetting('editable', checked)} 
                        />
                        <Label htmlFor="enableEditor" className="font-medium text-xs">Editable</Label>
                      </div>
                      
                      <div className="space-y-1">
                        <Label className="text-xs">Editor Type</Label>
                        <Select
                          value={(settings.editorType as string) || 'text'}
                          onValueChange={(value) => updateSetting('editorType', value)}
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="Select editor type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="text">Text Editor</SelectItem>
                            <SelectItem value="number">Number Editor</SelectItem>
                            <SelectItem value="date">Date Editor</SelectItem>
                            <SelectItem value="select">Select Editor</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <h3 className="text-xs font-medium mb-2">Editor Configuration</h3>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label className="text-xs">Placeholder Text</Label>
                            <Input 
                              placeholder="Enter placeholder..." 
                              value={(settings.placeholder as string) || ''}
                              onChange={(e) => updateSetting('placeholder', e.target.value)}
                              className="h-8 text-xs"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Max Length</Label>
                            <Input 
                              type="number" 
                              defaultValue={255} 
                              onChange={(e) => updateSetting('maxLength', Number(e.target.value))}
                              className="h-8 text-xs"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </ScrollArea>
          </div>
        </div>
        
        <DialogFooter className="border-t dark:border-border p-3 flex justify-between gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="h-8 text-xs">
            Cancel
          </Button>
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={() => {
                if (bulkUpdateMode) {
                  // In bulk mode, we don't reset settings
                  setSelectedColumns([]);
                } else if (selectedColumn) {
                  // In single mode, reset the selected column to its original state
                  const col = columns.find(c => c.field === selectedColumn);
                  if (col) {
                    setSettings(col as Record<string, unknown>);
                    setHasChanges(false);
                  }
                }
              }}
              className="h-8 text-xs"
            >
              {bulkUpdateMode ? "Clear Selection" : "Reset"}
            </Button>
            <Button 
              onClick={applyChanges} 
              disabled={
                bulkUpdateMode 
                  ? selectedColumns.length === 0 || !hasChanges
                  : !hasChanges || !selectedColumn
              }
              className={cn(
                "h-8 text-xs",
                (
                  (bulkUpdateMode && (selectedColumns.length === 0 || !hasChanges)) ||
                  (!bulkUpdateMode && (!hasChanges || !selectedColumn))
                ) ? "opacity-50" : ""
              )}
            >
              {bulkUpdateMode 
                ? `Apply to ${selectedColumns.length} Column${selectedColumns.length !== 1 ? 's' : ''}` 
                : "Apply Changes"
              }
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 