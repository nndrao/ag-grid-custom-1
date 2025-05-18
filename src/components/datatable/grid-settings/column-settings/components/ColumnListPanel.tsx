import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Search, Info, Circle } from 'lucide-react';
import { ColDef } from 'ag-grid-community';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ColumnListPanelProps {
  columns: ColDef[];
  selectedColumn: string;
  selectedColumns: string[];
  bulkUpdateMode: boolean;
  searchTerm: string;
  modifiedColumns: Set<string>;
  onColumnSelect: (columnField: string) => void;
  onSearchChange: (term: string) => void;
}

export function ColumnListPanel({
  columns,
  selectedColumn,
  selectedColumns,
  bulkUpdateMode,
  searchTerm,
  modifiedColumns,
  onColumnSelect,
  onSearchChange
}: ColumnListPanelProps) {
  const [focusedIndex, setFocusedIndex] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Filter columns based on search term
  const filteredColumns = columns.filter(col => {
    const fieldMatch = col.field?.toLowerCase().includes(searchTerm.toLowerCase());
    const headerMatch = col.headerName?.toLowerCase().includes(searchTerm.toLowerCase());
    return fieldMatch || headerMatch;
  });

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex(prev => 
          Math.min(prev + 1, filteredColumns.length - 1)
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex(prev => Math.max(prev - 1, 0));
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (filteredColumns[focusedIndex]) {
          onColumnSelect(filteredColumns[focusedIndex].field || '');
        }
        break;
    }
  }, [focusedIndex, filteredColumns, onColumnSelect]);

  // Scroll focused item into view
  useEffect(() => {
    if (itemRefs.current[focusedIndex]) {
      itemRefs.current[focusedIndex]?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      });
    }
  }, [focusedIndex]);

  // Reset focus when search changes
  useEffect(() => {
    setFocusedIndex(0);
  }, [searchTerm]);
  
  // Update focused index when selection changes
  useEffect(() => {
    const selectedIndex = filteredColumns.findIndex(col => col.field === selectedColumn);
    if (selectedIndex !== -1) {
      setFocusedIndex(selectedIndex);
    }
  }, [selectedColumn, filteredColumns]);

  // Determine column data type
  const getColumnDataType = (col: ColDef): string => {
    if (col.type === 'numericColumn' || 
        col.filter === 'agNumberColumnFilter' || 
        col.cellEditor === 'agNumberCellEditor') {
      return 'number';
    } else if (col.type === 'dateColumn' || 
              col.filter === 'agDateColumnFilter' || 
              col.cellEditor === 'agDateCellEditor') {
      return 'date';
    } else if (col.cellEditor === 'agSelectCellEditor') {
      return 'select';
    } else if (col.cellRenderer === 'agCheckboxCellRenderer') {
      return 'boolean';
    }
    return 'text';
  };

  return (
    <div className="w-1/4 flex flex-col bg-background">
      {/* Search area */}
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search columns..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={handleKeyDown}
            className="pl-9"
          />
        </div>
      </div>

      {/* Column list */}
      <div 
        ref={listRef}
        className="flex-1 overflow-y-auto p-2 scrollbar-thin"
        role="listbox"
        aria-label="Column list"
      >
        <TooltipProvider>
          {filteredColumns.map((col, index) => {
            const columnField = col.field || '';
            const columnName = col.headerName || col.field || '';
            const isSelected = bulkUpdateMode 
              ? selectedColumns.includes(columnField)
              : selectedColumn === columnField;
            const isModified = modifiedColumns.has(columnField);
            const dataType = getColumnDataType(col);
            const isFocused = index === focusedIndex;

            return (
              <div
                key={columnField}
                ref={el => itemRefs.current[index] = el}
                role="option"
                aria-selected={isSelected}
                tabIndex={isFocused ? 0 : -1}
                className={cn(
                  "relative flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer transition-colors",
                  "hover:bg-muted",
                  isSelected ? "bg-muted" : "transparent",
                  "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                )}
                onClick={() => onColumnSelect(columnField)}
                onKeyDown={handleKeyDown}
              >
                {bulkUpdateMode && (
                  <Checkbox
                    checked={selectedColumns.includes(columnField)}
                    onCheckedChange={() => onColumnSelect(columnField)}
                    className="h-4 w-4"
                    onClick={(e) => e.stopPropagation()}
                  />
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground font-mono" title={`Data type: ${dataType}`}>
                      {dataType === 'number' && '#'}
                      {dataType === 'date' && '📅'}
                      {dataType === 'select' && '▼'}
                      {dataType === 'boolean' && '☑'}
                      {dataType === 'text' && 'Aa'}
                    </span>
                    <span className="text-sm truncate" title={columnName}>
                      {columnName}
                    </span>
                  </div>
                  {isModified && (
                    <Circle className="h-2 w-2 fill-blue-500 absolute right-12 top-1/2 -translate-y-1/2" />
                  )}
                </div>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="text-xs space-y-1">
                      <p><strong>Field:</strong> {col.field}</p>
                      <p><strong>Type:</strong> {dataType}</p>
                      {col.width && <p><strong>Width:</strong> {col.width}px</p>}
                      <p><strong>Sortable:</strong> {col.sortable !== false ? 'Yes' : 'No'}</p>
                      <p><strong>Filterable:</strong> {col.filter ? 'Yes' : 'No'}</p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </div>
            );
          })}

          {filteredColumns.length === 0 && (
            <div className="text-center py-8 text-sm text-muted-foreground">
              No columns found
            </div>
          )}
        </TooltipProvider>
      </div>
    </div>
  );
}