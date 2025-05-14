import { GridApi } from 'ag-grid-community';
import { GridSettings } from '@/types/profile.types';

export class GridStateProvider {
  private gridApi: GridApi | null = null;

  setGridApi(api: GridApi): void {
    this.gridApi = api;
  }

  getGridApi(): GridApi | null {
    return this.gridApi;
  }

  extractGridState(): GridSettings {
    if (!this.gridApi) {
      return {};
    }

    const gridState: GridSettings = {};

    try {
      // 1. Column State (includes sort, filter, width, visibility, pinning)
      const columnState = this.gridApi.getColumnState();
      if (columnState) {
        gridState.columnState = columnState;
        
        // Extract sort state separately for easy access
        gridState.sortState = columnState
          .filter((col: any) => col.sort)
          .map((col: any) => ({
            colId: col.colId,
            sort: col.sort,
            sortIndex: col.sortIndex
          }))
          .sort((a: any, b: any) => (a.sortIndex || 0) - (b.sortIndex || 0));
      }

      // 2. Column Group State
      const columnGroupState = this.gridApi.getColumnGroupState?.();
      if (columnGroupState) {
        gridState.columnGroupState = columnGroupState;
      }

      // 3. Filter State
      const filterState = this.gridApi.getFilterModel();
      if (filterState && Object.keys(filterState).length > 0) {
        gridState.filterState = filterState;
      }

      // 4. Row Group State
      const rowGroupColumns = this.gridApi.getRowGroupColumns();
      if (rowGroupColumns && rowGroupColumns.length > 0) {
        gridState.rowGroupState = {
          groupedColumns: rowGroupColumns.map((col: any) => col.getColId()),
          expandedGroups: [],
          groupExpansionState: {} // You might need custom logic to capture expanded groups
        };

        // Attempt to capture expanded groups from column state
        if (columnState) {
          gridState.rowGroupState.expandedGroups = columnState
            .filter((col: any) => col.rowGroup)
            .map((col: any) => col.colId);
        }
      }

      // 5. Selection State
      // In AG-Grid v33+, we can't use getModel() anymore, so check row model type differently
      // Check if we're using Server-Side Row Model based on the rowModelType grid option
      const isServerSideModel = this.gridApi.getGridOption?.('rowModelType') === 'serverSide';
      
      if (isServerSideModel && this.gridApi.getGridOption('groupSelectsChildren')) {
        try {
          const serverSideSelectionState = this.gridApi.getServerSideSelectionState?.();
          if (serverSideSelectionState) {
            gridState.selectionState = {
              serverSideSelection: serverSideSelectionState,
              mode: this.gridApi.getGridOption('rowSelection') || 'single'
            };
          }
        } catch (e) {
          // Server-side selection might not be available
        }
      } else {
        // Standard selection for Client-Side Row Model
        const selectedNodes = this.gridApi.getSelectedNodes();
        const selectedRows = this.gridApi.getSelectedRows();
        if ((selectedNodes && selectedNodes.length > 0) || (selectedRows && selectedRows.length > 0)) {
          gridState.selectionState = {
            selectedRows: selectedRows,
            selectedNodes: selectedNodes.map((node: any) => node.id),
            mode: this.gridApi.getGridOption('rowSelection') || 'single'
          };
        }
      }

      // 6. Side Bar State
      const isSideBarVisible = this.gridApi.isSideBarVisible();
      if (isSideBarVisible !== undefined) {
        gridState.sideBarState = {
          visible: isSideBarVisible,
          openedPanel: undefined
        };

        // Try to get the opened panel (this may vary based on AG-Grid version and setup)
        try {
          const sideBar = this.gridApi.getSideBar();
          if (sideBar) {
            const toolPanelInstance = sideBar.getToolPanelInstance?.();
            if (toolPanelInstance) {
              const openedPanel = toolPanelInstance.getOpenedPanel?.();
              if (openedPanel) {
                gridState.sideBarState.openedPanel = openedPanel.getId?.();
              }
            }
          }
        } catch (e) {
          // Handle if getSideBar API has changed
        }
      }

      // 7. Pagination State
      if (this.gridApi.paginationGetPageSize) {
        gridState.paginationState = {
          pageSize: this.gridApi.paginationGetPageSize(),
          currentPage: this.gridApi.paginationGetCurrentPage(),
          totalPages: this.gridApi.paginationGetTotalPages()
        };
      }

      // 8. View State
      const viewState: any = {};
      
      // Scroll position
      try {
        const horizontalRange = this.gridApi.getHorizontalPixelRange();
        const verticalRange = this.gridApi.getVerticalPixelRange();
        
        if (horizontalRange || verticalRange) {
          viewState.scrollPosition = {
            left: horizontalRange?.left || 0,
            top: verticalRange?.top || 0
          };
        }
      } catch (e) {
        // Scroll position APIs might not be available
      }

      // Focused cell
      const focusedCell = this.gridApi.getFocusedCell();
      if (focusedCell) {
        viewState.focusedCell = {
          rowIndex: focusedCell.rowIndex,
          column: focusedCell.column.getColId()
        };
      }

      // Displayed columns
      try {
        const displayedColumns = this.gridApi.getAllDisplayedColumns();
        if (displayedColumns) {
          viewState.displayedColumns = displayedColumns.map((col: any) => col.getColId());
        }
      } catch (e) {
        // getAllDisplayedColumns might not be available
      }

      // Displayed row count
      viewState.displayedRowCount = this.gridApi.getDisplayedRowCount();
      
      if (Object.keys(viewState).length > 0) {
        gridState.viewState = viewState;
      }

      // 9. Advanced Filter State (v28+)
      try {
        const advancedFilterModel = this.gridApi.getAdvancedFilterModel?.();
        if (advancedFilterModel) {
          gridState.advancedFilterState = advancedFilterModel;
        }
      } catch (e) {
        // Advanced filter might not be available
      }

      // 10. Range Selection State (if cell selection is enabled)
      try {
        const rangeSelections = this.gridApi.getCellRanges();
        if (rangeSelections && rangeSelections.length > 0) {
          gridState.rangeSelectionState = rangeSelections.map((range: any) => ({
            startRow: range.startRow?.rowIndex,
            endRow: range.endRow?.rowIndex,
            columns: range.columns?.map((col: any) => col.getColId())
          }));
        }
      } catch (e) {
        // Range selection might not be enabled
      }

      // 11. Floating Rows State
      const pinnedTopRowCount = this.gridApi.getPinnedTopRowCount?.();
      const pinnedBottomRowCount = this.gridApi.getPinnedBottomRowCount?.();
      
      if (pinnedTopRowCount > 0 || pinnedBottomRowCount > 0) {
        gridState.floatingRowState = {};
        
        if (pinnedTopRowCount > 0) {
          const pinnedTopRows = [];
          for (let i = 0; i < pinnedTopRowCount; i++) {
            const row = this.gridApi.getPinnedTopRow?.(i);
            if (row) {
              pinnedTopRows.push(row.data);
            }
          }
          gridState.floatingRowState.pinnedTopRowData = pinnedTopRows;
        }
        
        if (pinnedBottomRowCount > 0) {
          const pinnedBottomRows = [];
          for (let i = 0; i < pinnedBottomRowCount; i++) {
            const row = this.gridApi.getPinnedBottomRow?.(i);
            if (row) {
              pinnedBottomRows.push(row.data);
            }
          }
          gridState.floatingRowState.pinnedBottomRowData = pinnedBottomRows;
        }
      }

      // 12. Quick Filter State
      try {
        const quickFilterText = this.gridApi.getQuickFilter?.();
        if (quickFilterText) {
          gridState.quickFilterState = quickFilterText;
        }
      } catch (e) {
        // getQuickFilter might not be available
      }

      // 13. Column Sizing State
      try {
        const columnSizingState: any = {};
        const allColumns = this.gridApi.getAllGridColumns?.();
        
        if (allColumns) {
          const columnWidths: { [key: string]: number } = {};
          const columnFlex: { [key: string]: number } = {};
          
          allColumns.forEach((col: any) => {
            const colId = col.getColId();
            const width = col.getActualWidth();
            const flex = col.getFlex?.();
            
            if (width !== undefined && width !== null) {
              columnWidths[colId] = width;
            }
            if (flex !== undefined && flex !== null && flex > 0) {
              columnFlex[colId] = flex;
            }
          });
          
          if (Object.keys(columnWidths).length > 0) {
            columnSizingState.columnWidths = columnWidths;
          }
          if (Object.keys(columnFlex).length > 0) {
            columnSizingState.columnFlex = columnFlex;
          }
          
          if (Object.keys(columnSizingState).length > 0) {
            gridState.columnSizingState = columnSizingState;
          }
        }
      } catch (e) {
        // Column sizing APIs might not be available
      }

      // 14. Grid Options (non-state configuration)
      try {
        const gridOptions: any = {};
        const optionsToCapture = [
          'animateRows',
          'enableRangeSelection',
          'rowSelection',
          'suppressRowClickSelection',
          'groupSelectsChildren',
          'suppressMovableColumns'
        ];
        
        let hasOptions = false;
        optionsToCapture.forEach(option => {
          try {
            const value = this.gridApi.getGridOption?.(option);
            if (value !== undefined) {
              gridOptions[option] = value;
              hasOptions = true;
            }
          } catch (e) {
            // getGridOption might not be available
          }
        });
        
        // Capture status bar configuration
        try {
          const statusPanels = this.gridApi.getGridOption?.('statusBar');
          if (statusPanels) {
            gridOptions.statusBar = statusPanels;
            hasOptions = true;
          }
        } catch (e) {
          // Status bar option might not be available
        }
        
        if (hasOptions) {
          gridState.gridOptions = gridOptions;
        }
      } catch (e) {
        // Grid options APIs might not be available
      }

    } catch (error) {
      console.error('Error extracting grid state:', error);
    }

    return gridState;
  }

