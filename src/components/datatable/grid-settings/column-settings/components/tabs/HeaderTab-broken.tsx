import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  InfoIcon, 
  Bold, 
  Italic, 
  Underline, 
  Type,
  Palette,
  Square,
  Minus,
  MoreHorizontal,
  MoreVertical,
  Grid3x3,
  Eye,
  EyeOff,
  Sparkles,
  ChevronDown
} from "lucide-react";
import { HeaderSettings } from "../../types";
import { ColorPicker } from "@/components/ui/color-picker";
import { cn } from "@/lib/utils";

interface HeaderTabProps {
  settings: HeaderSettings;
  onSettingsChange: (settings: HeaderSettings) => void;
  isModified: boolean;
  bulkUpdateMode: boolean;
}

const fontFamilies = [
  { value: 'default', label: 'System Default', preview: 'Aa' },
  { value: 'Arial', label: 'Arial', preview: 'Aa' },
  { value: 'Helvetica', label: 'Helvetica', preview: 'Aa' },
  { value: 'Times New Roman', label: 'Times New Roman', preview: 'Aa' },
  { value: 'Georgia', label: 'Georgia', preview: 'Aa' },
  { value: 'Verdana', label: 'Verdana', preview: 'Aa' },
  { value: 'Courier New', label: 'Courier New', preview: 'Aa' },
  { value: 'Inter', label: 'Inter', preview: 'Aa' },
  { value: 'Roboto', label: 'Roboto', preview: 'Aa' },
];

const fontSizes = [
  { value: 'default', label: 'Default' },
  { value: '10px', label: 'Extra Small' },
  { value: '12px', label: 'Small' },
  { value: '14px', label: 'Medium' },
  { value: '16px', label: 'Large' },
  { value: '18px', label: 'Extra Large' },
  { value: '20px', label: 'Huge' },
];

const fontWeights = [
  { value: 'default', label: 'Default' },
  { value: '300', label: 'Light' },
  { value: 'normal', label: 'Regular' },
  { value: '500', label: 'Medium' },
  { value: 'bold', label: 'Bold' },
  { value: '800', label: 'Extra Bold' },
];

const borderStyles = [
  { value: 'none', label: 'None', preview: (
    <div className="w-12 h-0.5"></div>
  )},
  { value: 'solid', label: 'Solid', preview: (
    <div className="w-12 h-0.5 bg-current"></div>
  )},
  { value: 'dashed', label: 'Dashed', preview: (
    <div className="w-12 h-0.5 border-t-2 border-dashed border-current"></div>
  )},
  { value: 'dotted', label: 'Dotted', preview: (
    <div className="w-12 h-0.5 border-t-2 border-dotted border-current"></div>
  )},
];

