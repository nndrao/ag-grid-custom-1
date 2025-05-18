import { useEffect } from 'react';
import { SettingsController } from '@/services/settings-controller';
import { GridStateProvider } from '@/services/gridStateProvider';

export function TestUpdateCustomSettings() {
  useEffect(() => {
    try {
      console.log('=== Testing SettingsController Directly ===');
      
      // Create a new instance
      const gridStateProvider = new GridStateProvider();
      const settingsController = new SettingsController(gridStateProvider);
      
      console.log('Controller created:', settingsController);
      console.log('Constructor name:', settingsController.constructor.name);
      
      // Check the prototype chain
      const proto = Object.getPrototypeOf(settingsController);
      console.log('Prototype:', proto);
      console.log('Prototype methods:', Object.getOwnPropertyNames(proto));
      
      // Check if method exists
      console.log('updateCustomSettings exists?', 'updateCustomSettings' in settingsController);
      console.log('updateCustomSettings type:', typeof settingsController.updateCustomSettings);
      
      // Try to call it
      if (typeof settingsController.updateCustomSettings === 'function') {
        console.log('Calling updateCustomSettings...');
        settingsController.updateCustomSettings({ test: 'data' });
        console.log('Success!');
      } else {
        console.error('updateCustomSettings is not a function');
      }
      
      // Check other methods
      console.log('getCurrentCustomSettings exists?', typeof settingsController.getCurrentCustomSettings === 'function');
      console.log('setGridApi exists?', typeof settingsController.setGridApi === 'function');
      console.log('updateGridOptions exists?', typeof settingsController.updateGridOptions === 'function');
      
    } catch (error) {
      console.error('Test error:', error);
    }
  }, []);
  
  return (
    <div style={{ padding: '20px', border: '2px solid red', margin: '10px' }}>
      <h3>Update Custom Settings Test (Check Console)</h3>
    </div>
  );
}