  applyGridState(gridState: GridSettings): void {
    if (!this.gridApi || !gridState) {
      return;
    }
    
    // Process defaultColDef to properly handle cell alignments if present
    if (gridState.custom?.gridOptions?.defaultColDef) {
      try {
        const colDef = gridState.custom.gridOptions.defaultColDef as any;
        const verticalAlign = colDef.verticalAlign as 'start' | 'center' | 'end' | undefined;
        const horizontalAlign = colDef.horizontalAlign as 'left' | 'center' | 'right' | undefined;
        
        // Only create cellStyle if at least one alignment is specified
        if (verticalAlign || horizontalAlign) {
          // Create a function that returns the style object
          colDef.cellStyle = () => {
            const styleObj: any = { display: 'flex' };
            
            // Add vertical alignment
            if (verticalAlign) {
              styleObj.alignItems = verticalAlign;
            }
            
            // Add horizontal alignment
            if (horizontalAlign) {
              switch (horizontalAlign) {
                case 'left':
                  styleObj.justifyContent = 'flex-start';
                  break;
                case 'center':
                  styleObj.justifyContent = 'center';
                  break;
                case 'right':
                  styleObj.justifyContent = 'flex-end';
                  break;
              }
            }
            
            return styleObj;
          };
        }
      } catch (e) {
        console.error('Error processing defaultColDef alignments:', e);
      }
    }

    try {
      // 1. Restore column state (includes sort, filter, width, visibility, pinning)
      if (gridState.columnState) {
        this.gridApi.applyColumnState({
          state: gridState.columnState,
          applyOrder: true,
          defaultState: { sort: null },
          // Force the column state to be applied, overriding any automatic behavior
          suppressColumnStateEvents: false,
          suppressSizeToFit: true
        });
      }

      // 2. Restore column group state
      if (gridState.columnGroupState && this.gridApi.setColumnGroupState) {
        this.gridApi.setColumnGroupState(gridState.columnGroupState);
      }

      // 3. Restore filter state
      if (gridState.filterState) {
        this.gridApi.setFilterModel(gridState.filterState);
      }

      // 4. Restore advanced filter state (if available)
      if (gridState.advancedFilterState && this.gridApi.setAdvancedFilterModel) {
        try {
          this.gridApi.setAdvancedFilterModel(gridState.advancedFilterState);
        } catch (e) {
          // Advanced filter might not be available
        }
      }

      // 5. Restore quick filter
      if (gridState.quickFilterState && this.gridApi.setQuickFilter) {
        this.gridApi.setQuickFilter(gridState.quickFilterState);
      }

      // 6. Restore pagination
      if (gridState.paginationState) {
        if (gridState.paginationState.pageSize && this.gridApi.paginationSetPageSize) {
          this.gridApi.paginationSetPageSize(gridState.paginationState.pageSize);
        }
        if (gridState.paginationState.currentPage !== undefined && this.gridApi.paginationGoToPage) {
          this.gridApi.paginationGoToPage(gridState.paginationState.currentPage);
        }
      }

      // 7. Restore side bar state
      if (gridState.sideBarState) {
        if (gridState.sideBarState.visible !== undefined) {
          if (gridState.sideBarState.visible) {
            this.gridApi.openToolPanel(gridState.sideBarState.openedPanel || 'columns');
          } else {
            this.gridApi.closeToolPanel();
          }
        }
      }

      // Apply column sizing directly if available
      if (gridState.columnSizingState?.columnWidths) {
        const columnWidths = gridState.columnSizingState.columnWidths;
        
        // Handle any auto-sizing or layout changes by directly setting column widths
        // This ensures sizes are maintained even if auto-sizing occurs later
        setTimeout(() => {
          try {
            const allColumns = this.gridApi?.getAllGridColumns() || [];
            allColumns.forEach((col: any) => {
              const colId = col.getColId();
              if (columnWidths[colId] !== undefined) {
                col.setActualWidth(columnWidths[colId]);
              }
            });
            // Force grid to visually update with the new widths
            this.gridApi?.refreshHeader();
            this.gridApi?.refreshCells({ force: true });
          } catch (e) {
            console.error('Error applying column widths:', e);
          }
        }, 100);
      }

      // 8. Restore scroll position (should be done after data is loaded)
      if (gridState.viewState?.scrollPosition) {
        setTimeout(() => {
          try {
            this.gridApi?.ensureIndexVisible(0, 'top');
            
            if (gridState.viewState?.displayedColumns?.[0]) {
              this.gridApi?.ensureColumnVisible(gridState.viewState.displayedColumns[0]);
            }
            
            // Note: Direct scroll position API might vary by version
            if (this.gridApi?.setHorizontalScrollPosition) {
              this.gridApi.setHorizontalScrollPosition(gridState.viewState.scrollPosition.left);
            }
            if (this.gridApi?.setVerticalScrollPosition) {
              this.gridApi.setVerticalScrollPosition(gridState.viewState.scrollPosition.top);
            }
          } catch (e) {
            // Scroll APIs might vary
          }
        }, 100);
      }

      // 9. Restore focused cell
      if (gridState.viewState?.focusedCell) {
        setTimeout(() => {
          try {
            this.gridApi?.setFocusedCell(
              gridState.viewState?.focusedCell?.rowIndex,
              gridState.viewState?.focusedCell?.column
            );
          } catch (e) {
            // Focus cell API might vary
          }
        }, 100);
      }

      // 10. Restore selection (should be done after data is loaded)
      if (gridState.selectionState) {
        const rowModel = this.gridApi.getGridOption('rowModelType');
        const isServerSideModel = rowModel === 'serverSide';
        
        if (isServerSideModel && this.gridApi.getGridOption('groupSelectsChildren') && gridState.selectionState.serverSideSelection && this.gridApi.setServerSideSelectionState) {
          // Restore server-side selection
          setTimeout(() => {
            try {
              this.gridApi?.setServerSideSelectionState(gridState.selectionState.serverSideSelection);
            } catch (e) {
              // Server-side selection API might vary
            }
          }, 100);
        } else if (gridState.selectionState.selectedNodes) {
          // Restore client-side selection
          setTimeout(() => {
            try {
              gridState.selectionState.selectedNodes.forEach((nodeId: string) => {
                const node = this.gridApi?.getRowNode(nodeId);
                if (node) {
                  node.setSelected(true);
                }
              });
            } catch (e) {
              // Selection API might vary
            }
          }, 100);
        }
      }

      // 11. Restore range selection
      if (gridState.rangeSelectionState && gridState.rangeSelectionState.length > 0 && this.gridApi.clearCellSelection && this.gridApi.addCellRange) {
        setTimeout(() => {
          try {
            // Clear existing ranges
            this.gridApi?.clearCellSelection();
            
            // Add saved ranges
            gridState.rangeSelectionState.forEach((range: any) => {
              this.gridApi?.addCellRange({
                rowStartIndex: range.startRow,
                rowEndIndex: range.endRow,
                columns: range.columns
              });
            });
          } catch (e) {
            // Range selection API might vary
          }
        }, 100);
      }

    } catch (error) {
      console.error('Error restoring grid state:', error);
    }
  }
} 