export function HeaderTab({
  settings,
  onSettingsChange,
  isModified,
  bulkUpdateMode
}: HeaderTabProps) {
  const updateSettings = (update: Partial<HeaderSettings>) => {
    const newSettings = { ...settings, ...update };
    onSettingsChange(newSettings);
  };

  const toggleTextStyle = (style: 'bold' | 'italic' | 'underline') => {
    const currentStyles = settings.textStyle || [];
    const hasStyle = currentStyles.includes(style);
    
    updateSettings({
      textStyle: hasStyle 
        ? currentStyles.filter(s => s !== style)
        : [...currentStyles, style]
    });
  };

  // Generate preview styles based on current settings
  const getPreviewStyles = () => {
    const styles: any = {};
    
    if (settings.fontFamily && settings.fontFamily !== 'default') {
      styles.fontFamily = settings.fontFamily;
    }
    
    if (settings.fontSize && settings.fontSize !== 'default') {
      styles.fontSize = settings.fontSize;
    }
    
    if (settings.fontWeight && settings.fontWeight !== 'default') {
      styles.fontWeight = settings.fontWeight;
    }
    
    if (settings.textStyle?.includes('bold')) {
      styles.fontWeight = 'bold';
    }
    
    if (settings.textStyle?.includes('italic')) {
      styles.fontStyle = 'italic';
    }
    
    if (settings.textStyle?.includes('underline')) {
      styles.textDecoration = 'underline';
    }
    
    if (settings.textColorEnabled && settings.textColor) {
      styles.color = settings.textColor;
    }
    
    if (settings.backgroundEnabled && settings.backgroundColor) {
      styles.backgroundColor = settings.backgroundColor;
    }
    
    if (settings.applyBorders) {
      const borderStyle = `${settings.borderWidth || 1}px ${settings.borderStyle || 'solid'} ${settings.borderColorEnabled ? settings.borderColor : '#e5e7eb'}`;
      
      if (settings.borderSides === 'all') {
        styles.border = borderStyle;
      } else {
        styles[`border${settings.borderSides?.charAt(0).toUpperCase()}${settings.borderSides?.slice(1)}`] = borderStyle;
      }
    }
    
    return styles;
  };

  return (
    <div className="space-y-6">
      {bulkUpdateMode && (
        <Alert className="bg-blue-50 border-blue-200">
          <InfoIcon className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            These settings will be applied to all selected columns
          </AlertDescription>
        </Alert>
      )}
      
      {isModified && (
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-orange-200 text-orange-700 bg-orange-50">
            <Sparkles className="w-3 h-3 mr-1" />
            Modified
          </Badge>
        </div>
      )}

      {/* Live Preview Section - Moved to top for better visibility */}
      <Card className="p-0 overflow-hidden bg-gradient-to-br from-gray-50 to-white">
        <div className="p-4 border-b bg-gray-50/50">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold flex items-center gap-2 text-gray-700">
              <Eye className="w-4 h-4" />
              Live Preview
            </h4>
            <Badge variant="secondary" className="text-xs">
              Real-time
            </Badge>
          </div>
        </div>
        
        <div className="p-6">
          <div className="relative overflow-hidden rounded-lg border shadow-sm">
            {/* AG-Grid style container */}
            <div className="bg-gray-50">
              {/* Header row */}
              <div 
                className="px-3 py-2.5 font-medium transition-all duration-200 hover:bg-gray-100"
                style={{
                  ...getPreviewStyles(),
                  minHeight: '36px',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                {settings.headerName || 'Column Header'}
              </div>
            </div>
            {/* Sample data rows */}
            <div className="bg-white divide-y divide-gray-100">
              <div className="px-3 py-2.5 text-sm text-gray-600">Sample data row 1</div>
              <div className="px-3 py-2.5 text-sm text-gray-600">Sample data row 2</div>
            </div>
          </div>
          <p className="mt-3 text-xs text-gray-500 text-center">
            Preview updates automatically as you modify settings
          </p>
        </div>
      </Card>

      {/* Header Caption Section */}
      <Card className="p-0 overflow-hidden">
        <div className="p-4 border-b bg-gray-50/50">
          <h4 className="text-sm font-semibold flex items-center gap-2 text-gray-700">
            <Type className="w-4 h-4" />
            Header Text
          </h4>
        </div>
        
        <div className="p-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="headerName" className="text-sm font-medium">
              Column Header Name
            </Label>
            <Input
              id="headerName"
              value={settings.headerName || ''}
              onChange={(e) => updateSettings({ headerName: e.target.value })}
              placeholder="Enter header text"
              className="w-full"
            />
            <p className="text-xs text-gray-500">
              This text will appear as the column header in your grid
            </p>
          </div>
        </div>
      </Card>

      {/* Typography Section */}
      <Card className="p-0 overflow-hidden">
        <div className="p-4 border-b bg-gray-50/50">
          <h4 className="text-sm font-semibold flex items-center gap-2 text-gray-700">
            <Type className="w-4 h-4" />
            Typography
          </h4>
        </div>
        
        <div className="p-4 space-y-6">
          {/* Font Family with Preview */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Font Family</Label>
            <Select
              value={settings.fontFamily || 'default'}
              onValueChange={(value) => updateSettings({ fontFamily: value })}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {fontFamilies.map(font => (
                  <SelectItem key={font.value} value={font.value}>
                    <div className="flex items-center justify-between w-full">
                      <span>{font.label}</span>
                      <span 
                        className="ml-4 text-lg text-gray-500"
                        style={{ fontFamily: font.value === 'default' ? 'inherit' : font.value }}
                      >
                        {font.preview}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Font Size and Weight in Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Size</Label>
              <Select
                value={settings.fontSize || 'default'}
                onValueChange={(value) => updateSettings({ fontSize: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {fontSizes.map(size => (
                    <SelectItem key={size.value} value={size.value}>
                      {size.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Weight</Label>
              <Select
                value={settings.fontWeight || 'default'}
                onValueChange={(value) => updateSettings({ fontWeight: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {fontWeights.map(weight => (
                    <SelectItem key={weight.value} value={weight.value}>
                      {weight.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Text Style Buttons */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Text Style</Label>
            <div className="flex gap-2">
              <Button
                variant={settings.textStyle?.includes('bold') ? 'default' : 'outline'}
                size="sm"
                onClick={() => toggleTextStyle('bold')}
                className="w-12 h-9"
              >
                <Bold className="h-4 w-4" />
              </Button>
              <Button
                variant={settings.textStyle?.includes('italic') ? 'default' : 'outline'}
                size="sm"
                onClick={() => toggleTextStyle('italic')}
                className="w-12 h-9"
              >
                <Italic className="h-4 w-4" />
              </Button>
              <Button
                variant={settings.textStyle?.includes('underline') ? 'default' : 'outline'}
                size="sm"
                onClick={() => toggleTextStyle('underline')}
                className="w-12 h-9"
              >
                <Underline className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Colors Section */}
      <Card className="p-0 overflow-hidden">
        <div className="p-4 border-b bg-gray-50/50">
          <h4 className="text-sm font-semibold flex items-center gap-2 text-gray-700">
            <Palette className="w-4 h-4" />
            Colors
          </h4>
        </div>
        
        <div className="p-4 space-y-6">
          {/* Text Color */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Text Color</Label>
              <button
                onClick={() => updateSettings({ textColorEnabled: !settings.textColorEnabled })}
                className={cn(
                  "p-1 rounded transition-colors",
                  settings.textColorEnabled 
                    ? "text-blue-600 hover:bg-blue-50" 
                    : "text-gray-400 hover:bg-gray-50"
                )}
              >
                {settings.textColorEnabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
            </div>
            <div className={cn(
              "transition-opacity duration-200",
              !settings.textColorEnabled && "opacity-50 pointer-events-none"
            )}>
              <ColorPicker
                value={settings.textColor || '#000000'}
                onChange={(color) => updateSettings({ textColor: color })}
              />
            </div>
          </div>

          {/* Background Color */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Background Color</Label>
              <button
                onClick={() => updateSettings({ backgroundEnabled: !settings.backgroundEnabled })}
                className={cn(
                  "p-1 rounded transition-colors",
                  settings.backgroundEnabled 
                    ? "text-blue-600 hover:bg-blue-50" 
                    : "text-gray-400 hover:bg-gray-50"
                )}
              >
                {settings.backgroundEnabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
            </div>
            <div className={cn(
              "transition-opacity duration-200",
              !settings.backgroundEnabled && "opacity-50 pointer-events-none"
            )}>
              <ColorPicker
                value={settings.backgroundColor || '#ffffff'}
                onChange={(color) => updateSettings({ backgroundColor: color })}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Borders Section */}
      <Card className="p-0 overflow-hidden">
        <div className="p-4 border-b bg-gray-50/50">
          <h4 className="text-sm font-semibold flex items-center gap-2 text-gray-700">
            <Square className="w-4 h-4" />
            Borders
          </h4>
        </div>
        
        <div className="p-4 space-y-6">
          {/* Enable Borders Toggle */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <Label htmlFor="applyBorders" className="text-sm font-medium cursor-pointer">
              Enable Borders
            </Label>
            <Checkbox
              id="applyBorders"
              checked={settings.applyBorders || false}
              onCheckedChange={(checked) => updateSettings({ applyBorders: !!checked })}
            />
          </div>

          <div className={cn(
            "space-y-6 transition-opacity duration-200",
            !settings.applyBorders && "opacity-50 pointer-events-none"
          )}>
            {/* Border Sides */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Border Sides</Label>
              <div className="grid grid-cols-5 gap-2">
                <Button
                  variant={settings.borderSides === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => updateSettings({ borderSides: 'all' })}
                  className="h-9 relative overflow-hidden"
                  title="All Borders"
                >
                  <Square className="h-4 w-4" />
                </Button>
                <Button
                  variant={settings.borderSides === 'top' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => updateSettings({ borderSides: 'top' })}
                  className="h-9 relative"
                  title="Top Border"
                >
                  <div className="relative h-4 w-4">
                    <Square className="h-4 w-4 text-gray-300" />
                    <div className="absolute top-0 left-0 w-full h-0.5 bg-current"></div>
                  </div>
                </Button>
                <Button
                  variant={settings.borderSides === 'right' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => updateSettings({ borderSides: 'right' })}
                  className="h-9 relative"
                  title="Right Border"
                >
                  <div className="relative h-4 w-4">
                    <Square className="h-4 w-4 text-gray-300" />
                    <div className="absolute top-0 right-0 w-0.5 h-full bg-current"></div>
                  </div>
                </Button>
                <Button
                  variant={settings.borderSides === 'bottom' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => updateSettings({ borderSides: 'bottom' })}
                  className="h-9 relative"
                  title="Bottom Border"
                >
                  <div className="relative h-4 w-4">
                    <Square className="h-4 w-4 text-gray-300" />
                    <div className="absolute bottom-0 left-0 w-full h-0.5 bg-current"></div>
                  </div>
                </Button>
                <Button
                  variant={settings.borderSides === 'left' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => updateSettings({ borderSides: 'left' })}
                  className="h-9 relative"
                  title="Left Border"
                >
                  <div className="relative h-4 w-4">
                    <Square className="h-4 w-4 text-gray-300" />
                    <div className="absolute top-0 left-0 w-0.5 h-full bg-current"></div>
                  </div>
                </Button>
              </div>
            </div>

            {/* Border Style and Width */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Style</Label>
                <Select
                  value={settings.borderStyle || 'solid'}
                  onValueChange={(value) => updateSettings({ borderStyle: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {borderStyles.map(style => (
                      <SelectItem key={style.value} value={style.value}>
                        <div className="flex items-center gap-3">
                          <span>{style.label}</span>
                          <div className="text-gray-400">{style.preview}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Width: {settings.borderWidth || 1}px
                </Label>
                <Slider
                  value={[settings.borderWidth || 1]}
                  onValueChange={([value]) => updateSettings({ borderWidth: value })}
                  min={1}
                  max={5}
                  step={1}
                  className="w-full"
                />
              </div>
            </div>

            {/* Border Color */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Border Color</Label>
                <button
                  onClick={() => updateSettings({ borderColorEnabled: !settings.borderColorEnabled })}
                  className={cn(
                    "p-1 rounded transition-colors",
                    settings.borderColorEnabled 
                      ? "text-blue-600 hover:bg-blue-50" 
                      : "text-gray-400 hover:bg-gray-50"
                  )}
                >
                  {settings.borderColorEnabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
              </div>
              <div className={cn(
                "transition-opacity duration-200",
                !settings.borderColorEnabled && "opacity-50 pointer-events-none"
              )}>
                <ColorPicker
                  value={settings.borderColor || '#e5e7eb'}
                  onChange={(color) => updateSettings({ borderColor: color })}
                />
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}