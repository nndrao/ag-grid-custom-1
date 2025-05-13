import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

interface AdvancedFeaturesProps {
  settings: {
    enableCharts?: boolean;
    masterDetail?: boolean;
    treeData?: boolean;
    getDataPath?: string;
    getRowNodeId?: string;
  };
  onChange: (option: string, value: any) => void;
  initialProperties?: string[];
}

export function AdvancedFeatures({ settings, onChange }: AdvancedFeaturesProps) {
  const [localSettings, setLocalSettings] = useState(settings);
  
  // Update local state when settings prop changes
  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  // Handler for checkbox options
  const handleCheckboxChange = (option: string, checked: boolean) => {
    setLocalSettings(prev => ({ ...prev, [option]: checked }));
    onChange(option, checked);
  };

  // Handler for text inputs (for functions stored as strings)
  const handleTextChange = (option: string, value: string) => {
    setLocalSettings(prev => ({ ...prev, [option]: value }));
    onChange(option, value);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Enterprise Features</CardTitle>
          <CardDescription>
            Advanced features available with AG Grid Enterprise.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="enableCharts" 
              checked={!!localSettings.enableCharts}
              onCheckedChange={(checked) => handleCheckboxChange('enableCharts', !!checked)} 
            />
            <Label htmlFor="enableCharts" className="font-normal">
              Enable integrated charts (Enterprise)
            </Label>
            <p className="text-xs text-muted-foreground ml-6">
              Allows creating charts from grid data.
            </p>
          </div>
          
          <div className="flex items-center space-x-2 pt-2">
            <Checkbox 
              id="masterDetail" 
              checked={!!localSettings.masterDetail}
              onCheckedChange={(checked) => handleCheckboxChange('masterDetail', !!checked)} 
            />
            <Label htmlFor="masterDetail" className="font-normal">
              Enable master-detail view (Enterprise)
            </Label>
            <p className="text-xs text-muted-foreground ml-6">
              Allows expanding rows to show detailed information.
            </p>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Tree Data</CardTitle>
          <CardDescription>
            Configure hierarchical data display.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="treeData" 
              checked={!!localSettings.treeData}
              onCheckedChange={(checked) => handleCheckboxChange('treeData', !!checked)} 
            />
            <Label htmlFor="treeData" className="font-normal">
              Enable tree data structure
            </Label>
            <p className="text-xs text-muted-foreground ml-6">
              Indicates that row data contains a tree structure.
            </p>
          </div>
          
          <div className="space-y-2 pt-3">
            <Label htmlFor="getDataPath">Get Data Path Function</Label>
            <Textarea
              id="getDataPath"
              value={localSettings.getDataPath || ''}
              onChange={(e) => handleTextChange('getDataPath', e.target.value)}
              placeholder="(data) => data.treePath"
              rows={3}
              disabled={!localSettings.treeData}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Function to determine hierarchy in tree data.
            </p>
          </div>
          
          <div className="space-y-2 pt-3">
            <Label htmlFor="getRowNodeId">Get Row Node ID Function</Label>
            <Textarea
              id="getRowNodeId"
              value={localSettings.getRowNodeId || ''}
              onChange={(e) => handleTextChange('getRowNodeId', e.target.value)}
              placeholder="(data) => data.id"
              rows={3}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Function to get unique IDs for row nodes.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 