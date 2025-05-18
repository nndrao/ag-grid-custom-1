import { SettingsController } from '@/services/settings-controller';

// Debug wrapper to trace method calls
export class SettingsControllerWrapper {
  private controller: SettingsController;
  
  constructor(controller: SettingsController) {
    this.controller = controller;
    console.log('SettingsControllerWrapper created');
    
    // Bind all methods
    const proto = Object.getPrototypeOf(controller);
    const methods = Object.getOwnPropertyNames(proto);
    
    methods.forEach(method => {
      if (typeof controller[method] === 'function' && method !== 'constructor') {
        this[method] = (...args: any[]) => {
          console.log(`SettingsControllerWrapper: Calling ${method}`, args);
          try {
            const result = controller[method].apply(controller, args);
            console.log(`SettingsControllerWrapper: ${method} succeeded`);
            return result;
          } catch (error) {
            console.error(`SettingsControllerWrapper: ${method} failed`, error);
            throw error;
          }
        };
      }
    });
  }
  
  // Explicit method definitions for TypeScript
  updateCustomSettings(settings: any): void {
    console.log('Wrapper: updateCustomSettings called', settings);
    this.controller.updateCustomSettings(settings);
  }
  
  getCurrentCustomSettings(): any {
    console.log('Wrapper: getCurrentCustomSettings called');
    return this.controller.getCurrentCustomSettings();
  }
  
  setGridApi(api: any): void {
    this.controller.setGridApi(api);
  }
  
  // Add other methods as needed
}