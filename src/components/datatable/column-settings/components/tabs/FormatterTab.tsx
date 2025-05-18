import React, { useState, useEffect } from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { INPUT_CLASSES, SELECT_CLASSES, FORM_LAYOUT } from '../../style-utils';

interface FormatterTabProps {
  settings: any;
  onSettingsChange: (updates: Partial<FormatterSettings>) => void;
  isModified?: boolean;
  bulkUpdateMode?: boolean;
}

interface FormatterSettings {
  formatterType: string;
  decimalPrecision?: number;
  dateFormat?: string;
  currencySymbol?: string;
  currencyDecimalPlaces?: number;
  symbolPosition?: string;
  percentDecimalPlaces?: number;
  customFormat?: string;
  previewValue?: string;
}

const CUSTOM_FORMAT_EXAMPLES = [
  {
    name: "Color & Conditionals",
    format: '[>0][Green]"$"#,##0.00;[<0][Red]"$"#,##0.00;$0.00',
    description: "Green for positive, red for negative"
  },
  {
    name: "Status Indicators",
    format: '[=1][Green]"✓";[=0][Red]"✗";"N/A"',
    description: "Checkmark/X for boolean values"
  },
  {
    name: "Score Ranges",
    format: '[>=90][#00B800]0"%";[>=70][#007C00]0"%";[#FF0000]0"%"',
    description: "Color-coded percentage ranges"
  },
  {
    name: "KPI Indicators",
    format: '[>100][Green]"✓ Above Target";[=100][Blue]"= On Target";[Red]"✗ Below Target"',
    description: "Target achievement indicators"
  },
  {
    name: "Simple Heatmap",
    format: '[>0.7][#009900]0"%";[>0.3][#FFCC00]0"%";[#FF0000]0"%"',
    description: "Red-yellow-green heatmap for percentages"
  },
  {
    name: "Text with Values",
    format: '{value} units',
    description: "Append text to values"
  },
  {
    name: "Currency with Suffix",
    format: '"$"#,##0.00" USD"',
    description: "Currency with unit suffix"
  },
  {
    name: "Conditional Prefix",
    format: '[>0]"Profit: ";[<0]"Loss: ";"Break-even"',
    description: "Context-aware prefixes"
  }
];

