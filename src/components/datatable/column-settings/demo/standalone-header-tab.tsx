import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { HeaderTab } from '../components/tabs/HeaderTab';
import { HeaderSettings } from '../types';

export function StandaloneHeaderTab() {
  const [settings, setSettings] = useState<HeaderSettings>({
    headerName: 'Sample Column',
    fontFamily: 'Arial',
    fontSize: '14px',
    fontWeight: 'normal',
    textStyle: [],
    textColor: '#000000',
    textColorEnabled: true,
    backgroundColor: '#f0f0f0',
    backgroundEnabled: true,
    borderStyle: 'solid',
    borderSides: 'all',
    borderWidth: 1,
    borderColor: '#999999',
    applyBorders: true,
    borderColorEnabled: true,
    verticalAlign: 'middle'
  });

  const [changeLog, setChangeLog] = useState<string[]>([]);

  const handleSettingsChange = (newSettings: HeaderSettings) => {
    console.log('Settings updating from:', settings, 'to:', newSettings);
    setSettings(newSettings);
    setChangeLog(prev => [...prev, `${new Date().toISOString()}: Updated settings`]);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Header Tab Standalone Demo</h1>
      
      <div className="grid grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Header Settings</h2>
          <HeaderTab
            settings={settings}
            onSettingsChange={handleSettingsChange}
            isModified={changeLog.length > 0}
            bulkUpdateMode={false}
          />
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Settings State</h3>
            <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto max-h-96">
              {JSON.stringify(settings, null, 2)}
            </pre>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Change Log</h3>
            <div className="space-y-1 text-sm">
              {changeLog.length === 0 ? (
                <p className="text-gray-500">No changes yet</p>
              ) : (
                changeLog.map((log, index) => (
                  <div key={index} className="text-gray-700">
                    {log}
                  </div>
                ))
              )}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Instructions</h3>
            <ul className="list-disc list-inside space-y-2 text-sm">
              <li>The preview section should update live as you change settings</li>
              <li>Try changing the header text to see it update in the preview</li>
              <li>Toggle text color and choose a new color - should appear immediately</li>
              <li>Toggle background color and select a color - should show in preview</li>
              <li>Change font family, size, and style buttons - all should reflect</li>
              <li>Toggle borders and adjust their settings - preview should update</li>
              <li>Check the console for debug logs</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}