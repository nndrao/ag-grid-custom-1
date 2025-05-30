import { useEffect, useRef, useCallback } from 'react';
import type { 
  GridApi, 
  CellPosition, 
  CellRangeParams
} from 'ag-grid-community';

interface RapidKeypressConfig {
  /** Initial delay before rapid keypresses start (default: 300ms) */
  initialDelay?: number;
  /** Initial interval between rapid keypresses (default: 50ms) */
  rapidInterval?: number;
  /** Rate at which interval decreases (default: 0.95) */
  accelerationRate?: number;
  /** Minimum interval between keypresses (default: 10ms) */
  minInterval?: number;
  /** Array of keys to enable rapid keypress for. 
   * Supports: ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Tab, Home, End, PageUp, PageDown
   * Shift+Arrow keys are automatically supported for range selection when enabledKeys includes arrow keys
   */
  enabledKeys?: string[];
}

interface KeyState {
  shiftKey: boolean;
  ctrlKey: boolean;
  altKey: boolean;
  metaKey?: boolean;
}

interface TimerState {
  initial: NodeJS.Timeout | null;
  rapid: NodeJS.Timeout | null;
  currentInterval: number;
}

const DEFAULT_CONFIG: Required<RapidKeypressConfig> = {
  initialDelay: 300,
  rapidInterval: 50,
  accelerationRate: 0.95,
  minInterval: 10,
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

/**
 * React hook for implementing rapid keypress navigation in AG-Grid
 * @param gridApi - AG-Grid GridApi instance
 * @param config - Configuration options for the rapid keypress behavior
 * @returns An object containing methods to enable/disable the simulation
 */
export const useRapidKeypressNavigator = (
  gridApi: GridApi | null,
  config: RapidKeypressConfig = {}
) => {
  // Merge config with defaults
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  
  // Refs to track state without causing re-renders
  const activeKeysRef = useRef<Map<string, KeyState>>(new Map());
  const simulationTimersRef = useRef<Map<string, TimerState>>(new Map());
  const isEnabledRef = useRef(true);
  
  // Helper function to stop simulation for a key
  const stopSimulation = useCallback((key: string) => {
    activeKeysRef.current.delete(key);
    
    const timer = simulationTimersRef.current.get(key);
    if (timer) {
      if (timer.initial) {
        clearTimeout(timer.initial);
      }
      if (timer.rapid) {
        clearTimeout(timer.rapid);
      }
    }
    
    simulationTimersRef.current.delete(key);
  }, []);
  
  // Helper function to stop only rapid simulation for a key
  const stopRapidSimulation = useCallback((key: string) => {
    const timer = simulationTimersRef.current.get(key);
    if (timer && timer.rapid) {
      clearTimeout(timer.rapid);
      timer.rapid = null;
    }
  }, []);
  
  // Navigate to row edge (Home/End keys)
  const navigateToRowEdge = useCallback((toStart: boolean, shiftKey: boolean) => {
    if (!gridApi) return;
    
    const focusedCell = gridApi.getFocusedCell();
    if (!focusedCell) return;
    
    const allColumns = gridApi.getAllGridColumns();
    if (!allColumns || allColumns.length === 0) return;
    
    const targetColumn = toStart ? allColumns[0] : allColumns[allColumns.length - 1];
    if (!targetColumn) return;
    
    // Store the current position for range selection
    let rangeStartCell = focusedCell;
    
    // If shift is held and we have existing ranges, use the start of the last range
    if (shiftKey) {
      const existingRanges = gridApi.getCellRanges();
      if (existingRanges && existingRanges.length > 0) {
        const lastRange = existingRanges[existingRanges.length - 1];
        const startRow = lastRange.startRow;
        if (startRow) {
          rangeStartCell = {
            rowIndex: startRow.rowIndex,
            column: lastRange.columns[0],
            rowPinned: startRow.rowPinned || null
          };
        }
      }
    }
    
    // Only clear focus if not doing range selection
    if (!shiftKey) {
      gridApi.clearCellSelection();
    }
    
    // Ensure column visibility when navigating to row edges
    try {
      gridApi.ensureColumnVisible(targetColumn);
    } catch (err) {
      // Fallback to column ID-based approach if direct column reference fails
      if (targetColumn.getColId && typeof targetColumn.getColId === 'function') {
        gridApi.ensureColumnVisible(targetColumn.getColId());
      }
    }
    
    // Navigate to the target cell
    gridApi.setFocusedCell(focusedCell.rowIndex, targetColumn);
    
    // Force a refresh of the cells to ensure focus is visually updated
    gridApi.refreshCells({
      columns: [focusedCell.column, targetColumn]
    });
    
    // Handle range selection
    if (shiftKey) {
      const rangeParams: CellRangeParams = {
        rowStartIndex: rangeStartCell.rowIndex,
        rowEndIndex: focusedCell.rowIndex,
        columnStart: toStart ? targetColumn : rangeStartCell.column,
        columnEnd: toStart ? rangeStartCell.column : targetColumn
      };
      
      gridApi.clearRangeSelection();
      gridApi.addCellRange(rangeParams);
    }
  }, [gridApi]);
  
  // Navigate by page (PageUp/PageDown keys)
  const navigateByPage = useCallback((direction: number, shiftKey: boolean) => {
    if (!gridApi) return;
    
    const focusedCell = gridApi.getFocusedCell();
    if (!focusedCell) return;
    
    // Store the current position for range selection
    let rangeStartCell = focusedCell;
    
    // If shift is held and we have existing ranges, use the start of the last range
    if (shiftKey) {
      const existingRanges = gridApi.getCellRanges();
      if (existingRanges && existingRanges.length > 0) {
        const lastRange = existingRanges[existingRanges.length - 1];
        const startRow = lastRange.startRow;
        if (startRow) {
          rangeStartCell = {
            rowIndex: startRow.rowIndex,
            column: lastRange.columns[0],
            rowPinned: startRow.rowPinned || null
          };
        }
      }
    }
    
    // Get page size from pagination or estimate from visible rows
    let pageSize = 50; // default
    
    if (gridApi.paginationIsLastPageFound()) {
      pageSize = gridApi.paginationGetPageSize();
    } else {
      // Estimate based on visible rows
      const visibleRows = gridApi.getDisplayedRowCount();
      pageSize = Math.max(10, Math.floor(visibleRows / 2));
    }
    
    const totalRows = gridApi.getDisplayedRowCount();
    const startIndex = Math.max(0, focusedCell.rowIndex + (direction * pageSize));
    const endIndex = Math.max(0, Math.min(startIndex, totalRows - 1));
    
    // Only clear focus if not doing range selection
    if (!shiftKey) {
      gridApi.clearCellSelection();
    }
    
    gridApi.ensureIndexVisible(endIndex);
    gridApi.setFocusedCell(endIndex, focusedCell.column);
    
    // Force a refresh of the cells
    try {
      // Refresh specific rows
      const rowsToRefresh = [];
      const rowNode1 = gridApi.getRowNode(String(focusedCell.rowIndex));
      const rowNode2 = gridApi.getRowNode(String(endIndex));
      if (rowNode1) rowsToRefresh.push(rowNode1);
      if (rowNode2) rowsToRefresh.push(rowNode2);
      
      if (rowsToRefresh.length > 0) {
        gridApi.refreshCells({ rowNodes: rowsToRefresh });
      } else {
        gridApi.refreshCells();
      }
    } catch (err) {
      // Fallback to full grid refresh if specific refresh fails
      gridApi.refreshCells();
    }
    
    // Handle range selection
    if (shiftKey) {
      const rangeParams: CellRangeParams = {
        rowStartIndex: Math.min(rangeStartCell.rowIndex, endIndex),
        rowEndIndex: Math.max(rangeStartCell.rowIndex, endIndex),
        columnStart: rangeStartCell.column,
        columnEnd: focusedCell.column
      };
      
      gridApi.clearRangeSelection();
      gridApi.addCellRange(rangeParams);
    }
  }, [gridApi]);
  
  // Navigate in arrow key direction using public API
  const navigateInDirection = useCallback((key: string, shiftKey: boolean, fromCell: CellPosition | null) => {
    if (!gridApi || !fromCell) return;
    
    const allColumns = gridApi.getAllGridColumns();
    if (!allColumns || allColumns.length === 0) return;
    
    const currentColIndex = allColumns.findIndex(col => col === fromCell.column);
    const totalRows = gridApi.getDisplayedRowCount();
    
    let newRowIndex = fromCell.rowIndex;
    let newColIndex = currentColIndex;
    
    // Calculate new position
    switch (key) {
      case 'ArrowUp':
        newRowIndex = Math.max(0, fromCell.rowIndex - 1);
        break;
      case 'ArrowDown':
        newRowIndex = Math.min(totalRows - 1, fromCell.rowIndex + 1);
        break;
      case 'ArrowLeft':
        newColIndex = Math.max(0, currentColIndex - 1);
        break;
      case 'ArrowRight':
        newColIndex = Math.min(allColumns.length - 1, currentColIndex + 1);
        break;
    }
    
    // Get the target column
    const targetColumn = allColumns[newColIndex];
    if (!targetColumn) return;
    
    // Only clear focus if not doing range selection
    if (!shiftKey) {
      gridApi.clearCellSelection()
    }
    
    // Ensure visibility for both vertical and horizontal navigation
    gridApi.ensureIndexVisible(newRowIndex);
    
    // Ensure column visibility for horizontal navigation
    if (key === 'ArrowLeft' || key === 'ArrowRight') {
      try {
        gridApi.ensureColumnVisible(targetColumn);
      } catch (err) {
        // Fallback to column ID-based approach if direct column reference fails
        if (targetColumn.getColId && typeof targetColumn.getColId === 'function') {
          gridApi.ensureColumnVisible(targetColumn.getColId());
        }
      }
    }
    
    // Set focus to the new cell
    gridApi.setFocusedCell(newRowIndex, targetColumn);
    
    // Force a refresh of the cells
    try {
      // Refresh specific rows
      const rowsToRefresh = [];
      if (fromCell.rowIndex !== newRowIndex) {
        const rowNode1 = gridApi.getRowNode(String(fromCell.rowIndex));
        const rowNode2 = gridApi.getRowNode(String(newRowIndex));
        if (rowNode1) rowsToRefresh.push(rowNode1);
        if (rowNode2) rowsToRefresh.push(rowNode2);
      }
      
      if (rowsToRefresh.length > 0) {
        gridApi.refreshCells({ rowNodes: rowsToRefresh });
      } else {
        // Refresh specific columns if only horizontal movement
        gridApi.refreshCells({ columns: [fromCell.column, targetColumn] });
      }
    } catch (err) {
      // Fallback to full grid refresh if specific refresh fails
      gridApi.refreshCells();
    }
    
    // Handle range selection
    if (shiftKey) {
      // Get existing ranges
      const existingRanges = gridApi.getCellRanges();
      let rangeStartCell = fromCell;
      
      // If we have existing ranges, use the start of the last range
      if (existingRanges && existingRanges.length > 0) {
        const lastRange = existingRanges[existingRanges.length - 1];
        const startRow = lastRange.startRow;
        if (startRow) {
          rangeStartCell = {
            rowIndex: startRow.rowIndex,
            column: lastRange.columns[0],
            rowPinned: startRow.rowPinned || null
          };
        }
      }
      
      // Don't clear existing ranges for continuous selection
      const rangeParams: CellRangeParams = {
        rowStartIndex: Math.min(rangeStartCell.rowIndex, newRowIndex),
        rowEndIndex: Math.max(rangeStartCell.rowIndex, newRowIndex),
        columnStart: rangeStartCell.column === targetColumn ? rangeStartCell.column : 
                      allColumns.indexOf(rangeStartCell.column) < allColumns.indexOf(targetColumn) ? 
                      rangeStartCell.column : targetColumn,
        columnEnd: rangeStartCell.column === targetColumn ? targetColumn : 
                    allColumns.indexOf(rangeStartCell.column) < allColumns.indexOf(targetColumn) ? 
                    targetColumn : rangeStartCell.column
      };
      
      gridApi.clearRangeSelection();
      gridApi.addCellRange(rangeParams);
    }
  }, [gridApi]);
  
  // Navigate with Tab key using public API
  const navigateWithTab = useCallback((forward: boolean, shiftKey: boolean, fromCell: CellPosition | null) => {
    if (!gridApi || !fromCell) return;
    
    const allColumns = gridApi.getAllGridColumns();
    if (!allColumns || allColumns.length === 0) return;
    
    const currentColIndex = allColumns.findIndex(col => col === fromCell.column);
    const totalRows = gridApi.getDisplayedRowCount();
    
    let newRowIndex = fromCell.rowIndex;
    let newColIndex = currentColIndex;
    
    if (forward) {
      // Tab forward
      newColIndex++;
      if (newColIndex >= allColumns.length) {
        newColIndex = 0;
        newRowIndex++;
        if (newRowIndex >= totalRows) {
          newRowIndex = 0; // Wrap to top
        }
      }
    } else {
      // Tab backward (Shift+Tab)
      newColIndex--;
      if (newColIndex < 0) {
        newColIndex = allColumns.length - 1;
        newRowIndex--;
        if (newRowIndex < 0) {
          newRowIndex = totalRows - 1; // Wrap to bottom
        }
      }
    }
    
    // Get the target column
    const targetColumn = allColumns[newColIndex];
    if (!targetColumn) return;
    
    // Only clear focus if not doing range selection with Shift key
    if (!shiftKey || forward) {
      gridApi.clearCellSelection();
    }
    
    // Ensure the target row is visible
    gridApi.ensureIndexVisible(newRowIndex);
    
    // Ensure column visibility for Tab navigation
    try {
      gridApi.ensureColumnVisible(targetColumn);
    } catch (err) {
      // Fallback to column ID-based approach if direct column reference fails
      if (targetColumn.getColId && typeof targetColumn.getColId === 'function') {
        gridApi.ensureColumnVisible(targetColumn.getColId());
      }
    }
    
    // Set focus to the new cell
    gridApi.setFocusedCell(newRowIndex, targetColumn);
    
    // Force a refresh of the cells
    try {
      // Refresh specific rows
      const rowsToRefresh = [];
      if (fromCell.rowIndex !== newRowIndex) {
        const rowNode1 = gridApi.getRowNode(String(fromCell.rowIndex));
        const rowNode2 = gridApi.getRowNode(String(newRowIndex));
        if (rowNode1) rowsToRefresh.push(rowNode1);
        if (rowNode2) rowsToRefresh.push(rowNode2);
      }
      
      if (rowsToRefresh.length > 0) {
        gridApi.refreshCells({ rowNodes: rowsToRefresh });
      } else {
        // Refresh specific columns if only horizontal movement
        gridApi.refreshCells({ columns: [fromCell.column, targetColumn] });
      }
    } catch (err) {
      // Fallback to full grid refresh if specific refresh fails
      gridApi.refreshCells();
    }
    
    // Handle range selection for Shift+Tab
    if (shiftKey && !forward) {
      const existingRanges = gridApi.getCellRanges();
      let rangeStartCell = fromCell;
      
      if (existingRanges && existingRanges.length > 0) {
        const lastRange = existingRanges[existingRanges.length - 1];
        const startRow = lastRange.startRow;
        if (startRow) {
          rangeStartCell = {
            rowIndex: startRow.rowIndex,
            column: lastRange.columns[0],
            rowPinned: startRow.rowPinned || null
          };
        }
      }
      
      const rangeParams: CellRangeParams = {
        rowStartIndex: Math.min(rangeStartCell.rowIndex, newRowIndex),
        rowEndIndex: Math.max(rangeStartCell.rowIndex, newRowIndex),
        columnStart: rangeStartCell.column === targetColumn ? rangeStartCell.column : 
                      allColumns.indexOf(rangeStartCell.column) < allColumns.indexOf(targetColumn) ? 
                      rangeStartCell.column : targetColumn,
        columnEnd: rangeStartCell.column === targetColumn ? targetColumn : 
                    allColumns.indexOf(rangeStartCell.column) < allColumns.indexOf(targetColumn) ? 
                    targetColumn : rangeStartCell.column
      };
      
      gridApi.clearRangeSelection();
      gridApi.addCellRange(rangeParams);
    }
  }, [gridApi]);
  
  // Simulate a keypress
  const simulateKeypress = useCallback((key: string, keyState: KeyState) => {
    if (!gridApi) return;
    
    // Get the current focused cell before navigation
    const focusedCell = gridApi.getFocusedCell();
    
    try {
      switch (key) {
        case 'ArrowUp':
        case 'ArrowDown':
        case 'ArrowLeft':
        case 'ArrowRight':
          navigateInDirection(key, keyState.shiftKey, focusedCell);
          break;
        case 'Tab':
          navigateWithTab(!keyState.shiftKey, keyState.shiftKey, focusedCell);
          break;
        case 'Home':
          navigateToRowEdge(true, keyState.shiftKey);
          break;
        case 'End':
          navigateToRowEdge(false, keyState.shiftKey);
          break;
        case 'PageUp':
          navigateByPage(-1, keyState.shiftKey);
          break;
        case 'PageDown':
          navigateByPage(1, keyState.shiftKey);
          break;
      }
    } catch (error) {
    }
  }, [gridApi, navigateInDirection, navigateWithTab, navigateToRowEdge, navigateByPage]);
  
  // Start rapid simulation for a key
  const startRapidSimulation = useCallback((key: string) => {
    if (!gridApi) return;
    
    stopRapidSimulation(key);
    
    const timer = simulationTimersRef.current.get(key);
    if (!timer) return;
    
    const simulate = () => {
      if (!activeKeysRef.current.has(key)) {
        return; // Key was released
      }
      
      const keyState = activeKeysRef.current.get(key);
      if (!keyState) return;
      
      // Simulate the keypress
      simulateKeypress(key, keyState);
      
      // Accelerate the interval
      timer.currentInterval = Math.max(
        timer.currentInterval * finalConfig.accelerationRate,
        finalConfig.minInterval
      );
      
      // Schedule the next simulation
      timer.rapid = setTimeout(simulate, timer.currentInterval);
    };
    
    // Start the first rapid simulation
    simulate();
  }, [gridApi, finalConfig.accelerationRate, finalConfig.minInterval, simulateKeypress, stopRapidSimulation]);
  
  // Handler for keydown events
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!gridApi || !isEnabledRef.current) return;
    
    const key = event.key;
    
    // Check if this key should be handled
    if (!finalConfig.enabledKeys.includes(key)) {
      return;
    }
    
    event.preventDefault();
    event.stopPropagation();
    
    // If key is already being held, don't restart the simulation
    if (activeKeysRef.current.has(key)) {
      return;
    }
    
    // Store key state
    const keyState: KeyState = {
      shiftKey: event.shiftKey,
      ctrlKey: event.ctrlKey,
      altKey: event.altKey,
      metaKey: event.metaKey
    };
    
    activeKeysRef.current.set(key, keyState);
    
    // Execute the first keypress immediately
    simulateKeypress(key, keyState);
    
    // Start the simulation after initial delay
    const initialTimer = setTimeout(() => {
      startRapidSimulation(key);
    }, finalConfig.initialDelay);
    
    simulationTimersRef.current.set(key, {
      initial: initialTimer,
      rapid: null,
      currentInterval: finalConfig.rapidInterval
    });
  }, [gridApi, finalConfig.enabledKeys, finalConfig.initialDelay, finalConfig.rapidInterval, simulateKeypress, startRapidSimulation]);
  
  // Handler for keyup events
  const handleKeyUp = useCallback((event: KeyboardEvent) => {
    const key = event.key;
    
    if (activeKeysRef.current.has(key)) {
      stopSimulation(key);
    }
  }, [stopSimulation]);
  
  // Set up event listeners
  useEffect(() => {
    if (!gridApi) return;
    
    // Add event listeners
    document.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('keyup', handleKeyUp, true);
    
    // Cleanup on unmount
    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
      document.removeEventListener('keyup', handleKeyUp, true);
      
      // Stop all active simulations
      activeKeysRef.current.forEach((_, keyToStop) => {
        stopSimulation(keyToStop);
      });
    };
  }, [gridApi, handleKeyDown, handleKeyUp, stopSimulation]);
  
  // Public API methods
  const enable = useCallback(() => {
    isEnabledRef.current = true;
  }, []);
  
  const disable = useCallback(() => {
    isEnabledRef.current = false;
    // Stop all active simulations
    activeKeysRef.current.forEach((_, keyToStop) => {
      stopSimulation(keyToStop);
    });
  }, [stopSimulation]);
  
  const isEnabled = useCallback(() => {
    return isEnabledRef.current;
  }, []);
  
  return {
    enable,
    disable,
    isEnabled
  };
};

// TypeScript types export for users
export type {
  RapidKeypressConfig,
  KeyState,
  TimerState
}; 