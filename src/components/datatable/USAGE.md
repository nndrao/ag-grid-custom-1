# Using DataTable as a Standalone Package

## Option 1: Copy the folder directly

1. Copy the entire `datatable` folder to your project's components directory
2. Install required dependencies:
```bash
npm install ag-grid-community ag-grid-enterprise ag-grid-react lodash lucide-react
```
3. Import and use:
```tsx
import { DataTable } from '@/components/datatable';
```

## Option 2: Create as npm package

1. Copy the datatable folder to a new repository
2. Run `npm init` and configure package.json
3. Build and publish to npm:
```bash
npm run build
npm publish
```
4. Install in your project:
```bash
npm install @yourcompany/ag-grid-datatable
```

## UI Components Dependency

The DataTable uses shadcn/ui components. You'll need to either:
- Install shadcn/ui components in your project
- Replace UI imports with your own components

Required UI components:
- Button
- Dialog (and related)
- Select
- Input
- Label
- Checkbox
- Switch
- ScrollArea
- Tabs
- Alert
- Command
- DropdownMenu
- Popover
- Slider

## Customization

### Styling
The component uses Tailwind CSS. Either:
- Have Tailwind configured in your project
- Replace Tailwind classes with your CSS
- Use the generated CSS from the build

### Theming
The theme provider can be customized or replaced with your own theme system.

### Features
All features are modular and can be enabled/disabled through props or configuration.