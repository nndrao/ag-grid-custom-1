import { Menu } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { DataTable, type ColumnDef } from '@/components/datatable/data-table';
import { generateFixedIncomeData, type FixedIncomePosition } from '@/lib/data-generator';
import { useMemo, useState } from 'react';
import { ThemeProvider } from "@/components/theme-provider";
import { MigrationTestPage } from './components/datatable/migration-test-page';
import { Button } from '@/components/ui/button';

function inferColumnDefinitions(data: FixedIncomePosition[]): ColumnDef[] {
  if (data.length === 0) return [];

  // Take 5% of the data as sample, minimum 1 row
  const sampleSize = Math.max(1, Math.floor(data.length * 0.05));
  const sampleData = data.slice(0, sampleSize);

  // Get all unique keys from the data
  const keys = Object.keys(data[0]);

  return keys.map(key => {
    // Sample values for type inference
    const sampleValues = sampleData.map(row => row[key]);

    // Infer type from sample values
    const inferredType = sampleValues.reduce((type, value) => {
      if (type) return type;
      if (typeof value === 'number') return 'number';
      if (value instanceof Date || !isNaN(Date.parse(value))) return 'date';
      if (typeof value === 'boolean') return 'boolean';
      return 'string';
    }, '');

    // Base column definition
    const columnDef: ColumnDef = {
      field: key,
      headerName: key
        .replace(/([A-Z])/g, ' $1') // Add space before capital letters
        .replace(/^./, str => str.toUpperCase()) // Capitalize first letter
        .trim(),
      cellDataType: inferredType,
    };

    return columnDef;
  });
}

function App() {
  const data = useMemo(() => generateFixedIncomeData(10000), []); // Starting with 100 records for initial render
  const columns = useMemo(() => inferColumnDefinitions(data), [data]);
  
  // State to track if we're showing the test page
  const [showTestPage, setShowTestPage] = useState(false);
  
  // Toggle between main app and test page
  const toggleTestPage = () => setShowTestPage(prev => !prev);

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <main className="h-full flex flex-col">
        <div className="border-b">
          {/* Header */}
          <header className="fixed top-0 left-0 right-0 h-16 bg-background border-b flex items-center justify-between px-6 z-50">
            <div className="flex items-center gap-4">
              <Menu className="h-6 w-6" />
              <h1 className="text-lg font-semibold">Fixed Income Portfolio</h1>
            </div>
            <div className="flex items-center gap-4">
              <ThemeToggle />
            </div>
          </header>
        </div>

        {/* Main Content */}
        <main className="flex-1 mt-16 mb-16">
          <div className="p-6">
            <div className="h-[calc(100vh-8rem-3rem)]">
              <DataTable columnDefs={columns} dataRow={data} />
            </div>
          </div>
        </main>
      </main>
    </ThemeProvider>
  );
}

export default App;