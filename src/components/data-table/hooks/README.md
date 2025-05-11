# Keyboard Throttler for AG-Grid

## Overview

The `useKeyboardThrottler` hook provides a solution for throttling keyboard events at the DOM level before they reach the AG-Grid component. This is particularly useful when users hold down navigation keys (Tab, Arrow keys, Shift+Arrow combinations), which can overwhelm AG-Grid with too many events and cause performance issues.

## How It Works

1. The hook adds global event listeners for keydown and keyup events at the capture phase
2. When a monitored key is pressed, it tracks the timestamp of the event
3. If too many events occur within a specified time window, subsequent events are blocked
4. This creates a throttling effect that limits the rate of keyboard events reaching AG-Grid

## Configuration

The throttler behavior can be configured in `src/config/keyboard-throttle-config.ts`:

```typescript
export const keyboardThrottleConfig = {
  // Keys to throttle
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

  // Maximum number of events to allow within the time window
  maxEventsPerWindow: 5,

  // Time window in milliseconds
  timeWindowMs: 500,

  // Minimum delay between events in milliseconds (for smoother navigation)
  // Lower values = faster navigation, higher values = smoother but slower navigation
  minDelayBetweenEvents: 100,

  // Whether to enable the throttler
  enabled: true,
};
```

## Usage

The throttler is applied in the `DataTable` component:

```typescript
import { useKeyboardThrottler } from '@/hooks/useKeyboardThrottler';
import { keyboardThrottleConfig } from '@/config/keyboard-throttle-config';

export function DataTable() {
  // Apply keyboard throttling to prevent overwhelming ag-grid with rapid key presses
  useKeyboardThrottler({
    ...keyboardThrottleConfig,
    targetElement: document, // Apply to the entire document
  });

  // Rest of component...
}
```

## Customization

You can adjust the throttling behavior by modifying the configuration parameters:

- **keys**: Array of key names to throttle
- **maxEventsPerWindow**: Maximum number of events allowed in the time window
- **timeWindowMs**: Size of the time window in milliseconds
- **minDelayBetweenEvents**: Minimum time between events when a key is held down (controls smoothness)
- **enabled**: Toggle to enable/disable the throttler
- **targetElement**: DOM element to attach the event listener to

### Tuning for Smoothness

To make navigation smoother or faster, adjust these parameters:

- For smoother but slower navigation: Increase `minDelayBetweenEvents` (e.g., 150-200ms)
- For faster but potentially less smooth navigation: Decrease `minDelayBetweenEvents` (e.g., 50-80ms)
- For more responsive initial navigation: Increase `maxEventsPerWindow` (e.g., 8-10)
- For more controlled navigation: Decrease `maxEventsPerWindow` (e.g., 3-4)

## Benefits

- Prevents AG-Grid from being overwhelmed by rapid key presses
- Improves performance when navigating large datasets
- Provides a smoother user experience
- Configurable to match specific application needs