export function FormatterTab({ settings, onSettingsChange, isModified, bulkUpdateMode }: FormatterTabProps) {
  const [formatterSettings, setFormatterSettings] = useState<FormatterSettings>({
    formatterType: settings.formatterType || 'none',
    decimalPrecision: settings.decimalPrecision || 2,
    dateFormat: settings.dateFormat || 'MM/DD/YYYY',
    currencySymbol: settings.currencySymbol || '$',
    currencyDecimalPlaces: settings.currencyDecimalPlaces || 2,
    symbolPosition: settings.symbolPosition || 'before',
    percentDecimalPlaces: settings.percentDecimalPlaces || 1,
    customFormat: settings.customFormat || '',
    previewValue: settings.previewValue || '123.45'
  });

  useEffect(() => {
    setFormatterSettings({
      formatterType: settings.formatterType || 'none',
      decimalPrecision: settings.decimalPrecision || 2,
      dateFormat: settings.dateFormat || 'MM/DD/YYYY',
      currencySymbol: settings.currencySymbol || '$',
      currencyDecimalPlaces: settings.currencyDecimalPlaces || 2,
      symbolPosition: settings.symbolPosition || 'before',
      percentDecimalPlaces: settings.percentDecimalPlaces || 1,
      customFormat: settings.customFormat || '',
      previewValue: settings.previewValue || '123.45'
    });
  }, [settings]);

  const updateFormatterSetting = (key: keyof FormatterSettings, value: any) => {
    const newSettings = { ...formatterSettings, [key]: value };
    setFormatterSettings(newSettings);
    onSettingsChange({ [key]: value });
  };

  const formatPreview = () => {
    const value = parseFloat(formatterSettings.previewValue || "0");
    
    switch (formatterSettings.formatterType) {
      case 'number':
        return value.toFixed(formatterSettings.decimalPrecision);
      case 'date':
        const date = new Date();
        // Simple date format preview
        return formatterSettings.dateFormat
          .replace('MM', String(date.getMonth() + 1).padStart(2, '0'))
          .replace('DD', String(date.getDate()).padStart(2, '0'))
          .replace('YYYY', String(date.getFullYear()))
          .replace('MMM', date.toLocaleString('default', { month: 'short' }));
      case 'currency':
        const formatted = value.toFixed(formatterSettings.currencyDecimalPlaces);
        return formatterSettings.symbolPosition === 'before' 
          ? `${formatterSettings.currencySymbol}${formatted}`
          : `${formatted}${formatterSettings.currencySymbol}`;
      case 'percent':
        return `${value.toFixed(formatterSettings.percentDecimalPlaces)}%`;
      case 'custom':
        // Simple custom format preview
        return formatterSettings.customFormat.replace('{value}', value.toString());
      default:
        return formatterSettings.previewValue;
    }
  };

  return (
    <div className="space-y-4">
      {/* Formatter Type */}
      <div className={FORM_LAYOUT.field}>
        <Label className={FORM_LAYOUT.label}>Formatter Type</Label>
        <Select 
          value={formatterSettings.formatterType}
          onValueChange={(value) => updateFormatterSetting('formatterType', value)}
        >
          <SelectTrigger className={SELECT_CLASSES}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            <SelectItem value="number">Number</SelectItem>
            <SelectItem value="date">Date</SelectItem>
            <SelectItem value="currency">Currency</SelectItem>
            <SelectItem value="percent">Percent</SelectItem>
            <SelectItem value="custom">Custom</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Number Options */}
      {formatterSettings.formatterType === 'number' && (
        <div className={FORM_LAYOUT.field}>
          <Label className={FORM_LAYOUT.label}>Decimal Precision</Label>
          <Input
            type="number"
            min="0"
            max="10"
            value={formatterSettings.decimalPrecision}
            onChange={(e) => updateFormatterSetting('decimalPrecision', parseInt(e.target.value) || 0)}
            className={INPUT_CLASSES}
          />
        </div>
      )}

      {/* Date Options */}
      {formatterSettings.formatterType === 'date' && (
        <div className={FORM_LAYOUT.field}>
          <Label className={FORM_LAYOUT.label}>Format</Label>
          <Select 
            value={formatterSettings.dateFormat}
            onValueChange={(value) => updateFormatterSetting('dateFormat', value)}
          >
            <SelectTrigger className={SELECT_CLASSES}>
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

      {/* Currency Options */}
      {formatterSettings.formatterType === 'currency' && (
        <>
          <div className={FORM_LAYOUT.grid2}>
            <div className={FORM_LAYOUT.field}>
              <Label className={FORM_LAYOUT.label}>Symbol</Label>
              <Select 
                value={formatterSettings.currencySymbol}
                onValueChange={(value) => updateFormatterSetting('currencySymbol', value)}
              >
                <SelectTrigger className={SELECT_CLASSES}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="$">$ (Dollar)</SelectItem>
                  <SelectItem value="€">€ (Euro)</SelectItem>
                  <SelectItem value="£">£ (Pound)</SelectItem>
                  <SelectItem value="¥">¥ (Yen)</SelectItem>
                  <SelectItem value="₹">₹ (Rupee)</SelectItem>
                  <SelectItem value="₽">₽ (Ruble)</SelectItem>
                  <SelectItem value="R$">R$ (Real)</SelectItem>
                  <SelectItem value="kr">kr (Krona)</SelectItem>
                  <SelectItem value="฿">฿ (Baht)</SelectItem>
                  <SelectItem value="₩">₩ (Won)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className={FORM_LAYOUT.field}>
              <Label className={FORM_LAYOUT.label}>Decimal Places</Label>
              <Input
                type="number"
                min="0"
                max="10"
                value={formatterSettings.currencyDecimalPlaces}
                onChange={(e) => updateFormatterSetting('currencyDecimalPlaces', parseInt(e.target.value) || 0)}
                className={INPUT_CLASSES}
              />
            </div>
          </div>
          <div className={FORM_LAYOUT.field}>
            <Label className={FORM_LAYOUT.label}>Symbol Position</Label>
            <Select 
              value={formatterSettings.symbolPosition}
              onValueChange={(value) => updateFormatterSetting('symbolPosition', value)}
            >
              <SelectTrigger className={SELECT_CLASSES}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="before">Before ($100)</SelectItem>
                <SelectItem value="after">After (100$)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </>
      )}

      {/* Percent Options */}
      {formatterSettings.formatterType === 'percent' && (
        <div className={FORM_LAYOUT.field}>
          <Label className={FORM_LAYOUT.label}>Decimal Places</Label>
          <Input
            type="number"
            min="0"
            max="10"
            value={formatterSettings.percentDecimalPlaces}
            onChange={(e) => updateFormatterSetting('percentDecimalPlaces', parseInt(e.target.value) || 0)}
            className={INPUT_CLASSES}
          />
        </div>
      )}

      {/* Custom Format */}
      {formatterSettings.formatterType === 'custom' && (
        <div className="space-y-4">
          <Tabs defaultValue="format" className="w-full">
            <TabsList className="w-full grid grid-cols-2 h-9">
              <TabsTrigger 
                value="format" 
                className={`text-xs h-8`}
              >
                Format
              </TabsTrigger>
              <TabsTrigger 
                value="examples" 
                className={`text-xs h-8`}
              >
                Examples
              </TabsTrigger>
            </TabsList>
            <TabsContent value="format" className="space-y-4 mt-3">
              <div className={FORM_LAYOUT.field}>
                <Label className={FORM_LAYOUT.label}>Format String</Label>
                <Textarea
                  placeholder="Enter custom format (e.g., {value} units)"
                  value={formatterSettings.customFormat}
                  onChange={(e) => updateFormatterSetting('customFormat', e.target.value)}
                  className="text-xs min-h-16"
                />
              </div>
              <div className={FORM_LAYOUT.field}>
                <Label className={FORM_LAYOUT.label}>Preview Value</Label>
                <Input
                  type="text"
                  value={formatterSettings.previewValue}
                  onChange={(e) => updateFormatterSetting('previewValue', e.target.value)}
                  className={INPUT_CLASSES}
                />
              </div>
              <div className={FORM_LAYOUT.field}>
                <Label className={FORM_LAYOUT.label}>Preview</Label>
                <div className="p-2 border rounded bg-muted text-xs min-h-8 flex items-center">
                  {formatPreview()}
                </div>
              </div>
            </TabsContent>
            <TabsContent value="examples" className="mt-3">
              <div className="space-y-2 max-h-[250px] overflow-y-auto">
                {CUSTOM_FORMAT_EXAMPLES.map((example, index) => (
                  <div 
                    key={index}
                    className="p-2 border rounded hover:bg-secondary cursor-pointer text-xs"
                    onClick={() => updateFormatterSetting('customFormat', example.format)}
                  >
                    <div className="font-semibold">{example.name}</div>
                    <div className="text-[10px] text-muted-foreground">{example.description}</div>
                    <code className="text-[10px] bg-muted px-1 py-0.5 rounded">
                      {example.format}
                    </code>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}

      {/* Preview for non-custom formats */}
      {formatterSettings.formatterType !== 'custom' && formatterSettings.formatterType !== 'none' && (
        <div className="pt-2">
          <Label className={FORM_LAYOUT.label}>Preview</Label>
          <div className={FORM_LAYOUT.grid2}>
            <div>
              <Input
                type="text"
                value={formatterSettings.previewValue}
                onChange={(e) => updateFormatterSetting('previewValue', e.target.value)}
                placeholder="Enter value to preview"
                className={INPUT_CLASSES}
              />
            </div>
            <div className="p-2 border rounded bg-muted text-xs min-h-8 flex items-center">
              {formatPreview()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}