import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SettingsStore, SettingsCategory } from '@/stores/settings-store';

interface SettingsDialogBaseProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  category: SettingsCategory;
  children: React.ReactNode;
}

/**
 * Base component for all settings dialogs
 * Handles common functionality like loading/saving settings
 */
export function SettingsDialogBase({
  open,
  onOpenChange,
  title,
  description,
  category,
  children
}: SettingsDialogBaseProps) {
  const [settings, setSettings] = useState<any>({});
  const [hasChanges, setHasChanges] = useState(false);
  const settingsStore = SettingsStore.getInstance();
  
  // Load settings when dialog opens
  useEffect(() => {
    if (open) {
      const currentSettings = settingsStore.getSettings(category);
      setSettings(currentSettings);
      setHasChanges(false);
    }
  }, [open, category]);

  // Handle settings change
  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => {
      const updated = { ...prev, [key]: value };
      setHasChanges(true);
      return updated;
    });
  };

  // Apply settings and close dialog
  const handleApply = () => {
    settingsStore.updateSettings(category, settings);
    setHasChanges(false);
    onOpenChange(false);
  };

  // Reset settings to initial values
  const handleReset = () => {
    const currentSettings = settingsStore.getSettings(category);
    setSettings(currentSettings);
    setHasChanges(false);
  };

  // Context for child components
  const settingsContext = {
    settings,
    handleSettingChange
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </DialogHeader>
        
        <ScrollArea className="flex-1 p-4">
          <div className="grid gap-4">
            {/* Pass context to children */}
            {React.Children.map(children, child => {
              if (React.isValidElement(child)) {
                return React.cloneElement(child, { 
                  settings, 
                  onChange: handleSettingChange 
                });
              }
              return child;
            })}
          </div>
        </ScrollArea>
        
        <DialogFooter className="flex justify-between">
          <div>
            <Button
              variant="outline"
              onClick={handleReset}
              disabled={!hasChanges}
            >
              Reset
            </Button>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={handleApply}
              disabled={!hasChanges}
            >
              Apply
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 