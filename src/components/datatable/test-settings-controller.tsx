import { useEffect, useState } from 'react';
import { SettingsController } from '@/services/settings-controller';
import { GridStateProvider } from '@/services/gridStateProvider';

// Test component to verify settings controller methods
export function TestSettingsController() {
  const [methodInfo, setMethodInfo] = useState<any>({});
  
  useEffect(() => {
    try {
      const gridStateProvider = new GridStateProvider();
      const settingsController = new SettingsController(gridStateProvider);
      
      // Get all methods on the settings controller
      const proto = Object.getPrototypeOf(settingsController);
      const methods = Object.getOwnPropertyNames(proto);
      
      // Check specific methods
      const hasUpdateCustomSettings = typeof settingsController.updateCustomSettings === 'function';
      const hasGetCurrentCustomSettings = typeof settingsController.getCurrentCustomSettings === 'function';
      
      // Try calling the method
      let canCallMethod = false;
      let errorMessage = '';
      try {
        settingsController.updateCustomSettings({ test: 'value' });
        canCallMethod = true;
      } catch (error: any) {
        canCallMethod = false;
        errorMessage = error.message;
      }
      
      setMethodInfo({
        methods,
        hasUpdateCustomSettings,
        hasGetCurrentCustomSettings,
        canCallMethod,
        errorMessage,
        controllerType: settingsController.constructor.name
      });
    } catch (error: any) {
      setMethodInfo({ error: error.message });
    }
  }, []);
  
  return (
    <div style={{ padding: '20px', backgroundColor: '#f0f0f0', margin: '10px' }}>
      <h3>Settings Controller Test</h3>
      <pre>{JSON.stringify(methodInfo, null, 2)}</pre>
    </div>
  );
}