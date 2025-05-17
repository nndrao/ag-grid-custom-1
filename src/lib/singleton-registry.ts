/**
 * Registry for managing singleton instances
 * Provides better lifecycle control and testability
 */
export class SingletonRegistry {
  private static instances = new Map<string, any>();
  
  /**
   * Register or get a singleton instance
   */
  static getInstance<T>(
    key: string,
    factory: () => T,
    options?: { reset?: boolean }
  ): T {
    if (options?.reset || !this.instances.has(key)) {
      const instance = factory();
      this.instances.set(key, instance);
      return instance;
    }
    
    return this.instances.get(key) as T;
  }
  
  /**
   * Clear a specific singleton instance
   */
  static clearInstance(key: string): void {
    this.instances.delete(key);
  }
  
  /**
   * Clear all singleton instances
   */
  static clearAll(): void {
    this.instances.clear();
  }
  
  /**
   * Check if an instance exists
   */
  static hasInstance(key: string): boolean {
    return this.instances.has(key);
  }
  
  /**
   * Get all registered keys
   */
  static getKeys(): string[] {
    return Array.from(this.instances.keys());
  }
}