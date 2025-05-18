import { useEffect } from 'react';

export function DebugToolbarProps({ toolbarProps }: { toolbarProps: any }) {
  useEffect(() => {
    console.log('=== DEBUG TOOLBAR PROPS ===');
    console.log('Toolbar props:', toolbarProps);
    console.log('Settings controller:', toolbarProps?.settingsController);
    console.log('Settings controller type:', typeof toolbarProps?.settingsController);
    console.log('Settings controller constructor:', toolbarProps?.settingsController?.constructor?.name);
    
    if (toolbarProps?.settingsController) {
      const proto = Object.getPrototypeOf(toolbarProps.settingsController);
      console.log('Settings controller prototype:', proto);
      console.log('Prototype methods:', Object.getOwnPropertyNames(proto));
      console.log('updateCustomSettings exists?', 'updateCustomSettings' in toolbarProps.settingsController);
      console.log('updateCustomSettings type:', typeof toolbarProps.settingsController.updateCustomSettings);
    }
    
    console.log('Grid API:', toolbarProps?.gridApi);
    console.log('Profile Manager:', toolbarProps?.profileManager);
  }, [toolbarProps]);
  
  return null;
}