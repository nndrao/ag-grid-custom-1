import React, { useState } from 'react';
import { HeaderTab } from '../components/tabs/HeaderTab';
import { HeaderSettings } from '../types';

export function HeaderTabDemo() {
  const [settings, setSettings] = useState<HeaderSettings>({
    headerName: 'Column Name',
    fontFamily: 'default',
    fontSize: 'default',
    fontWeight: 'default',
    textStyle: [],
    textColor: '#000000',
    textColorEnabled: false,
    backgroundColor: '#ffffff',
    backgroundEnabled: false,
    borderStyle: 'solid',
    borderSides: 'all',
    borderWidth: 1,
    borderColor: '#cccccc',
    applyBorders: false,
    borderColorEnabled: false,
    verticalAlign: 'middle'
  });

  const handleSettingsChange = (newSettings: HeaderSettings) => {
    console.log('Settings changed:', newSettings);
    setSettings(newSettings);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Header Tab Demo</h1>
      
      <div className="mb-8">
        <HeaderTab
          settings={settings}
          onSettingsChange={handleSettingsChange}
          isModified={false}
          bulkUpdateMode={false}
        />
      </div>

      <div className="mt-8 p-4 bg-gray-100 rounded">
        <h2 className="text-lg font-semibold mb-2">Current Settings:</h2>
        <pre className="bg-white p-4 rounded border overflow-auto">
          {JSON.stringify(settings, null, 2)}
        </pre>
      </div>
    </div>
  );
}