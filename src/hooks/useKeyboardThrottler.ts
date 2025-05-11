import { useEffect, useRef } from 'react';

interface KeyboardThrottlerOptions {
  /**
   * Keys to throttle (e.g., 'Tab', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight')
   */
  keys: string[];

  /**
   * Maximum number of events to allow per second (defaults to 8)
   */
  eventsPerSecond?: number;

  /**
   * Target element to attach the event listener to (defaults to document)
   */
  targetElement?: HTMLElement | null;

  /**
   * Whether to enable the throttler (defaults to true)
   */
  enabled?: boolean;
}

/**
 * Hook to throttle keyboard events at the DOM level
 * Useful for preventing ag-grid from being overwhelmed by rapid key presses
 */
export function useKeyboardThrottler({
  keys,
  eventsPerSecond = 8,
  targetElement,
  enabled = true,
}: KeyboardThrottlerOptions) {
  // Track last processed time for each key
  const lastProcessedTime = useRef<Record<string, number>>({});
  
  // Calculate minimum time between events in ms based on events per second
  const minTimeBetweenEvents = useRef(Math.floor(1000 / eventsPerSecond));

  useEffect(() => {
    if (!enabled) return;

    const target = targetElement || document;

    const handleKeyDown = (event: Event) => {
      const keyEvent = event as KeyboardEvent;
      const key = keyEvent.key;

      // Handle Shift+Arrow key combinations
      const effectiveKey = keyEvent.shiftKey &&
        (key === 'ArrowUp' || key === 'ArrowDown' || key === 'ArrowLeft' || key === 'ArrowRight')
        ? `Shift+${key}`
        : key;

      const keyToTrack = keys.includes(effectiveKey) ? effectiveKey : key;
      
      if (!keys.includes(keyToTrack)) {
        return;
      }

      const now = Date.now();
      const lastTime = lastProcessedTime.current[keyToTrack] || 0;
      
      // If not enough time has passed since the last event for this key, prevent default
      if (now - lastTime < minTimeBetweenEvents.current) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      
      // Update the last processed time for this key
      lastProcessedTime.current[keyToTrack] = now;
    };

    // Add the event listener
    target.addEventListener('keydown', handleKeyDown, { capture: true });

    // Clean up
    return () => {
      target.removeEventListener('keydown', handleKeyDown, { capture: true });
    };
  }, [keys, eventsPerSecond, targetElement, enabled]);
}
