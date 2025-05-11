import { Menu } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { DataTable, type CustomColumnDef as ColumnDef } from '@/components/data-table';
import { generateFixedIncomeData, type FixedIncomePosition } from '@/lib/data-generator';
import { useMemo } from 'react';
import { ThemeProvider } from '@/components/theme-provider';

function inferColumnDefinitions(data: FixedIncomePosition[]): ColumnDef[] {
  if (!data || data.length === 0) return [];

  const sampleSize = Math.max(1, Math.floor(data.length * 0.05));
  const sampleData = data.slice(0, sampleSize);
  const keys = Object.keys(data[0]);

  return keys.map(key => {
    const sampleValues = sampleData.map(row => (row as any)[key]);
    let inferredType: 'text' | 'number' | 'date' | 'boolean' = 'text';

    const firstNonNullValue = sampleValues.find(v => v !== null && v !== undefined && v !== '');

    if (typeof firstNonNullValue === 'number') inferredType = 'number';
    else if (typeof firstNonNullValue === 'boolean') inferredType = 'boolean';
    else if (firstNonNullValue instanceof Date || (!isNaN(Date.parse(String(firstNonNullValue))))) inferredType = 'date';
    
    const columnDef: ColumnDef = {
      field: key,
      headerName: key
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, str => str.toUpperCase())
        .trim(),
      cellDataType: inferredType,
      filter: true,
      sortable: true,
      resizable: true,
    };
    return columnDef;
  });
}

function App() {
  const data = useMemo(() => generateFixedIncomeData(10000), []);
  const columns = useMemo(() => inferColumnDefinitions(data), [data]);

  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        {/* Header */}
        <header className="fixed top-0 left-0 right-0 h-16 bg-background/80 backdrop-blur-sm border-b flex items-center justify-between px-6 z-50">
          <div className="flex items-center gap-4">
            <Menu className="h-6 w-6" />
            <h1 className="text-lg font-semibold">Fixed Income Portfolio</h1>
          </div>
          <ThemeToggle />
        </header>

        {/* Main Content */}
        <main className="flex-1 mt-16">
          <div className="p-2 sm:p-4 md:p-6 h-full">
            <div className="h-[calc(100vh-4rem-1rem)] sm:h-[calc(100vh-4rem-2rem)] md:h-[calc(100vh-4rem-3rem)]">
              {columns.length > 0 ? (
                <DataTable columnDefs={columns} dataRow={data} initialFont="Inter, sans-serif" />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p>Loading data or no columns to display...</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </ThemeProvider>
  );
}

export default App;