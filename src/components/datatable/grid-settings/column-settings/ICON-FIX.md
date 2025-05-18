# Icon Import Error Fix

## Issue
The app was crashing with:
```
Uncaught SyntaxError: The requested module '/node_modules/.vite/deps/lucide-react.js?v=36cc4661' 
does not provide an export named 'BorderAll'
```

## Cause
The lucide-react library doesn't include specific border icons like:
- BorderAll
- BorderTop
- BorderRight
- BorderBottom
- BorderLeft

## Solution
1. Replaced non-existent icons with available alternatives:
   - BorderAll → Square (for all borders)
   - BorderTop → Created custom visual using Square with overlay
   - BorderRight → Created custom visual using Square with overlay
   - BorderBottom → Created custom visual using Square with overlay
   - BorderLeft → Created custom visual using Square with overlay
   - InfoIcon → Info (corrected name)

2. For border side selection, switched from icon buttons to a dropdown:
   - More accessible
   - Cleaner UI
   - Better mobile experience

3. For border style preview, replaced unicode characters with React components:
   - Solid: `<div className="w-12 h-0.5 bg-current"></div>`
   - Dashed: `<div className="w-12 h-0.5 border-t-2 border-dashed border-current"></div>`
   - Dotted: `<div className="w-12 h-0.5 border-t-2 border-dotted border-current"></div>`

## Available Icons in lucide-react
For future reference, here are the commonly used icons that ARE available:
- Square, Circle, Triangle (basic shapes)
- Info, AlertTriangle, CheckCircle (status icons)
- Settings, Cog, Sliders (configuration icons)
- Eye, EyeOff (visibility toggles)
- Plus, Minus, X (actions)
- ChevronUp, ChevronDown, ChevronLeft, ChevronRight (navigation)
- Bold, Italic, Underline (text formatting)
- Type, Font (typography)
- Palette (colors)
- Grid, Layout (layout)

## Testing
After the fix:
1. The Column Settings dialog should open without errors
2. Header tab should display with all functionality intact
3. Border side selection uses a dropdown instead of icon buttons
4. All other styling options work as expected