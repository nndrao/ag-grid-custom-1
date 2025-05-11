/**
 * Configuration for keyboard event throttling
 * Controls how AG-Grid handles rapid key presses to prevent performance issues
 */
export const keyboardThrottleConfig = {
  /**
   * Keys to throttle (navigation, selection, and special keys)
   */
  keys: [
    'Tab',
    'ArrowUp',
    'ArrowDown',
    'ArrowLeft',
    'ArrowRight',
    'Home',
    'End',
    'PageUp',
    'PageDown',
    'Shift+ArrowUp', 
    'Shift+ArrowDown', 
    'Shift+ArrowLeft', 
    'Shift+ArrowRight'
  ],

  /**
   * Maximum number of events to allow per second
   * This throttles events at the DOM level to prevent overwhelming AG-Grid
   */
  eventsPerSecond: 12,

  /**
   * Whether to enable throttling (enabled by default)
   */
  enabled: true
};

/**
 * Configuration for rapid keypress behavior
 * Controls how rapid keypresses are handled for continuous navigation
 */
export const rapidKeypressConfig = {
  /**
   * Initial delay before rapid keypresses start (in milliseconds)
   * This delay gives a pause before continuous navigation kicks in
   */
  initialDelay: 250,

  /**
   * Initial interval between rapid keypresses (in milliseconds)
   * Sets how fast the first few repeated keypresses will be
   */
  rapidInterval: 60,

  /**
   * Rate at which interval decreases (acceleration)
   * Values < 1 make navigation speed up over time (e.g., 0.95 = 5% faster each time)
   */
  accelerationRate: 0.95,

  /**
   * Minimum interval between keypresses (in milliseconds)
   * Sets a minimum speed limit to prevent too-fast navigation
   */
  minInterval: 15,

  /**
   * Keys that support rapid keypress behavior
   */
  enabledKeys: [
    'ArrowUp',
    'ArrowDown',
    'ArrowLeft',
    'ArrowRight',
    'Tab',
    'Home',
    'End',
    'PageUp',
    'PageDown'
  ]
};
