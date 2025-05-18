# AG Grid Column Settings Dialog Reference

## Component Overview
The `ColumnSettingsDialog` component provides a comprehensive configuration interface for AG Grid columns with an intuitive layout and extensive customization options.

## Layout Structure

### Main Container
- **Dialog Container**: Modal with max-width of 5xl and 650px height
- **Dialog Header**: Title "Column Settings" with toggle for Bulk Update Mode
- **Dialog Footer**: Cancel and Apply Changes buttons

### Two-Panel Layout
- **Left Panel** (25% width): Column selection list
- **Right Panel** (75% width): Tabbed settings area

## Column Selection Panel (Left Side)

### Search Area
- **Search Input**: With magnifying glass icon
- **Keyboard Navigation**: Arrow Up/Down to navigate, Enter/Space to select

### Column List
- **Column Items**:
  - Visual selection indicator (primary color left border)
  - Column name display (header or field)
  - Modified status indicator (dot + "Modified" text)
  - Info tooltip showing column details
  - Bulk selection checkbox (when in bulk mode)

## Settings Panel (Right Side)

The settings panel is organized into five tabs:

## Tab 1: Header
Controls the appearance of column headers.

| Section | Controls | Description |
|---------|----------|-------------|
| **Header Caption** | Input field | Set header text |
|  | Preview area | Shows header appearance |
| **Font Settings** | Font Family dropdown | Default, Arial, Helvetica, Times New Roman, Courier New, Verdana, Georgia |
|  | Font Size dropdown | Default, 10px, 12px, 14px, 16px, 18px, 20px |
|  | Font Weight dropdown | Default, Normal, Bold, Lighter, Bolder |
|  | Text Style buttons | Bold (B), Italic (I), Underline (U) toggles |
| **Color Settings** | Text Color toggle | Enable/disable custom text color |
|  | Text Color picker | Select custom text color |
|  | Background toggle | Enable/disable custom background |
|  | Background picker | Select custom background color |
| **Border Settings** | Apply Borders toggle | Enable/disable borders |
|  | Border Style dropdown | None, Solid, Dashed, Dotted |
|  | Border Sides dropdown | All, Top, Right, Bottom, Left |
|  | Border Width slider | 1-5px range |
|  | Border Color toggle | Enable/disable custom border color |
|  | Border Color picker | Select custom border color |

## Tab 2: Cell
Controls the appearance of cell content with similar structure to Header tab.

| Section | Controls | Description |
|---------|----------|-------------|
| **Sample Display** | Preview area | Shows sample cell value |
| **Font Settings** | Font Family dropdown | Default, Arial, Helvetica, Times New Roman, Courier New, Verdana, Georgia |
|  | Font Size dropdown | Default, 10px, 12px, 14px, 16px, 18px, 20px |
|  | Font Weight dropdown | Default, Normal, Bold, Lighter, Bolder |
|  | Text Style buttons | Bold (B), Italic (I), Underline (U) toggles |
| **Color Settings** | Text Color toggle | Enable/disable custom text color |
|  | Text Color picker | Select custom text color |
|  | Background toggle | Enable/disable custom background |
|  | Background picker | Select custom background color |
| **Border Settings** | Apply Borders toggle | Enable/disable borders |
|  | Border Style dropdown | None, Solid, Dashed, Dotted |
|  | Border Sides dropdown | All, Top, Right, Bottom, Left |
|  | Border Width slider | 1-5px range |
|  | Border Color toggle | Enable/disable custom border color |
|  | Border Color picker | Select custom border color |

## Tab 3: Formatter
Controls value display formatting with type-specific options.

| Section | Controls | Description |
|---------|----------|-------------|
| **Formatter Type** | Type dropdown | None, Number, Date, Currency, Percent, Custom |
| **Number Options** | Decimal Precision input | Number of decimal places (0-10) |
| **Date Options** | Format dropdown | MM/DD/YYYY, DD/MM/YYYY, YYYY-MM-DD, MMM DD, YYYY, DD MMM YYYY |
| **Currency Options** | Symbol dropdown | $, €, £, ¥, ₹, ₽, R$, kr, ฿, ₩ |
|  | Decimal Places input | Number of decimal places (0-10) |
|  | Symbol Position dropdown | Before ($100) or After (100$) |
| **Percent Options** | Decimal Places input | Number of decimal places (0-10) |
| **Custom Format** | Format/Examples toggle | Switch between editor and examples |
|  | Format string input | Custom format pattern |
|  | Preview value input | Value to format |
|  | Preview display | Formatted result |

