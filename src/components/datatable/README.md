# AG-Grid DataTable Component

A highly customizable AG-Grid wrapper for React with built-in profile management, runtime customization, and state persistence.

## Features

- ✨ Full AG-Grid Enterprise features
- 💾 Profile management (save/load grid states)
- 🎨 Runtime theming and customization
- ⚡ Performance optimized
- 🔧 Full TypeScript support
- 📱 Responsive design
- ⌨️ Advanced keyboard navigation
- 🎯 State persistence

## Installation

### As a standalone package
```bash
npm install @yourcompany/ag-grid-datatable
```

### Using in your project
1. Copy the entire `datatable` folder to your components directory
2. Install dependencies:
```bash
npm install ag-grid-community ag-grid-enterprise ag-grid-react lodash lucide-react
```

## Usage

```tsx
import { DataTable } from '@yourcompany/ag-grid-datatable';
// or if copied locally:
// import { DataTable } from '@/components/datatable';

function App() {
  const columnDefs = [
    { field: 'name', headerName: 'Name' },
    { field: 'age', headerName: 'Age' },
    { field: 'email', headerName: 'Email' }
  ];

  const data = [
    { name: 'John Doe', age: 30, email: 'john@example.com' },
    { name: 'Jane Smith', age: 25, email: 'jane@example.com' }
  ];

  return (
    <DataTable 
      columnDefs={columnDefs} 
      dataRow={data} 
    />
  );
}
```

## Profile Management

The DataTable includes built-in profile management:

```tsx
// Profile features included:
// - Save current grid state
// - Load saved profiles
// - Switch between profiles
// - Delete profiles
// - Auto-save to localStorage
```

## Customization

### Theme Support
- Light/Dark theme toggle
- Custom AG-Grid themes
- Font family and size selection
- Spacing controls

### Grid Settings
- Column configuration
- Sorting & filtering
- Row grouping & pivoting
- Selection options
- Pagination
- Cell editing
- Export options

## Project Structure

```
datatable/
├── index.ts                    # Main exports
├── data-table.tsx             # Main component
├── data-table-toolbar.tsx     # Toolbar with controls
├── config/                    # Default configurations
├── services/                  # Business logic
├── stores/                    # State management
├── hooks/                     # Custom React hooks
├── types/                     # TypeScript types
├── utils/                     # Utilities
├── theme/                     # Theme components
├── profile/                   # Profile management
└── grid-settings/            # Settings dialogs
```

## Dependencies

- React 18+
- AG-Grid Community & Enterprise
- TypeScript
- Tailwind CSS (for styling)
- shadcn/ui components

## License

MIT License - see LICENSE file for details