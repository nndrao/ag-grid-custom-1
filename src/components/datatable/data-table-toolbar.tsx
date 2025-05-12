import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Download, Filter, RefreshCw, Settings } from 'lucide-react';
import { Cross2Icon } from "@radix-ui/react-icons";
import { FontSelector } from './font-selector'; // Updated path

interface DataTableToolbarProps<TData> {
  table: any;
  onFontChange?: (font: string) => void;
  currentFontValue: string;
  className?: string;
}

export function DataTableToolbar<TData>({ table, onFontChange, currentFontValue, className }: DataTableToolbarProps<TData>) {
  const isFiltered = table ? table.getState().columnFilters.length > 0 : false;
  
  return (
    <div className={`h-[60px] flex items-center justify-between gap-4 border-b border-border bg-muted/40 backdrop-blur-sm px-4 ${className || ''}`}>
      <div className="flex items-center gap-2">
        {/* Removed search input and filter button */}
      </div>
      <div className="flex items-center gap-2">
        <FontSelector 
          onFontChange={onFontChange} 
          currentFontValue={currentFontValue}
        />
        {/* Removed refresh, export, and settings buttons */}
      </div>
    </div>
  );
} 