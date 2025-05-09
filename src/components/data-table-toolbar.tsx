import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Download, Filter, RefreshCw, Settings } from 'lucide-react';

export function DataTableToolbar() {
  return (
    <div className="h-[60px] flex items-center justify-between gap-4 border-b bg-muted/40 backdrop-blur-sm px-4">
      <div className="flex items-center gap-2">
        <Input
          placeholder="Search records..."
          className="h-9 w-[250px] bg-background"
        />
        <Button variant="outline" size="sm" className="h-9">
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" className="h-9">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
        <Button variant="outline" size="sm" className="h-9">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
        <Button variant="outline" size="sm" className="h-9">
          <Settings className="h-4 w-4 mr-2" />
          Settings
        </Button>
      </div>
    </div>
  );
}