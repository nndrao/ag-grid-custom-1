import React from 'react';
import { SettingsDialogBase } from './settings-dialog-base';
import { GridApi } from 'ag-grid-community';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { useEffect, useState } from 'react';

interface ColumnSettingsProps {
  settings?: any;
  onChange?: (key: string, value: any) => void;
}

/**
 * Column configuration settings form
 */
const ColumnSettingsForm = ({ settings, onChange }: ColumnSettingsProps) => {
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="autoSizeColumns">Auto-size columns</Label>
          <div className="flex items-center space-x-2">
            <Switch
              id="autoSizeColumns"
              checked={settings.autoSizeColumns}
              onCheckedChange={(checked) => onChange?.('autoSizeColumns', checked)}
            />
            <Label htmlFor="autoSizeColumns">Enabled</Label>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="defaultWidth">Default column width</Label>
          <Input
            id="defaultWidth"
            type="number"
            min={20}
            max={1000}
            value={settings.defaultWidth || 200}
            onChange={(e) => onChange?.('defaultWidth', parseInt(e.target.value))}
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="resizable">Allow column resizing</Label>
        <div className="flex items-center space-x-2">
          <Switch
            id="resizable"
            checked={settings.resizable}
            onCheckedChange={(checked) => onChange?.('resizable', checked)}
          />
          <Label htmlFor="resizable">Enabled</Label>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="sortable">Allow column sorting</Label>
        <div className="flex items-center space-x-2">
          <Switch
            id="sortable"
            checked={settings.sortable}
            onCheckedChange={(checked) => onChange?.('sortable', checked)}
          />
          <Label htmlFor="sortable">Enabled</Label>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="movable">Allow column reordering</Label>
        <div className="flex items-center space-x-2">
          <Switch
            id="movable"
            checked={settings.movable}
            onCheckedChange={(checked) => onChange?.('movable', checked)}
          />
          <Label htmlFor="movable">Enabled</Label>
        </div>
      </div>
    </>
  );
};

interface ColumnSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  gridApi: GridApi | null;
}

/**
 * Column settings dialog component
 */
export function ColumnSettingsDialog({
  open,
  onOpenChange,
  gridApi
}: ColumnSettingsDialogProps) {
  // Extract current column state when dialog opens
  useEffect(() => {
    if (open && gridApi) {
      // If needed, you could extract actual column state here
      // and update the SettingsStore directly
    }
  }, [open, gridApi]);

  return (
    <SettingsDialogBase
      open={open}
      onOpenChange={onOpenChange}
      title="Column Settings"
      description="Configure column behavior and appearance"
      category="column"
    >
      <ColumnSettingsForm />
    </SettingsDialogBase>
  );
} 