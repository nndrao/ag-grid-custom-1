export class PerformanceTracker {
  private static instance: PerformanceTracker;
  private metrics: Map<string, number[]> = new Map();
  private activeOperations: Map<string, number> = new Map();
  
  static getInstance(): PerformanceTracker {
    if (!this.instance) {
      this.instance = new PerformanceTracker();
    }
    return this.instance;
  }
  
  // Start tracking an operation
  startOperation(name: string): void {
    this.activeOperations.set(name, performance.now());
  }
  
  // End tracking and record the duration
  endOperation(name: string): number {
    const startTime = this.activeOperations.get(name);
    if (!startTime) {
      console.warn(`No start time found for operation: ${name}`);
      return 0;
    }
    
    const duration = performance.now() - startTime;
    this.activeOperations.delete(name);
    
    // Record the metric
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    this.metrics.get(name)!.push(duration);
    
    // Keep only last 100 measurements
    const measurements = this.metrics.get(name)!;
    if (measurements.length > 100) {
      measurements.shift();
    }
    
    return duration;
  }
  
  // Get statistics for an operation
  getStats(name: string): {
    count: number;
    average: number;
    min: number;
    max: number;
    last: number;
  } | null {
    const measurements = this.metrics.get(name);
    if (!measurements || measurements.length === 0) {
      return null;
    }
    
    const sum = measurements.reduce((a, b) => a + b, 0);
    return {
      count: measurements.length,
      average: sum / measurements.length,
      min: Math.min(...measurements),
      max: Math.max(...measurements),
      last: measurements[measurements.length - 1]
    };
  }
  
  // Get comparison between two operations
  compare(operation1: string, operation2: string): {
    improvement: number;
    percentageFaster: number;
  } | null {
    const stats1 = this.getStats(operation1);
    const stats2 = this.getStats(operation2);
    
    if (!stats1 || !stats2) {
      return null;
    }
    
    const improvement = stats2.average - stats1.average;
    const percentageFaster = ((stats2.average - stats1.average) / stats2.average) * 100;
    
    return {
      improvement,
      percentageFaster
    };
  }
  
  // Clear all metrics
  clear(): void {
    this.metrics.clear();
    this.activeOperations.clear();
  }
  
  // Export metrics as JSON
  exportMetrics(): Record<string, any> {
    const result: Record<string, any> = {};
    
    this.metrics.forEach((measurements, name) => {
      result[name] = this.getStats(name);
    });
    
    return result;
  }
  
  // Log performance report
  logReport(): void {
    console.group('Performance Report');
    
    this.metrics.forEach((measurements, name) => {
      const stats = this.getStats(name);
      if (stats) {
        console.log(`${name}:`, {
          count: stats.count,
          average: `${stats.average.toFixed(2)}ms`,
          min: `${stats.min.toFixed(2)}ms`,
          max: `${stats.max.toFixed(2)}ms`,
          last: `${stats.last.toFixed(2)}ms`
        });
      }
    });
    
    console.groupEnd();
  }
}

// Convenience functions
export const perfTracker = PerformanceTracker.getInstance();

export function trackOperation<T>(
  name: string,
  operation: () => T | Promise<T>
): T | Promise<T> {
  perfTracker.startOperation(name);
  
  const result = operation();
  
  if (result instanceof Promise) {
    return result.finally(() => {
      const duration = perfTracker.endOperation(name);
      console.debug(`${name} completed in ${duration.toFixed(2)}ms`);
    });
  } else {
    const duration = perfTracker.endOperation(name);
    console.debug(`${name} completed in ${duration.toFixed(2)}ms`);
    return result;
  }
}

// React hook for performance tracking
import { useCallback } from 'react';

export function usePerformanceTracking() {
  const track = useCallback((name: string, operation: () => void | Promise<void>) => {
    return trackOperation(name, operation);
  }, []);
  
  const getReport = useCallback(() => {
    return perfTracker.exportMetrics();
  }, []);
  
  const logReport = useCallback(() => {
    perfTracker.logReport();
  }, []);
  
  return { track, getReport, logReport };
}