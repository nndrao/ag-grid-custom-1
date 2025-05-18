import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Info, Circle, Filter } from 'lucide-react';
import { ColDef } from 'ag-grid-community';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { INPUT_CLASSES, SELECT_CLASSES } from '../style-utils';
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
  const [dataTypeFilter, setDataTypeFilter] = useState<string>('all');
  const listRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

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

  // Filter columns based on search term and data type
  const filteredColumns = columns.filter(col => {
    // Text search filter
    const fieldMatch = col.field?.toLowerCase().includes(searchTerm.toLowerCase());
    const headerMatch = col.headerName?.toLowerCase().includes(searchTerm.toLowerCase());
    const textMatch = fieldMatch || headerMatch;
    
    // Data type filter
    if (dataTypeFilter === 'all') return textMatch;
    const colDataType = getColumnDataType(col);
    return textMatch && colDataType === dataTypeFilter;
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

  // Reset focus when search or filter changes
  useEffect(() => {
    setFocusedIndex(0);
  }, [searchTerm, dataTypeFilter]);
  
  // Update focused index when selection changes
  useEffect(() => {
    const selectedIndex = filteredColumns.findIndex(col => col.field === selectedColumn);
    if (selectedIndex !== -1) {
      setFocusedIndex(selectedIndex);
    }
  }, [selectedColumn, filteredColumns]);


  return (
    <div className={cn(
      "flex flex-col bg-background transition-all duration-200",
      "w-[210px]"
    )}>
      {/* Search and filter area */}
      <div className="p-3 border-b space-y-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search columns..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={handleKeyDown}
            className={`pl-8 ${INPUT_CLASSES}`}
          />
        </div>
        
        <div className="relative">
          <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Select value={dataTypeFilter} onValueChange={setDataTypeFilter}>
            <SelectTrigger className={`pl-8 ${SELECT_CLASSES}`}>
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              <SelectItem value="text">Text</SelectItem>
              <SelectItem value="number">Number</SelectItem>
              <SelectItem value="date">Date</SelectItem>
              <SelectItem value="boolean">Boolean</SelectItem>
              <SelectItem value="select">Select</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {bulkUpdateMode && (
          <div className="flex items-center gap-1.5">
            <Checkbox
              id="selectAll"
              checked={filteredColumns.length > 0 && filteredColumns.every(col => selectedColumns.includes(col.field || ''))}
              onCheckedChange={(checked) => {
                if (checked) {
                  // Select all filtered columns
                  const fieldsToSelect = filteredColumns.map(col => col.field || '').filter(field => field);
                  fieldsToSelect.forEach(field => {
                    if (!selectedColumns.includes(field)) {
                      onColumnSelect(field);
                    }
                  });
                } else {
                  // Deselect all filtered columns
                  const fieldsToDeselect = filteredColumns.map(col => col.field || '').filter(field => field);
                  fieldsToDeselect.forEach(field => {
                    if (selectedColumns.includes(field)) {
                      onColumnSelect(field);
                    }
                  });
                }
              }}
              className="h-3.5 w-3.5"
            />
            <Label htmlFor="selectAll" className="text-xs font-medium cursor-pointer">
              Select All ({filteredColumns.length})
            </Label>
          </div>
        )}
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
                  "relative flex items-center gap-1.5 px-2 py-1.5 rounded-md cursor-pointer transition-colors",
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
                    <span className="text-[10px] text-muted-foreground font-mono w-4 text-center" title={`Data type: ${dataType}`}>
                      {dataType === 'number' && '123'}
                      {dataType === 'date' && '📅'}
                      {dataType === 'select' && '▼'}
                      {dataType === 'boolean' && '☑'}
                      {dataType === 'text' && 'Aa'}
                    </span>
                    <span className="text-xs truncate" title={columnName}>
                      {columnName}
                    </span>
                  </div>
                  {isModified && (
                    <Circle className="h-2 w-2 fill-blue-500 absolute right-2 top-1/2 -translate-y-1/2" />
                  )}
                </div>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="absolute inset-0 cursor-pointer" />
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <div className="text-[10px] space-y-0.5">
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