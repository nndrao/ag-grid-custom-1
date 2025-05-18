import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { InfoIcon } from "lucide-react";
import { FormatterSettings } from "../../types";

interface FormatterTabProps {
  settings: FormatterSettings;
  onSettingsChange: (settings: FormatterSettings) => void;
  isModified: boolean;
  bulkUpdateMode: boolean;
  columnType?: string;
}

export function FormatterTab({
  settings,
  onSettingsChange,
  isModified,
  bulkUpdateMode,
  columnType
}: FormatterTabProps) {
  const updateSettings = (update: Partial<FormatterSettings>) => {
    onSettingsChange({ ...settings, ...update });
  };

  const handleTypeChange = (type: string) => {
    let newSettings: FormatterSettings = { type };
    
    // Set default values based on type
    switch (type) {
      case 'number':
        newSettings = {
          ...newSettings,
          decimals: 2,
          use1000Separator: true
        };
        break;
      case 'currency':
        newSettings = {
          ...newSettings,
          currency: '$',
          decimals: 2,
          use1000Separator: true
        };
        break;
      case 'percentage':
        newSettings = {
          ...newSettings,
          decimals: 1,
          multiplyBy100: true
        };
        break;
      case 'date':
        newSettings = {
          ...newSettings,
          dateFormat: 'MM/DD/YYYY'
        };
        break;
    }
    
    onSettingsChange(newSettings);
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

      {/* Type Selection */}
      <Card className="p-4">
        <h4 className="text-sm font-semibold mb-4">Value Type</h4>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-normal">Display as</Label>
            <Select
              value={settings.type || "text"}
              onValueChange={handleTypeChange}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Text</SelectItem>
                <SelectItem value="number">Number</SelectItem>
                <SelectItem value="currency">Currency</SelectItem>
                <SelectItem value="percentage">Percentage</SelectItem>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="boolean">Boolean</SelectItem>
                <SelectItem value="link">Link</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Type-specific Settings */}
      {settings.type === 'number' && (
        <Card className="p-4">
          <h4 className="text-sm font-semibold mb-4">Number Format</h4>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-normal">Decimal Places</Label>
              <Input
                type="number"
                min="0"
                max="10"
                value={settings.decimals || 0}
                onChange={(e) => updateSettings({ decimals: parseInt(e.target.value) || 0 })}
                className="w-20"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-sm font-normal">Use thousands separator</Label>
              <input
                type="checkbox"
                checked={settings.use1000Separator || false}
                onChange={(e) => updateSettings({ use1000Separator: e.target.checked })}
                className="h-4 w-4"
              />
            </div>
          </div>
        </Card>
      )}

      {settings.type === 'currency' && (
        <Card className="p-4">
          <h4 className="text-sm font-semibold mb-4">Currency Format</h4>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-normal">Currency Symbol</Label>
              <Input
                type="text"
                value={settings.currency || '$'}
                onChange={(e) => updateSettings({ currency: e.target.value })}
                className="w-20"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-sm font-normal">Decimal Places</Label>
              <Input
                type="number"
                min="0"
                max="10"
                value={settings.decimals || 2}
                onChange={(e) => updateSettings({ decimals: parseInt(e.target.value) || 0 })}
                className="w-20"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-sm font-normal">Use thousands separator</Label>
              <input
                type="checkbox"
                checked={settings.use1000Separator || false}
                onChange={(e) => updateSettings({ use1000Separator: e.target.checked })}
                className="h-4 w-4"
              />
            </div>
          </div>
        </Card>
      )}

      {settings.type === 'percentage' && (
        <Card className="p-4">
          <h4 className="text-sm font-semibold mb-4">Percentage Format</h4>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-normal">Decimal Places</Label>
              <Input
                type="number"
                min="0"
                max="10"
                value={settings.decimals || 1}
                onChange={(e) => updateSettings({ decimals: parseInt(e.target.value) || 0 })}
                className="w-20"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-sm font-normal">Multiply by 100</Label>
              <input
                type="checkbox"
                checked={settings.multiplyBy100 || false}
                onChange={(e) => updateSettings({ multiplyBy100: e.target.checked })}
                className="h-4 w-4"
              />
            </div>
          </div>
        </Card>
      )}

      {settings.type === 'date' && (
        <Card className="p-4">
          <h4 className="text-sm font-semibold mb-4">Date Format</h4>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-normal">Format</Label>
              <Select
                value={settings.dateFormat || "MM/DD/YYYY"}
                onValueChange={(value) => updateSettings({ dateFormat: value })}
              >
                <SelectTrigger className="w-40">
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
          </div>
        </Card>
      )}

      {settings.type === 'link' && (
        <Card className="p-4">
          <h4 className="text-sm font-semibold mb-4">Link Options</h4>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-normal">Open in new tab</Label>
              <input
                type="checkbox"
                checked={settings.openInNewTab || false}
                onChange={(e) => updateSettings({ openInNewTab: e.target.checked })}
                className="h-4 w-4"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-sm font-normal">Show as button</Label>
              <input
                type="checkbox"
                checked={settings.showAsButton || false}
                onChange={(e) => updateSettings({ showAsButton: e.target.checked })}
                className="h-4 w-4"
              />
            </div>
          </div>
        </Card>
      )}

      <Separator />

      {/* Prefix/Suffix */}
      <Card className="p-4">
        <h4 className="text-sm font-semibold mb-4">Prefix & Suffix</h4>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-normal">Prefix</Label>
            <Input
              type="text"
              value={settings.prefix || ''}
              onChange={(e) => updateSettings({ prefix: e.target.value })}
              placeholder="e.g., $"
              className="w-32"
            />
          </div>

          <div className="flex items-center justify-between">
            <Label className="text-sm font-normal">Suffix</Label>
            <Input
              type="text"
              value={settings.suffix || ''}
              onChange={(e) => updateSettings({ suffix: e.target.value })}
              placeholder="e.g., USD"
              className="w-32"
            />
          </div>
        </div>
      </Card>
    </div>
  );
}