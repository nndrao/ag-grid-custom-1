import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Download, Filter, RefreshCw, Settings } from 'lucide-react';
import { ProfileSelector } from './profile-selector';

export function DataTableToolbar() {
  return (
    <div className="h-[60px] flex items-center justify-between gap-4 border-b bg-muted/40 backdrop-blur-sm px-4">
      <div className="flex items-center gap-2">
        {/* Removed search input and filter button */}
      </div>
      <div className="flex items-center gap-2">
        <ProfileSelector />
        {/* Removed refresh, export, and settings buttons */}
      </div>
    </div>
  );
}