### Custom Format Examples

| Example | Format String | Description |
|---------|--------------|-------------|
| Color & Conditionals | `[>0][Green]"$"#,##0.00;[<0][Red]"$"#,##0.00;$0.00` | Green for positive, red for negative |
| Status Indicators | `[=1][Green]"✓";[=0][Red]"✗";"N/A"` | Checkmark/X for boolean values |
| Score Ranges | `[>=90][#00B800]0"%";[>=70][#007C00]0"%";[#FF0000]0"%"` | Color-coded percentage ranges |
| KPI Indicators | `[>100][Green]"✓ Above Target";[=100][Blue]"= On Target";[Red]"✗ Below Target"` | Target achievement indicators |
| Simple Heatmap | `[>0.7][#009900]0"%";[>0.3][#FFCC00]0"%";[#FF0000]0"%"` | Red-yellow-green heatmap for percentages |
| Text with Values | `{value} units` | Append text to values |
| Currency with Suffix | `"$"#,##0.00" USD"` | Currency with unit suffix |
| Conditional Prefix | `[>0]"Profit: ";[<0]"Loss: ";"Break-even"` | Context-aware prefixes |

## Tab 4: Filter
Configures column filtering with type-specific options.

| Section | Controls | Description |
|---------|----------|-------------|
| **Basic Settings** | Enable Filter checkbox | Turn filtering on/off |
|  | Enable Floating Filter checkbox | Show filter in column header |
|  | Filter Type dropdown | Text, Number, Date, Set, Multi |
| **Text Filter** | Default Option dropdown | Contains, Equals, Starts With, Ends With |
|  | Case Sensitive checkbox | Enable case-sensitive filtering |
| **Number Filter** | Default Option dropdown | Equals, Not Equal, Less Than, Less Than or Equal, Greater Than, Greater Than or Equal, In Range |
|  | Allowed Characters input | Regex pattern for valid input characters |
| **Date Filter** | Default Option dropdown | Equals, Not Equal, Before, After, In Range |
|  | Browser Date Picker checkbox | Use native date picker |
|  | Min/Max Year inputs | Set valid year range |
| **Set Filter** | Select All on Mini Filter checkbox | Auto-select all when searching |
|  | Enable Search checkbox | Show search in filter popup |
| **Multi Filter** | Filter Type checkboxes | Select which filter types to include |
| **Common Settings** | Show Filter Buttons checkbox | Display action buttons in filter popup |
|  | Close on Apply checkbox | Auto-close filter popup when applied |
|  | Debounce input | Millisecond delay before applying filter changes |

## Tab 5: Editors
Configures column editing capabilities.

| Section | Controls | Description |
|---------|----------|-------------|
| **Editor Type** | Type dropdown | None, Default, Text, Select, Date |
| **Select Editor** | Value Source dropdown | CSV, JSON, REST |
|  | CSV input | Textarea for comma-separated values |
|  | JSON input | Textarea for JSON format `{"value":["val1","val2"]}` |
|  | REST URL input | Endpoint URL returning JSON with value array |
|  | Preview | Visual chips showing available options |

## Footer Controls
- **Cancel Button**: Outline style, closes dialog without saving changes
- **Apply Changes Button**: Primary style with check icon, applies all changes to the grid

## Special Features

### Bulk Update Mode
- Toggle in header enables selecting multiple columns
- Changes apply to all selected columns simultaneously
- Visual checkboxes appear in column list

### State Indicators
- Modified columns show visual indicator (dot + text)
- Selected column has distinct styling (border + highlight)
- Preview areas show current settings

### Navigation
- Keyboard support for list navigation
- Tab structure for organized settings access
- Tooltips provide additional information

## Technical Implementation Details
- Uses React hooks for state management
- Prop interface accepts GridApi, open state, and setState function
- Deep clones column definitions to avoid direct mutation
- Tracks modified state for visual feedback
- Cleans column definitions before applying to grid 