import { useEffect } from 'react';
import { GridApi, CellFocusedEvent } from 'ag-grid-community';
import { useKeyboardThrottler } from './useKeyboardThrottler';
import { useRapidKeypressNavigator } from './useRapidKeypressNavigator';
import { keyboardThrottleConfig, rapidKeypressConfig } from '../config/keyboard-throttle-config';

export function useAgGridKeyboardNavigation(gridApi: GridApi | null, gridReady: boolean) {
  // Apply keyboard throttling to prevent overwhelming ag-grid with rapid key presses
  useKeyboardThrottler({
    ...keyboardThrottleConfig,
    targetElement: document.body,
  });

  // Use rapid keypress navigator for enhanced keyboard navigation
  const { enable: enableRapidKeypress } = useRapidKeypressNavigator(gridApi, rapidKeypressConfig);

  // Handle keyboard navigation for ensuring column visibility
  useEffect(() => {
    if (!gridReady || !gridApi) return;
    
    // Enable rapid keypresses when grid is ready
    enableRapidKeypress();
    
    // Add a focused cell changed listener for column visibility
    const onFocusedCellChanged = (params: CellFocusedEvent) => {
      if (!params.column) return;
      
      try {
        // Ensure the column is visible in the viewport
        gridApi.ensureColumnVisible(params.column);
      } catch (err: unknown) {
        console.error('Error handling focused cell change:', err);
      }
    };
    
    // Register the listener
    gridApi.addEventListener('cellFocused', onFocusedCellChanged);
    
    // Cleanup
    return () => {
      if (gridApi) {
        gridApi.removeEventListener('cellFocused', onFocusedCellChanged);
      }
    };
  }, [gridReady, gridApi, enableRapidKeypress]);
} 