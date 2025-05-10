import { useEffect, useRef } from 'react';

interface KeyboardThrottlerOptions {
  /**
   * Keys to throttle (e.g., 'Tab', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight')
   */
  keys: string[];

  /**
   * Maximum number of events to allow within the time window
   */
  maxEventsPerWindow: number;

  /**
   * Time window in milliseconds
   */
  timeWindowMs: number;

  /**
   * Target element to attach the event listener to (defaults to document)
   */
  targetElement?: HTMLElement | null;

  /**
   * Whether to enable the throttler (defaults to true)
   */
  enabled?: boolean;

  /**
   * Minimum delay between events in milliseconds (for smoother navigation)
   */
  minDelayBetweenEvents?: number;
}

/**
 * Hook to throttle keyboard events at the DOM level
 * Useful for preventing ag-grid from being overwhelmed by rapid key presses
 */
export function useKeyboardThrottler({
  keys,
  maxEventsPerWindow = 5,
  timeWindowMs = 500,
  targetElement,
  enabled = true,
  minDelayBetweenEvents = 100, // Minimum delay between events for smooth navigation
}: KeyboardThrottlerOptions) {
  // Track key press timestamps for each key
  const keyPressTimestamps = useRef<Record<string, number[]>>({});

  // Track last processed event time for each key
  const lastProcessedTime = useRef<Record<string, number>>({});

  // Track if a key is being held down
  const keyHeldDown = useRef<Record<string, boolean>>({});

  // Initialize timestamps for each key
  useEffect(() => {
    keys.forEach(key => {
      keyPressTimestamps.current[key] = [];
    });
  }, [keys]);

  useEffect(() => {
    if (!enabled) return;

    const target = targetElement || document;

    // Handle key up events to track when keys are released
    const handleKeyUp = (event: KeyboardEvent) => {
      const key = event.key;

      // Handle Shift+Arrow key combinations
      const effectiveKey = event.shiftKey &&
        (key === 'ArrowUp' || key === 'ArrowDown' || key === 'ArrowLeft' || key === 'ArrowRight')
        ? `Shift+${key}`
        : key;

      if (!keys.includes(effectiveKey) && !keys.includes(key)) {
        return;
      }

      // Mark key as no longer held down
      if (keys.includes(effectiveKey)) {
        keyHeldDown.current[effectiveKey] = false;
      } else {
        keyHeldDown.current[key] = false;
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      // Check if this is a key we want to throttle
      const key = event.key;

      // Handle Shift+Arrow key combinations
      const effectiveKey = event.shiftKey &&
        (key === 'ArrowUp' || key === 'ArrowDown' || key === 'ArrowLeft' || key === 'ArrowRight')
        ? `Shift+${key}`
        : key;

      if (!keys.includes(effectiveKey) && !keys.includes(key)) {
        return;
      }

      const now = Date.now();
      const timestamps = keyPressTimestamps.current[effectiveKey] ||
                         keyPressTimestamps.current[key] ||
                         [];

      // Filter out timestamps outside the current time window
      const recentTimestamps = timestamps.filter(
        timestamp => now - timestamp < timeWindowMs
      );

      // If we've reached the maximum number of events in the time window, prevent default
      if (recentTimestamps.length >= maxEventsPerWindow) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }

      // Add the current timestamp
      recentTimestamps.push(now);

      // Update the timestamps for this key
      if (keys.includes(effectiveKey)) {
        keyPressTimestamps.current[effectiveKey] = recentTimestamps;
      } else {
        keyPressTimestamps.current[key] = recentTimestamps;
      }
    };

    // Add the event listener
    target.addEventListener('keydown', handleKeyDown, { capture: true });
    target.addEventListener('keyup', handleKeyUp, { capture: true });

    // Clean up
    return () => {
      target.removeEventListener('keydown', handleKeyDown, { capture: true });
      target.removeEventListener('keyup', handleKeyUp, { capture: true });
    };
  }, [keys, maxEventsPerWindow, timeWindowMs, targetElement, enabled]);
}
