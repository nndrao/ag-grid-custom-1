import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { InfoIcon } from "lucide-react";
import { EditorSettings } from "../../types";

interface EditorsTabProps {
  settings: EditorSettings;
  onSettingsChange: (settings: EditorSettings) => void;
  isModified: boolean;
  bulkUpdateMode: boolean;
  columnType?: string;
}

export function EditorsTab({
  settings,
  onSettingsChange,
  isModified,
  bulkUpdateMode,
  columnType
}: EditorsTabProps) {
  const updateSettings = (update: Partial<EditorSettings>) => {
    onSettingsChange({ ...settings, ...update });
  };

  const getEditorOptions = () => {
    const baseOptions = [
      { value: 'agTextCellEditor', label: 'Text Editor' },
      { value: 'agSelectCellEditor', label: 'Select Editor' },
      { value: 'agNumberCellEditor', label: 'Number Editor' },
      { value: 'agDateCellEditor', label: 'Date Editor' },
      { value: 'agLargeTextCellEditor', label: 'Large Text Editor' },
    ];

    if (columnType === 'boolean') {
      baseOptions.push({ value: 'agCheckboxCellEditor', label: 'Checkbox Editor' });
    }

    return baseOptions;
  };

  return (
    <div className="space-y-6">
      {bulkUpdateMode && (
        <Alert className="bg-blue-50 border-blue-200">
          <InfoIcon className="h-4 w-4" />
          <AlertDescription>
            These settings will be applied to all selected columns
          </AlertDescription>
        </Alert>
      )}
      
      {isModified && (
        <Badge variant="outline" className="mb-4">Modified</Badge>
      )}

      {/* Editor Type */}
      <Card className="p-4">
        <h4 className="text-sm font-semibold mb-4">Cell Editor</h4>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="editable"
              checked={settings.editable !== false}
              onCheckedChange={(checked) => updateSettings({ editable: checked })}
            />
            <Label htmlFor="editable" className="text-sm font-normal">
              Allow editing
            </Label>
          </div>

          {settings.editable !== false && (
            <div className="flex items-center justify-between">
              <Label className="text-sm font-normal">Editor Type</Label>
              <Select
                value={settings.cellEditor || 'agTextCellEditor'}
                onValueChange={(value) => updateSettings({ cellEditor: value })}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {getEditorOptions().map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </Card>

      {/* Editor Options */}
      {settings.editable !== false && (
        <Card className="p-4">
          <h4 className="text-sm font-semibold mb-4">Editor Options</h4>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="singleClickEdit"
                checked={settings.singleClickEdit || false}
                onCheckedChange={(checked) => updateSettings({ singleClickEdit: !!checked })}
              />
              <Label htmlFor="singleClickEdit" className="text-sm font-normal">
                Single click to edit
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="enterMovesDown"
                checked={settings.enterMovesDown !== false}
                onCheckedChange={(checked) => updateSettings({ enterMovesDown: checked })}
              />
              <Label htmlFor="enterMovesDown" className="text-sm font-normal">
                Enter key moves down
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="enterMovesDownAfterEdit"
                checked={settings.enterMovesDownAfterEdit !== false}
                onCheckedChange={(checked) => updateSettings({ enterMovesDownAfterEdit: checked })}
              />
              <Label htmlFor="enterMovesDownAfterEdit" className="text-sm font-normal">
                Enter moves down after edit
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="stopEditingWhenCellsLoseFocus"
                checked={settings.stopEditingWhenCellsLoseFocus !== false}
                onCheckedChange={(checked) => updateSettings({ stopEditingWhenCellsLoseFocus: checked })}
              />
              <Label htmlFor="stopEditingWhenCellsLoseFocus" className="text-sm font-normal">
                Stop editing when focus lost
              </Label>
            </div>
          </div>
        </Card>
      )}

      {/* Validation */}
      {settings.editable !== false && (
        <Card className="p-4">
          <h4 className="text-sm font-semibold mb-4">Validation</h4>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-normal">Pattern Validation</Label>
              <Input
                type="text"
                value={settings.pattern || ''}
                onChange={(e) => updateSettings({ pattern: e.target.value })}
                placeholder="e.g., [A-Za-z]+"
                className="w-40"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-sm font-normal">Min Value</Label>
              <Input
                type="number"
                value={settings.min || ''}
                onChange={(e) => updateSettings({ min: e.target.value ? Number(e.target.value) : undefined })}
                className="w-32"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-sm font-normal">Max Value</Label>
              <Input
                type="number"
                value={settings.max || ''}
                onChange={(e) => updateSettings({ max: e.target.value ? Number(e.target.value) : undefined })}
                className="w-32"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-sm font-normal">Max Length</Label>
              <Input
                type="number"
                value={settings.maxLength || ''}
                onChange={(e) => updateSettings({ maxLength: e.target.value ? Number(e.target.value) : undefined })}
                className="w-32"
              />
            </div>
          </div>
        </Card>
      )}

      {/* Advanced Settings */}
      {settings.editable !== false && (
        <Card className="p-4">
          <h4 className="text-sm font-semibold mb-4">Advanced Settings</h4>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="suppressPaste"
                checked={settings.suppressPaste || false}
                onCheckedChange={(checked) => updateSettings({ suppressPaste: !!checked })}
              />
              <Label htmlFor="suppressPaste" className="text-sm font-normal">
                Disable paste
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="suppressKeyboardEvent"
                checked={settings.suppressKeyboardEvent || false}
                onCheckedChange={(checked) => updateSettings({ suppressKeyboardEvent: !!checked })}
              />
              <Label htmlFor="suppressKeyboardEvent" className="text-sm font-normal">
                Suppress keyboard events
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="navigateToNextCell"
                checked={settings.navigateToNextCell || false}
                onCheckedChange={(checked) => updateSettings({ navigateToNextCell: !!checked })}
              />
              <Label htmlFor="navigateToNextCell" className="text-sm font-normal">
                Navigate to next cell after edit
              </Label>
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-sm font-normal">Cell Data Type</Label>
              <Select
                value={settings.cellDataType || ''}
                onValueChange={(value) => updateSettings({ cellDataType: value })}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Auto" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Auto</SelectItem>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="number">Number</SelectItem>
                  <SelectItem value="boolean">Boolean</SelectItem>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="object">Object</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}