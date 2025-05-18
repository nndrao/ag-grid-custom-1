import React, { useState, useEffect } from 'react';
import { 
  Bold, 
  Italic, 
  Underline, 
  Type,
  Palette,
  Square,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignStartVertical,
  AlignCenterVertical,
  AlignEndVertical
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

interface HeaderTabProps {
  settings: any;
  onSettingsChange: (updates: Partial<HeaderStyles>) => void;
  isModified?: boolean;
  bulkUpdateMode?: boolean;
}

interface HeaderStyles {
  headerName: string;
  headerFontFamily: string;
  headerFontSize: string;
  headerFontWeight: string;
  headerFontStyle: string;
  headerTextColor: string | null;
  headerBackgroundColor: string | null;
  headerTextAlign: string;
  headerVerticalAlign: string;
  applyHeaderBorders: boolean;
  headerBorderStyle: string;
  headerBorderWidth: string;
  headerBorderColor: string;
  headerBorderSides: string;
}

export function HeaderTab({ settings, onSettingsChange, isModified, bulkUpdateMode }: HeaderTabProps) {
  // Local state for all header styles
  const [headerStyles, setHeaderStyles] = useState<HeaderStyles>({
    headerName: settings.headerName || '',
    headerFontFamily: settings.headerFontFamily || 'Arial',
    headerFontSize: settings.headerFontSize || '14px',
    headerFontWeight: settings.headerFontWeight || 'normal',
    headerFontStyle: settings.headerFontStyle || '',
    headerTextColor: settings.headerTextColor || null,
    headerBackgroundColor: settings.headerBackgroundColor || null,
    headerTextAlign: settings.headerTextAlign || 'left',
    headerVerticalAlign: settings.headerVerticalAlign || 'middle',
    applyHeaderBorders: settings.applyHeaderBorders || false,
    headerBorderStyle: settings.headerBorderStyle || 'solid',
    headerBorderWidth: settings.headerBorderWidth || '2px',
    headerBorderColor: settings.headerBorderColor || '#0000FF',
    headerBorderSides: settings.headerBorderSides || 'bottom',
  });

  // Sync with parent settings when they change
  useEffect(() => {
    setHeaderStyles({
      headerName: settings.headerName || '',
      headerFontFamily: settings.headerFontFamily || 'Arial',
      headerFontSize: settings.headerFontSize || '14px',
      headerFontWeight: settings.headerFontWeight || 'normal',
      headerFontStyle: settings.headerFontStyle || '',
      headerTextColor: settings.headerTextColor || null,
      headerBackgroundColor: settings.headerBackgroundColor || null,
      headerTextAlign: settings.headerTextAlign || 'left',
      headerVerticalAlign: settings.headerVerticalAlign || 'middle',
      applyHeaderBorders: settings.applyHeaderBorders || false,
      headerBorderStyle: settings.headerBorderStyle || 'solid',
      headerBorderWidth: settings.headerBorderWidth || '2px',
      headerBorderColor: settings.headerBorderColor || '#0000FF',
      headerBorderSides: settings.headerBorderSides || 'bottom',
    });
  }, [settings]);

  // Update local state and parent
  const updateHeaderStyle = (key: keyof HeaderStyles, value: any) => {
    const newStyles = { ...headerStyles, [key]: value };
    setHeaderStyles(newStyles);
    // Send all properties to parent, not just the changed one
    onSettingsChange(newStyles);
  };

  // Toggle font styles
  const toggleFontStyle = (style: string) => {
    const currentStyles = headerStyles.headerFontStyle.split(' ').filter(s => s);
    const newStyles = currentStyles.includes(style)
      ? currentStyles.filter(s => s !== style)
      : [...currentStyles, style];
    updateHeaderStyle('headerFontStyle', newStyles.join(' '));
  };

  // Font families
  const fontFamilies = [
    // System fonts
    { value: "system-ui", label: "System UI" },
    { value: "sans-serif", label: "Sans Serif" },
    { value: "serif", label: "Serif" },
    { value: "monospace", label: "Monospace" },
    
    // Google Monospace Fonts
    { value: '"Roboto Mono", monospace', label: "Roboto Mono" },
    { value: '"JetBrains Mono", monospace', label: "JetBrains Mono" },
    { value: '"Source Code Pro", monospace', label: "Source Code Pro" },
    { value: '"Fira Code", monospace', label: "Fira Code" },
    { value: '"Space Mono", monospace', label: "Space Mono" },
    { value: '"Ubuntu Mono", monospace', label: "Ubuntu Mono" },
    { value: '"IBM Plex Mono", monospace', label: "IBM Plex Mono" },
    { value: '"Inconsolata", monospace', label: "Inconsolata" },
    { value: '"Cousine", monospace', label: "Cousine" },
    { value: '"PT Mono", monospace', label: "PT Mono" },
    
    // Other fonts
    { value: "Inter, sans-serif", label: "Inter" },
    { value: "Arial, sans-serif", label: "Arial" },
    { value: "Verdana, sans-serif", label: "Verdana" },
    { value: "Helvetica, sans-serif", label: "Helvetica" },
    { value: "Times New Roman, serif", label: "Times New Roman" },
    { value: "Georgia, serif", label: "Georgia" },
    { value: "Courier New, monospace", label: "Courier New" }
  ];

  // Calculate preview styles
  const getPreviewStyles = () => {
    const styles: any = {
      fontFamily: headerStyles.headerFontFamily,
      fontSize: headerStyles.headerFontSize,
      fontWeight: headerStyles.headerFontWeight,
      textAlign: headerStyles.headerTextAlign,
      display: 'flex',
      alignItems: headerStyles.headerVerticalAlign === 'top' ? 'flex-start' : 
                   headerStyles.headerVerticalAlign === 'bottom' ? 'flex-end' : 'center',
      justifyContent: headerStyles.headerTextAlign === 'left' ? 'flex-start' : 
                      headerStyles.headerTextAlign === 'right' ? 'flex-end' : 'center',
      height: '36px',
      padding: '0 12px',
      backgroundColor: 'transparent',
      borderRadius: '6px',
      transition: 'all 0.2s ease'
    };

    // Apply font styles
    if (headerStyles.headerFontStyle.includes('bold')) {
      styles.fontWeight = 'bold';
    }
    if (headerStyles.headerFontStyle.includes('italic')) {
      styles.fontStyle = 'italic';
    }
    if (headerStyles.headerFontStyle.includes('underline')) {
      styles.textDecoration = 'underline';
    }

    // Apply colors if enabled
    if (headerStyles.headerTextColor) {
      styles.color = headerStyles.headerTextColor;
    }
    if (headerStyles.headerBackgroundColor) {
      styles.backgroundColor = headerStyles.headerBackgroundColor;
    }

    // Apply borders if enabled
    if (headerStyles.applyHeaderBorders) {
      const borderStyle = `${headerStyles.headerBorderWidth} ${headerStyles.headerBorderStyle} ${headerStyles.headerBorderColor}`;
      
      if (headerStyles.headerBorderSides === 'all') {
        styles.border = borderStyle;
      } else if (headerStyles.headerBorderSides === 'horizontal') {
        styles.borderTop = borderStyle;
        styles.borderBottom = borderStyle;
      } else if (headerStyles.headerBorderSides === 'vertical') {
        styles.borderLeft = borderStyle;
        styles.borderRight = borderStyle;
      } else {
        styles[`border${headerStyles.headerBorderSides.charAt(0).toUpperCase()}${headerStyles.headerBorderSides.slice(1)}`] = borderStyle;
      }
    }

    return styles;
  };

  return (
    <div className="space-y-3">
      {/* Header Caption on left and Preview on right */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label className="text-xs mb-1 block">Header Caption</Label>
          <Input 
            value={headerStyles.headerName}
            onChange={(e) => updateHeaderStyle('headerName', e.target.value)}
            placeholder="Enter header caption"
            className="h-8 text-xs"
          />
        </div>
        
        <div>
          <Label className="text-xs mb-1 block">Preview</Label>
          <div 
            style={getPreviewStyles()}
            className="shadow-sm border text-xs"
          >
            {headerStyles.headerName || 'Column Header'}
          </div>
        </div>
      </div>
      
      {/* Typography Section */}
      <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs mb-1 block">Font Family</Label>
            <Select 
              value={headerStyles.headerFontFamily}
              onValueChange={(value) => updateHeaderStyle('headerFontFamily', value)}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {fontFamilies.map((item) => (
                  <SelectItem 
                    key={item.value} 
                    value={item.value}
                    style={{ fontFamily: item.value }}
                  >
                    {item.label}
                    {item.label.includes('Mono') && (
                      <span className="ml-2 text-xs text-muted-foreground">mono</span>
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs mb-1 block">Font Size</Label>
            <Select 
              value={headerStyles.headerFontSize}
              onValueChange={(value) => updateHeaderStyle('headerFontSize', value)}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="8px">8px</SelectItem>
                <SelectItem value="10px">10px</SelectItem>
                <SelectItem value="11px">11px</SelectItem>
                <SelectItem value="12px">12px</SelectItem>
                <SelectItem value="13px">13px</SelectItem>
                <SelectItem value="14px">14px</SelectItem>
                <SelectItem value="16px">16px</SelectItem>
                <SelectItem value="18px">18px</SelectItem>
                <SelectItem value="20px">20px</SelectItem>
                <SelectItem value="22px">22px</SelectItem>
                <SelectItem value="24px">24px</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs mb-1 block">Font Weight</Label>
            <Select 
              value={headerStyles.headerFontWeight}
              onValueChange={(value) => updateHeaderStyle('headerFontWeight', value)}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">Normal (400)</SelectItem>
                <SelectItem value="300">Light (300)</SelectItem>
                <SelectItem value="400">Regular (400)</SelectItem>
                <SelectItem value="500">Medium (500)</SelectItem>
                <SelectItem value="600">Semi-Bold (600)</SelectItem>
                <SelectItem value="700">Bold (700)</SelectItem>
                <SelectItem value="800">Extra-Bold (800)</SelectItem>
                <SelectItem value="900">Black (900)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs mb-1 block">Style</Label>
            <div className="flex gap-1">
              <Button 
                variant={headerStyles.headerFontStyle.includes('bold') ? 'secondary' : 'outline'}
                size="sm"
                onClick={() => toggleFontStyle('bold')}
                className="font-bold flex-1 h-7 text-xs"
              >
                B
              </Button>
              <Button 
                variant={headerStyles.headerFontStyle.includes('italic') ? 'secondary' : 'outline'}
                size="sm"
                onClick={() => toggleFontStyle('italic')}
                className="italic flex-1 h-7 text-xs"
              >
                I
              </Button>
              <Button 
                variant={headerStyles.headerFontStyle.includes('underline') ? 'secondary' : 'outline'}
                size="sm"
                onClick={() => toggleFontStyle('underline')}
                className="underline flex-1 h-7 text-xs"
              >
                U
              </Button>
            </div>
          </div>
        </div>
      
      {/* Colors Section */}
      <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="flex justify-between mb-1">
              <Label className="text-xs">Text Color</Label>
              <div className="flex items-center gap-1">
                <span className="text-xs text-muted-foreground">Apply</span>
                <Switch 
                  checked={!!headerStyles.headerTextColor}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      const colorInput = document.getElementById('headerTextColor') as HTMLInputElement;
                      updateHeaderStyle('headerTextColor', colorInput?.value || '#000000');
                    } else {
                      updateHeaderStyle('headerTextColor', null);
                    }
                  }}
                  className="scale-75"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Input 
                type="color" 
                id="headerTextColor"
                value={headerStyles.headerTextColor || '#000000'}
                className="h-7 w-12 p-0.5 border"
                onChange={(e) => {
                  if (headerStyles.headerTextColor) {
                    updateHeaderStyle('headerTextColor', e.target.value);
                  }
                }}
                disabled={!headerStyles.headerTextColor}
              />
              <Input
                value={(headerStyles.headerTextColor || '#000000').toUpperCase()}
                className="h-7 font-mono text-xs flex-1"
                disabled
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <Label className="text-xs">Background</Label>
              <div className="flex items-center gap-1">
                <span className="text-xs text-muted-foreground">Apply</span>
                <Switch 
                  checked={!!headerStyles.headerBackgroundColor}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      const colorInput = document.getElementById('headerBgColor') as HTMLInputElement;
                      updateHeaderStyle('headerBackgroundColor', colorInput?.value || '#FFFFFF');
                    } else {
                      updateHeaderStyle('headerBackgroundColor', null);
                    }
                  }}
                  className="scale-75"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Input 
                type="color" 
                id="headerBgColor"
                value={headerStyles.headerBackgroundColor || '#FFFFFF'}
                className="h-7 w-12 p-0.5 border"
                onChange={(e) => {
                  if (headerStyles.headerBackgroundColor) {
                    updateHeaderStyle('headerBackgroundColor', e.target.value);
                  }
                }}
                disabled={!headerStyles.headerBackgroundColor}
              />
              <Input
                value={(headerStyles.headerBackgroundColor || '#FFFFFF').toUpperCase()}
                className="h-7 font-mono text-xs flex-1"
                disabled
              />
            </div>
          </div>
        </div>
      
      {/* Alignment Section */}
      <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs mb-1 block">Horizontal</Label>
            <div className="grid grid-cols-3 gap-1">
              <Button 
                variant={headerStyles.headerTextAlign === 'left' ? 'secondary' : 'outline'}
                size="sm"
                className="h-7"
                onClick={() => updateHeaderStyle('headerTextAlign', 'left')}
              >
                <AlignLeft className="h-3 w-3" />
              </Button>
              <Button 
                variant={headerStyles.headerTextAlign === 'center' ? 'secondary' : 'outline'}
                size="sm"
                className="h-7"
                onClick={() => updateHeaderStyle('headerTextAlign', 'center')}
              >
                <AlignCenter className="h-3 w-3" />
              </Button>
              <Button 
                variant={headerStyles.headerTextAlign === 'right' ? 'secondary' : 'outline'}
                size="sm"
                className="h-7"
                onClick={() => updateHeaderStyle('headerTextAlign', 'right')}
              >
                <AlignRight className="h-3 w-3" />
              </Button>
            </div>
          </div>
          <div>
            <Label className="text-xs mb-1 block">Vertical</Label>
            <div className="grid grid-cols-3 gap-1">
              <Button 
                variant={headerStyles.headerVerticalAlign === 'top' ? 'secondary' : 'outline'}
                size="sm"
                className="h-7"
                onClick={() => updateHeaderStyle('headerVerticalAlign', 'top')}
              >
                <AlignStartVertical className="h-3 w-3" />
              </Button>
              <Button 
                variant={headerStyles.headerVerticalAlign === 'middle' ? 'secondary' : 'outline'}
                size="sm"
                className="h-7"
                onClick={() => updateHeaderStyle('headerVerticalAlign', 'middle')}
              >
                <AlignCenterVertical className="h-3 w-3" />
              </Button>
              <Button 
                variant={headerStyles.headerVerticalAlign === 'bottom' ? 'secondary' : 'outline'}
                size="sm"
                className="h-7"
                onClick={() => updateHeaderStyle('headerVerticalAlign', 'bottom')}
              >
                <AlignEndVertical className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      
      {/* Borders Section */}
      <div>
        <div className="flex justify-between mb-1">
          <Label className="text-xs">Borders</Label>
          <div className="flex items-center gap-1">
            <span className="text-xs text-muted-foreground">Apply Borders</span>
            <Switch 
              checked={headerStyles.applyHeaderBorders}
              onCheckedChange={(checked) => updateHeaderStyle('applyHeaderBorders', checked)}
              className="scale-75"
            />
          </div>
        </div>
        
        <div className={`space-y-3 ${!headerStyles.applyHeaderBorders ? 'opacity-50' : ''}`}>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs mb-1 block">Style</Label>
              <Select 
                value={headerStyles.headerBorderStyle}
                onValueChange={(value) => updateHeaderStyle('headerBorderStyle', value)}
                disabled={!headerStyles.applyHeaderBorders}
              >
                <SelectTrigger className="h-8 text-xs">
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
              <Label className="text-xs mb-1 block">Width</Label>
              <Select
                value={headerStyles.headerBorderWidth}
                onValueChange={(value) => updateHeaderStyle('headerBorderWidth', value)}
                disabled={!headerStyles.applyHeaderBorders}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1px">1px</SelectItem>
                  <SelectItem value="2px">2px</SelectItem>
                  <SelectItem value="3px">3px</SelectItem>
                  <SelectItem value="4px">4px</SelectItem>
                  <SelectItem value="5px">5px</SelectItem>
                  <SelectItem value="6px">6px</SelectItem>
                  <SelectItem value="7px">7px</SelectItem>
                  <SelectItem value="8px">8px</SelectItem>
                  <SelectItem value="9px">9px</SelectItem>
                  <SelectItem value="10px">10px</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs mb-1 block">Color</Label>
              <div className="flex items-center gap-2">
                <Input 
                  type="color" 
                  value={headerStyles.headerBorderColor}
                  className="h-7 w-12 p-0.5 border"
                  onChange={(e) => updateHeaderStyle('headerBorderColor', e.target.value)}
                  disabled={!headerStyles.applyHeaderBorders}
                />
                <Input
                  value={headerStyles.headerBorderColor.toUpperCase()}
                  className="h-7 font-mono text-xs flex-1"
                  disabled
                />
              </div>
            </div>
            
            <div>
              <Label className="text-xs mb-1 block">Sides</Label>
              <Select 
                value={headerStyles.headerBorderSides}
                onValueChange={(value) => updateHeaderStyle('headerBorderSides', value)}
                disabled={!headerStyles.applyHeaderBorders}
              >
                <SelectTrigger className="h-8 text-xs">
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
    </div>
  );
}