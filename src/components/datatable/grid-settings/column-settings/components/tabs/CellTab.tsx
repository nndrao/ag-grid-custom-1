import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { InfoIcon } from "lucide-react";
import { CellSettings } from "../../types";

interface CellTabProps {
  settings: CellSettings;
  onSettingsChange: (settings: CellSettings) => void;
  isModified: boolean;
  bulkUpdateMode: boolean;
}

export function CellTab({
  settings,
  onSettingsChange,
  isModified,
  bulkUpdateMode
}: CellTabProps) {
  const updateSettings = (update: Partial<CellSettings>) => {
    onSettingsChange({ ...settings, ...update });
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

      {/* Alignment Section */}
      <Card className="p-4">
        <h4 className="text-sm font-semibold mb-4">Cell Alignment</h4>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm">Horizontal Alignment</Label>
            <Tabs
              value={settings.horizontalAlign || "left"}
              onValueChange={(value) => updateSettings({ horizontalAlign: value })}
            >
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="left">Left</TabsTrigger>
                <TabsTrigger value="center">Center</TabsTrigger>
                <TabsTrigger value="right">Right</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="space-y-2">
            <Label className="text-sm">Vertical Alignment</Label>
            <Tabs
              value={settings.verticalAlign || "middle"}
              onValueChange={(value) => updateSettings({ verticalAlign: value })}
            >
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="top">Top</TabsTrigger>
                <TabsTrigger value="middle">Middle</TabsTrigger>
                <TabsTrigger value="bottom">Bottom</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </Card>

      {/* Style Settings */}
      <Card className="p-4">
        <h4 className="text-sm font-semibold mb-4">Cell Style</h4>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-normal">Wrap Text</Label>
            <Checkbox
              checked={settings.wrapText || false}
              onCheckedChange={(checked) => updateSettings({ wrapText: !!checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label className="text-sm font-normal">Auto Height</Label>
            <Checkbox
              checked={settings.autoHeight || false}
              onCheckedChange={(checked) => updateSettings({ autoHeight: !!checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label className="text-sm font-normal">Cell Class</Label>
            <Select
              value={settings.cellClass || ""}
              onValueChange={(value) => updateSettings({ cellClass: value })}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Default" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Default</SelectItem>
                <SelectItem value="cell-bold">Bold</SelectItem>
                <SelectItem value="cell-italic">Italic</SelectItem>
                <SelectItem value="cell-highlight">Highlight</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      <Separator />

      {/* Advanced Settings */}
      <div>
        <h4 className="text-sm font-semibold mb-3">Advanced Settings</h4>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-normal">Cell Renderer</Label>
            <Select
              value={settings.cellRenderer || ""}
              onValueChange={(value) => updateSettings({ cellRenderer: value })}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Default" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Default</SelectItem>
                <SelectItem value="booleanCellRenderer">Boolean</SelectItem>
                <SelectItem value="currency">Currency</SelectItem>
                <SelectItem value="percentage">Percentage</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <Label className="text-sm font-normal">Use Full Width Row</Label>
            <Checkbox
              checked={settings.useFullWidthRow || false}
              onCheckedChange={(checked) => updateSettings({ useFullWidthRow: !!checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label className="text-sm font-normal">Suppress Cell Flash</Label>
            <Checkbox
              checked={settings.suppressCellFlash || false}
              onCheckedChange={(checked) => updateSettings({ suppressCellFlash: !!checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label className="text-sm font-normal">Include Buttons in Row Drag</Label>
            <Checkbox
              checked={settings.includeButtonsInRowDrag || false}
              onCheckedChange={(checked) => updateSettings({ includeButtonsInRowDrag: !!checked })}
            />
          </div>
        </div>
      </div>
    </div>
  );
}