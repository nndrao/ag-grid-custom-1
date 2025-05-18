import React, { useState, useEffect } from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { AlignLeft, AlignCenter, AlignRight, AlignStartVertical, AlignCenterVertical, AlignEndVertical } from "lucide-react";

interface CellTabProps {
  settings: any;
  onSettingsChange: (updates: Partial<CellStyles>) => void;
  isModified?: boolean;
  bulkUpdateMode?: boolean;
}

interface CellStyles {
  sampleText: string;
  cellFontFamily: string;
  cellFontSize: string;
  cellFontWeight: string;
  cellFontStyle: string;
  cellTextColor: string | null;
  cellBackgroundColor: string | null;
  cellTextAlign: string;
  cellVerticalAlign: string;
  applyCellBorders: boolean;
  cellBorderStyle: string;
  cellBorderWidth: string;
  cellBorderColor: string;
  cellBorderSides: string;
}

export function CellTab({ settings, onSettingsChange, isModified, bulkUpdateMode }: CellTabProps) {
  // Local state for all cell styles
  const [cellStyles, setCellStyles] = useState<CellStyles>({
    sampleText: settings.sampleText || 'Sample Cell Value',
    cellFontFamily: settings.cellFontFamily || 'Arial',
    cellFontSize: settings.cellFontSize || '12px',
    cellFontWeight: settings.cellFontWeight || 'normal',
    cellFontStyle: settings.cellFontStyle || '',
    cellTextColor: settings.cellTextColor || null,
    cellBackgroundColor: settings.cellBackgroundColor || null,
    cellTextAlign: settings.cellTextAlign || 'left',
    cellVerticalAlign: settings.cellVerticalAlign || 'middle',
    applyCellBorders: settings.applyCellBorders || false,
    cellBorderStyle: settings.cellBorderStyle || 'solid',
    cellBorderWidth: settings.cellBorderWidth || '1px',
    cellBorderColor: settings.cellBorderColor || '#E5E7EB',
    cellBorderSides: settings.cellBorderSides || 'all',
  });

  // Sync with parent settings when they change
  useEffect(() => {
    setCellStyles({
      sampleText: settings.sampleText || 'Sample Cell Value',
      cellFontFamily: settings.cellFontFamily || 'Arial',
      cellFontSize: settings.cellFontSize || '12px',
      cellFontWeight: settings.cellFontWeight || 'normal',
      cellFontStyle: settings.cellFontStyle || '',
      cellTextColor: settings.cellTextColor || null,
      cellBackgroundColor: settings.cellBackgroundColor || null,
      cellTextAlign: settings.cellTextAlign || 'left',
      cellVerticalAlign: settings.cellVerticalAlign || 'middle',
      applyCellBorders: settings.applyCellBorders || false,
      cellBorderStyle: settings.cellBorderStyle || 'solid',
      cellBorderWidth: settings.cellBorderWidth || '1px',
      cellBorderColor: settings.cellBorderColor || '#E5E7EB',
      cellBorderSides: settings.cellBorderSides || 'all',
    });
  }, [settings]);

  // Update local state and parent
  const updateCellStyle = (key: keyof CellStyles, value: any) => {
    const newStyles = { ...cellStyles, [key]: value };
    setCellStyles(newStyles);
    onSettingsChange({ [key]: value });
  };

  // Toggle font styles
  const toggleFontStyle = (style: string) => {
    const currentStyles = cellStyles.cellFontStyle.split(' ').filter(s => s);
    const newStyles = currentStyles.includes(style)
      ? currentStyles.filter(s => s !== style)
      : [...currentStyles, style];
    updateCellStyle('cellFontStyle', newStyles.join(' '));
  };

  // Font families
  const fontFamilies = [
    { value: "Inter", label: "Inter" },
    { value: "Arial", label: "Arial" },
    { value: "Verdana", label: "Verdana" },
    { value: "Helvetica", label: "Helvetica" },
    { value: "Times New Roman", label: "Times New Roman" },
    { value: "Georgia", label: "Georgia" },
    { value: "Courier New", label: "Courier New" }
  ];

  // Calculate preview styles
  const getPreviewStyles = () => {
    const styles: any = {
      fontFamily: cellStyles.cellFontFamily,
      fontSize: cellStyles.cellFontSize,
      fontWeight: cellStyles.cellFontWeight,
      textAlign: cellStyles.cellTextAlign,
      display: 'flex',
      alignItems: cellStyles.cellVerticalAlign === 'top' ? 'flex-start' : 
                   cellStyles.cellVerticalAlign === 'bottom' ? 'flex-end' : 'center',
      justifyContent: cellStyles.cellTextAlign === 'left' ? 'flex-start' : 
                      cellStyles.cellTextAlign === 'right' ? 'flex-end' : 'center',
      height: '36px',
      padding: '0 12px',
      backgroundColor: 'transparent',
      borderRadius: '6px',
      transition: 'all 0.2s ease'
    };

    // Apply font styles
    if (cellStyles.cellFontStyle.includes('bold')) {
      styles.fontWeight = 'bold';
    }
    if (cellStyles.cellFontStyle.includes('italic')) {
      styles.fontStyle = 'italic';
    }
    if (cellStyles.cellFontStyle.includes('underline')) {
      styles.textDecoration = 'underline';
    }

    // Apply colors if enabled
    if (cellStyles.cellTextColor) {
      styles.color = cellStyles.cellTextColor;
    }
    if (cellStyles.cellBackgroundColor) {
      styles.backgroundColor = cellStyles.cellBackgroundColor;
    }

    // Apply borders if enabled
    if (cellStyles.applyCellBorders) {
      const borderStyle = `${cellStyles.cellBorderWidth} ${cellStyles.cellBorderStyle} ${cellStyles.cellBorderColor}`;
      
      if (cellStyles.cellBorderSides === 'all') {
        styles.border = borderStyle;
      } else if (cellStyles.cellBorderSides === 'horizontal') {
        styles.borderTop = borderStyle;
        styles.borderBottom = borderStyle;
      } else if (cellStyles.cellBorderSides === 'vertical') {
        styles.borderLeft = borderStyle;
        styles.borderRight = borderStyle;
      } else {
        styles[`border${cellStyles.cellBorderSides.charAt(0).toUpperCase()}${cellStyles.cellBorderSides.slice(1)}`] = borderStyle;
      }
    }

    return styles;
  };

  return (
    <div className="space-y-3">
      {/* Sample Display */}
      <div>
        <Label className="text-xs mb-1 block">Sample Display</Label>
        <div 
          style={getPreviewStyles()}
          className="shadow-sm border text-xs"
        >
          {cellStyles.sampleText}
        </div>
      </div>
      
      {/* Font Settings */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs mb-1 block">Font Family</Label>
          <Select 
            value={cellStyles.cellFontFamily}
            onValueChange={(value) => updateCellStyle('cellFontFamily', value)}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {fontFamilies.map((item) => (
                <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs mb-1 block">Font Size</Label>
          <Select 
            value={cellStyles.cellFontSize}
            onValueChange={(value) => updateCellStyle('cellFontSize', value)}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10px">10px</SelectItem>
              <SelectItem value="12px">12px</SelectItem>
              <SelectItem value="14px">14px</SelectItem>
              <SelectItem value="16px">16px</SelectItem>
              <SelectItem value="18px">18px</SelectItem>
              <SelectItem value="20px">20px</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs mb-1 block">Font Weight</Label>
          <Select 
            value={cellStyles.cellFontWeight}
            onValueChange={(value) => updateCellStyle('cellFontWeight', value)}
          >
            <SelectTrigger className="h-8 text-xs">
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
          <div className="flex gap-1">
            <Button 
              variant={cellStyles.cellFontStyle.includes('bold') ? 'secondary' : 'outline'}
              size="sm"
              onClick={() => toggleFontStyle('bold')}
              className="font-bold flex-1 h-7 text-xs"
            >
              B
            </Button>
            <Button 
              variant={cellStyles.cellFontStyle.includes('italic') ? 'secondary' : 'outline'}
              size="sm"
              onClick={() => toggleFontStyle('italic')}
              className="italic flex-1 h-7 text-xs"
            >
              I
            </Button>
            <Button 
              variant={cellStyles.cellFontStyle.includes('underline') ? 'secondary' : 'outline'}
              size="sm"
              onClick={() => toggleFontStyle('underline')}
              className="underline flex-1 h-7 text-xs"
            >
              U
            </Button>
          </div>
        </div>
      </div>
      
      {/* Color Settings */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="flex justify-between mb-1">
            <Label className="text-[10px]">Text Color</Label>
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-muted-foreground">Apply</span>
              <Switch 
                checked={!!cellStyles.cellTextColor}
                onCheckedChange={(checked) => {
                  if (checked) {
                    const colorInput = document.getElementById('cellTextColor') as HTMLInputElement;
                    updateCellStyle('cellTextColor', colorInput?.value || '#000000');
                  } else {
                    updateCellStyle('cellTextColor', null);
                  }
                }}
                className="scale-75"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Input 
              type="color" 
              id="cellTextColor"
              value={cellStyles.cellTextColor || '#000000'}
              className="h-7 w-12 p-0.5 border"
              onChange={(e) => {
                if (cellStyles.cellTextColor) {
                  updateCellStyle('cellTextColor', e.target.value);
                }
              }}
              disabled={!cellStyles.cellTextColor}
            />
            <Input
              value={(cellStyles.cellTextColor || '#000000').toUpperCase()}
              className="h-7 font-mono text-[10px] flex-1"
              disabled
            />
          </div>
        </div>
        <div>
          <div className="flex justify-between mb-1">
            <Label className="text-[10px]">Background</Label>
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-muted-foreground">Apply</span>
              <Switch 
                checked={!!cellStyles.cellBackgroundColor}
                onCheckedChange={(checked) => {
                  if (checked) {
                    const colorInput = document.getElementById('cellBgColor') as HTMLInputElement;
                    updateCellStyle('cellBackgroundColor', colorInput?.value || '#FFFFFF');
                  } else {
                    updateCellStyle('cellBackgroundColor', null);
                  }
                }}
                className="scale-75"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Input 
              type="color" 
              id="cellBgColor"
              value={cellStyles.cellBackgroundColor || '#FFFFFF'}
              className="h-7 w-12 p-0.5 border"
              onChange={(e) => {
                if (cellStyles.cellBackgroundColor) {
                  updateCellStyle('cellBackgroundColor', e.target.value);
                }
              }}
              disabled={!cellStyles.cellBackgroundColor}
            />
            <Input
              value={(cellStyles.cellBackgroundColor || '#FFFFFF').toUpperCase()}
              className="h-7 font-mono text-[10px] flex-1"
              disabled
            />
          </div>
        </div>
      </div>
      
      {/* Alignment */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs mb-1 block">Horizontal</Label>
          <div className="grid grid-cols-3 gap-1">
            <Button 
              variant={cellStyles.cellTextAlign === 'left' ? 'secondary' : 'outline'}
              size="sm"
              className="h-7"
              onClick={() => updateCellStyle('cellTextAlign', 'left')}
            >
              <AlignLeft className="h-3 w-3" />
            </Button>
            <Button 
              variant={cellStyles.cellTextAlign === 'center' ? 'secondary' : 'outline'}
              size="sm"
              className="h-7"
              onClick={() => updateCellStyle('cellTextAlign', 'center')}
            >
              <AlignCenter className="h-3 w-3" />
            </Button>
            <Button 
              variant={cellStyles.cellTextAlign === 'right' ? 'secondary' : 'outline'}
              size="sm"
              className="h-7"
              onClick={() => updateCellStyle('cellTextAlign', 'right')}
            >
              <AlignRight className="h-3 w-3" />
            </Button>
          </div>
        </div>
        <div>
          <Label className="text-xs mb-1 block">Vertical</Label>
          <div className="grid grid-cols-3 gap-1">
            <Button 
              variant={cellStyles.cellVerticalAlign === 'top' ? 'secondary' : 'outline'}
              size="sm"
              className="h-7"
              onClick={() => updateCellStyle('cellVerticalAlign', 'top')}
            >
              <AlignStartVertical className="h-3 w-3" />
            </Button>
            <Button 
              variant={cellStyles.cellVerticalAlign === 'middle' ? 'secondary' : 'outline'}
              size="sm"
              className="h-7"
              onClick={() => updateCellStyle('cellVerticalAlign', 'middle')}
            >
              <AlignCenterVertical className="h-3 w-3" />
            </Button>
            <Button 
              variant={cellStyles.cellVerticalAlign === 'bottom' ? 'secondary' : 'outline'}
              size="sm"
              className="h-7"
              onClick={() => updateCellStyle('cellVerticalAlign', 'bottom')}
            >
              <AlignEndVertical className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Border Settings */}
      <div>
        <div className="flex justify-between mb-1.5">
          <Label className="text-xs">Borders</Label>
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-muted-foreground">Apply Borders</span>
            <Switch 
              checked={cellStyles.applyCellBorders}
              onCheckedChange={(checked) => updateCellStyle('applyCellBorders', checked)}
              className="scale-75"
            />
          </div>
        </div>
        
        <div className={`space-y-3 ${!cellStyles.applyCellBorders ? 'opacity-50' : ''}`}>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs mb-1 block">Style</Label>
              <Select 
                value={cellStyles.cellBorderStyle}
                onValueChange={(value) => updateCellStyle('cellBorderStyle', value)}
                disabled={!cellStyles.applyCellBorders}
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
              <Label className="text-xs mb-1 block">Width: {cellStyles.cellBorderWidth}</Label>
              <Slider
                value={[parseInt(cellStyles.cellBorderWidth)]}
                max={5}
                step={1}
                className="py-2"
                onValueChange={(value) => updateCellStyle('cellBorderWidth', `${value[0]}px`)}
                disabled={!cellStyles.applyCellBorders}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs mb-1 block">Color</Label>
              <div className="flex items-center gap-2">
                <Input 
                  type="color" 
                  value={cellStyles.cellBorderColor}
                  className="h-7 w-12 p-0.5 border"
                  onChange={(e) => updateCellStyle('cellBorderColor', e.target.value)}
                  disabled={!cellStyles.applyCellBorders}
                />
                <Input
                  value={cellStyles.cellBorderColor.toUpperCase()}
                  className="h-7 font-mono text-[10px] flex-1"
                  disabled
                />
              </div>
            </div>
            
            <div>
              <Label className="text-xs mb-1 block">Sides</Label>
              <Select 
                value={cellStyles.cellBorderSides}
                onValueChange={(value) => updateCellStyle('cellBorderSides', value)}
                disabled={!cellStyles.applyCellBorders}
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