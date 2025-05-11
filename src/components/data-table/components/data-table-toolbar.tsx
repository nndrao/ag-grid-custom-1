import React from 'react';
// Removed Button and Input imports as they are not used directly here
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// Removed Lucide icon imports as they are not used directly here
// import { Download, Filter, RefreshCw, Settings } from 'lucide-react';
import { ProfileSelector } from './profile-selector'; // This path should be correct if ProfileSelector is in the same directory
import { FontSelector } from './font-selector'; // This path should be correct if FontSelector is in the same directory

interface DataTableToolbarProps {
  onFontChange: (font: string) => void;
}

export function DataTableToolbar({ onFontChange }: DataTableToolbarProps) {
  return (
    <div className="h-[60px] flex items-center justify-between gap-4 border-b bg-background/80 backdrop-blur-sm px-4 sticky top-0 z-10">
      {/* Placeholder for potential left-aligned controls like global search or quick filters */}
      <div className="flex-1"></div>
      
      <div className="flex items-center gap-2">
        <FontSelector onFontChange={onFontChange} />
        <ProfileSelector />
      </div>
    </div>
  );
} 