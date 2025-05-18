import React, { useState, useEffect } from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

interface EditorsTabProps {
  settings: any;
  onSettingsChange: (updates: Partial<EditorSettings>) => void;
  isModified?: boolean;
  bulkUpdateMode?: boolean;
}

interface EditorSettings {
  editorType: string;
  // Select Editor
  selectValueSource?: string;
  selectCsvValues?: string;
  selectJsonValues?: string;
  selectRestUrl?: string;
}

export function EditorsTab({ settings, onSettingsChange, isModified, bulkUpdateMode }: EditorsTabProps) {
  const [editorSettings, setEditorSettings] = useState<EditorSettings>({
    editorType: settings.editorType || 'none',
    selectValueSource: settings.selectValueSource || 'csv',
    selectCsvValues: settings.selectCsvValues || '',
    selectJsonValues: settings.selectJsonValues || '{"value":["Option 1","Option 2","Option 3"]}',
    selectRestUrl: settings.selectRestUrl || ''
  });

  useEffect(() => {
    setEditorSettings({
      editorType: settings.editorType || 'none',
      selectValueSource: settings.selectValueSource || 'csv',
      selectCsvValues: settings.selectCsvValues || '',
      selectJsonValues: settings.selectJsonValues || '{"value":["Option 1","Option 2","Option 3"]}',
      selectRestUrl: settings.selectRestUrl || ''
    });
  }, [settings]);

  const updateEditorSetting = (key: keyof EditorSettings, value: any) => {
    const newSettings = { ...editorSettings, [key]: value };
    setEditorSettings(newSettings);
    onSettingsChange({ [key]: value });
  };

  const parseSelectValues = () => {
    try {
      switch (editorSettings.selectValueSource) {
        case 'csv':
          return editorSettings.selectCsvValues
            .split(',')
            .map(v => v.trim())
            .filter(v => v);
        case 'json':
          const parsed = JSON.parse(editorSettings.selectJsonValues);
          return parsed.value || [];
        case 'rest':
          return ['[Values from REST API]'];
        default:
          return [];
      }
    } catch (e) {
      return ['[Invalid format]'];
    }
  };

  return (
    <div className="space-y-3">
      {/* Editor Type */}
      <div>
        <Label className="text-xs mb-1 block">Editor Type</Label>
        <Select 
          value={editorSettings.editorType}
          onValueChange={(value) => updateEditorSetting('editorType', value)}
        >
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            <SelectItem value="default">Default</SelectItem>
            <SelectItem value="text">Text</SelectItem>
            <SelectItem value="select">Select</SelectItem>
            <SelectItem value="date">Date</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Select Editor Options */}
      {editorSettings.editorType === 'select' && (
        <div className="space-y-3 pt-3 border-t">
          <h4 className="text-xs font-semibold">Select Editor Options</h4>
          
          <div>
            <Label className="text-xs mb-1 block">Value Source</Label>
            <Select 
              value={editorSettings.selectValueSource}
              onValueChange={(value) => updateEditorSetting('selectValueSource', value)}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">CSV</SelectItem>
                <SelectItem value="json">JSON</SelectItem>
                <SelectItem value="rest">REST</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* CSV Input */}
          {editorSettings.selectValueSource === 'csv' && (
            <div>
              <Label className="text-xs mb-1 block">CSV Values</Label>
              <Textarea
                placeholder="Option 1, Option 2, Option 3"
                value={editorSettings.selectCsvValues}
                onChange={(e) => updateEditorSetting('selectCsvValues', e.target.value)}
                className="text-xs h-16"
              />
            </div>
          )}

          {/* JSON Input */}
          {editorSettings.selectValueSource === 'json' && (
            <div>
              <Label className="text-xs mb-1 block">JSON Values</Label>
              <Textarea
                placeholder='{"value":["Option 1","Option 2","Option 3"]}'
                value={editorSettings.selectJsonValues}
                onChange={(e) => updateEditorSetting('selectJsonValues', e.target.value)}
                className="text-xs h-16 font-mono"
              />
            </div>
          )}

          {/* REST URL Input */}
          {editorSettings.selectValueSource === 'rest' && (
            <div>
              <Label className="text-xs mb-1 block">REST URL</Label>
              <Input
                type="text"
                placeholder="https://api.example.com/options"
                value={editorSettings.selectRestUrl}
                onChange={(e) => updateEditorSetting('selectRestUrl', e.target.value)}
                className="h-8 text-xs"
              />
              <p className="text-[10px] text-muted-foreground mt-1">
                Endpoint should return JSON with value array
              </p>
            </div>
          )}

          {/* Preview */}
          <div>
            <Label className="text-xs mb-1 block">Preview</Label>
            <div className="flex flex-wrap gap-1">
              {parseSelectValues().map((value, index) => (
                <Badge 
                  key={index} 
                  variant="secondary"
                  className="text-[10px] px-1.5 py-0.5"
                >
                  {value}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}