import { useRef, useCallback, useState, useEffect } from 'react';

/**
 * Hook to create a debounced function
 * @param callback The function to debounce
 * @param delay The delay in milliseconds
 * @returns The debounced function
 */
export function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const debouncedFunction = useCallback((...args: Parameters<T>) => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      callback(...args);
      timeoutRef.current = null;
    }, delay);
  }, [callback, delay]);
  
  // Cleanup on unmount
  useRef(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  });
  
  return debouncedFunction;
}

/**
 * Hook that returns a debounced value
 * @param value The value to debounce
 * @param delay The delay in milliseconds
 * @returns The debounced value
 */
export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  
  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => {
      clearTimeout(timeout);
    };
  }, [value, delay]);
  
  return debouncedValue;
}