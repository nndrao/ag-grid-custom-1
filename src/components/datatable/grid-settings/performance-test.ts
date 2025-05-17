import { GridApi } from 'ag-grid-community';
import { applySettingsOptimized } from './apply-settings-optimized';

// Performance test to demonstrate optimization improvements
export async function runPerformanceTest(gridApi: GridApi) {
  console.log('🚀 Running AG-Grid Settings Performance Test...');
  
  // Test data - large number of settings to apply
  const testSettings = {
    // Layout settings
    rowHeight: 35,
    headerHeight: 45,
    floatingFiltersHeight: 30,
    
    // Visual settings
    animateRows: true,
    alwaysShowVerticalScroll: true,
    domLayout: 'normal',
    
    // Selection settings
    rowSelection: {
      mode: 'multiRow',
      enableSelectionWithoutKeys: true,
      checkboxes: true,
      groupSelects: 'descendants'
    },
    cellSelection: {
      mode: 'range',
      multi: true,
      handle: true
    },
    
    // Grouping settings
    groupDisplayType: 'multipleColumns',
    groupDefaultExpanded: 2,
    pivotMode: false,
    rowGroupPanelShow: 'always',
    
    // Data settings
    rowBuffer: 30,
    valueCache: true,
    cellFlashDuration: 500,
    
    // Column settings
    suppressMovableColumns: false,
    suppressColumnMoveAnimation: false,
    suppressAutoSize: false,
    
    // Editing settings
    editType: 'fullRow',
    singleClickEdit: false,
    suppressClickEdit: false,
    
    // Default column settings
    defaultColDef: {
      sortable: true,
      filter: true,
      resizable: true,
      editable: false,
      verticalAlign: 'middle',
      horizontalAlign: 'left'
    }
  };
  
  // Run optimized version
  console.time('Optimized Apply');
  const result = await applySettingsOptimized(gridApi, testSettings, {});
  console.timeEnd('Optimized Apply');
  
  // Display results
  console.log('✅ Performance Results:');
  console.log(`Total Time: ${result.performanceMetrics.totalTime.toFixed(2)}ms`);
  console.log(`Preprocessing: ${result.performanceMetrics.preprocessTime.toFixed(2)}ms`);
  console.log(`Apply Time: ${result.performanceMetrics.applyTime.toFixed(2)}ms`);
  console.log(`Refresh Time: ${result.performanceMetrics.refreshTime.toFixed(2)}ms`);
  console.log(`Settings Applied: ${result.appliedSettings.length}`);
  
  if (result.errors.length > 0) {
    console.error('❌ Errors occurred:', result.errors);
  }
  
  return result;
}

// Comparison with standard approach
export async function runStandardApproach(gridApi: GridApi, settings: any) {
  console.time('Standard Apply');
  
  // Standard approach - apply settings one by one
  Object.entries(settings).forEach(([key, value]) => {
    gridApi.setGridOption(key, value);
  });
  
  // Standard refresh
  gridApi.refreshHeader();
  gridApi.refreshCells({ force: true });
  
  console.timeEnd('Standard Apply');
}

// Demo usage
export function performanceDemo(gridApi: GridApi) {
  console.log('=== AG-Grid Settings Performance Comparison ===');
  
  // Run tests
  Promise.all([
    runPerformanceTest(gridApi),
    // Standard approach would be run separately to avoid interference
  ]).then(() => {
    console.log('=== Test Complete ===');
  });
}