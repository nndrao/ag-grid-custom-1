import React, { memo } from 'react';
import { ICellRendererParams } from 'ag-grid-community';
import { CheckIcon, Cross2Icon } from '@radix-ui/react-icons';

/**
 * A lightweight cell renderer for boolean values
 * Optimized for performance to prevent navigation sluggishness
 */
function BooleanCellRenderer(props: ICellRendererParams) {
  const value = props.value;
  
  // Simple text rendering for non-boolean values
  if (typeof value !== 'boolean') {
    return <span>{value?.toString() || ''}</span>;
  }
  
  // Render a simple icon based on boolean value
  return value ? (
    <div className="flex justify-center items-center h-full">
      <CheckIcon className="h-4 w-4 text-green-600" />
    </div>
  ) : (
    <div className="flex justify-center items-center h-full">
      <Cross2Icon className="h-4 w-4 text-red-600" />
    </div>
  );
}

// Use memo to prevent unnecessary re-renders
export default memo(BooleanCellRenderer); 