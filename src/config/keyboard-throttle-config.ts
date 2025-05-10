/**
 * Configuration for keyboard throttling in ag-grid
 */
export const keyboardThrottleConfig = {
  /**
   * Keys to throttle
   */
  keys: [
    'Tab',
    'ArrowUp',
    'ArrowDown',
    'ArrowLeft',
    'ArrowRight',
    'Shift+ArrowUp',
    'Shift+ArrowDown',
    'Shift+ArrowLeft',
    'Shift+ArrowRight'
  ],

  /**
   * Maximum number of events to allow within the time window
   */
  maxEventsPerWindow: 5,

  /**
   * Time window in milliseconds
   */
  timeWindowMs: 500,

  /**
   * Minimum delay between events in milliseconds (for smoother navigation)
   * Lower values = faster navigation, higher values = smoother but slower navigation
   */
  minDelayBetweenEvents: 100,

  /**
   * Whether to enable the throttler
   */
  enabled: true,
};
