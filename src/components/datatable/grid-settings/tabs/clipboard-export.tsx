import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ClipboardExportProps {
  settings: {
    enableCellTextSelection?: boolean;
    suppressCopyRowsToClipboard?: boolean;
    suppressCopySingleCellRanges?: boolean;
    clipboardDelimiter?: string;
    suppressExcelExport?: boolean;
    suppressCsvExport?: boolean;
    exporterCsvFilename?: string;
    exporterExcelFilename?: string;
  };
  onChange: (option: string, value: any) => void;
  initialProperties?: string[];
}

export function ClipboardExport({ settings, onChange }: ClipboardExportProps) {
  const [localSettings, setLocalSettings] = useState(settings);
  
  // Update local state when settings prop changes
  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  // Handler for checkbox options
  const handleCheckboxChange = (option: string, checked: boolean) => {
    setLocalSettings(prev => ({ ...prev, [option]: checked }));
    onChange(option, checked);
  };

  // Handler for text inputs
  const handleTextChange = (option: string, value: string) => {
    setLocalSettings(prev => ({ ...prev, [option]: value }));
    onChange(option, value);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Clipboard Options</CardTitle>
          <CardDescription>
            Configure how clipboard operations work in the grid.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="enableCellTextSelection" 
              checked={!!localSettings.enableCellTextSelection}
              onCheckedChange={(checked) => handleCheckboxChange('enableCellTextSelection', !!checked)} 
            />
            <Label htmlFor="enableCellTextSelection" className="font-normal">
              Enable cell text selection
            </Label>
            <p className="text-xs text-muted-foreground ml-6">
              When enabled, allows text within cells to be selected.
            </p>
          </div>
          
          {/* Note: suppressCopyRowsToClipboard is deprecated in v32.2+ 
              Use rowSelection.copySelectedRows instead */}
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="suppressCopySingleCellRanges" 
              checked={!!localSettings.suppressCopySingleCellRanges}
              onCheckedChange={(checked) => handleCheckboxChange('suppressCopySingleCellRanges', !!checked)} 
            />
            <Label htmlFor="suppressCopySingleCellRanges" className="font-normal">
              Prevent copying when only a single cell is selected
            </Label>
          </div>
          
          <div className="space-y-2 pt-3">
            <Label htmlFor="clipboardDelimiter">Clipboard Delimiter</Label>
            <Input
              id="clipboardDelimiter"
              value={localSettings.clipboardDelimiter || ''}
              onChange={(e) => handleTextChange('clipboardDelimiter', e.target.value)}
              placeholder="\t (Default: Tab)"
              maxLength={5}
            />
            <p className="text-xs text-muted-foreground">
              Character used to separate values when copying to clipboard.
            </p>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Export Options</CardTitle>
          <CardDescription>
            Configure data export settings.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="suppressCsvExport" 
              checked={!!localSettings.suppressCsvExport}
              onCheckedChange={(checked) => handleCheckboxChange('suppressCsvExport', !!checked)} 
            />
            <Label htmlFor="suppressCsvExport" className="font-normal">
              Disable CSV export
            </Label>
          </div>
          
          <div className="space-y-2 pt-2">
            <Label htmlFor="exporterCsvFilename">CSV Export Filename</Label>
            <Input
              id="exporterCsvFilename"
              value={localSettings.exporterCsvFilename || ''}
              onChange={(e) => handleTextChange('exporterCsvFilename', e.target.value)}
              placeholder="export.csv"
            />
            <p className="text-xs text-muted-foreground">
              Default filename for CSV export.
            </p>
          </div>
          
          <div className="flex items-center space-x-2 pt-3">
            <Checkbox 
              id="suppressExcelExport" 
              checked={!!localSettings.suppressExcelExport}
              onCheckedChange={(checked) => handleCheckboxChange('suppressExcelExport', !!checked)} 
            />
            <Label htmlFor="suppressExcelExport" className="font-normal">
              Disable Excel export (Enterprise)
            </Label>
          </div>
          
          <div className="space-y-2 pt-2">
            <Label htmlFor="exporterExcelFilename">Excel Export Filename</Label>
            <Input
              id="exporterExcelFilename"
              value={localSettings.exporterExcelFilename || ''}
              onChange={(e) => handleTextChange('exporterExcelFilename', e.target.value)}
              placeholder="export.xlsx"
              disabled={!!localSettings.suppressExcelExport}
            />
            <p className="text-xs text-muted-foreground">
              Default filename for Excel export (Enterprise).
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 