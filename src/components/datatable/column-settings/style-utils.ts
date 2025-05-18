/**
 * Style utilities and constants for the column settings dialog
 */

// Standard heights for form controls
export const FORM_CONTROL_HEIGHTS = {
  // Standard height for inputs, selects, and buttons
  standard: "h-9",
  
  // Smaller height for compact controls
  compact: "h-8",
  
  // Icon sizes
  icon: {
    small: "h-3 w-3",
    medium: "h-4 w-4",
    large: "h-5 w-5"
  },
  
  // Special heights
  colorPicker: "h-9",
  toggleGroup: "h-9"
};

// Standard text sizes
export const TEXT_SIZES = {
  standard: "text-sm",
  small: "text-xs",
  tiny: "text-[10px]"
};

// Combine common control classes
export const getControlClasses = (compact = false) => 
  `${compact ? FORM_CONTROL_HEIGHTS.compact : FORM_CONTROL_HEIGHTS.standard} ${compact ? TEXT_SIZES.small : TEXT_SIZES.standard}`;

// Export combined classes for different control types
export const INPUT_CLASSES = getControlClasses(true);
export const SELECT_CLASSES = getControlClasses(true);
export const BUTTON_CLASSES = getControlClasses(true);

// Form layout classes for consistent alignment
export const FORM_LAYOUT = {
  // Form group with consistent spacing
  group: "mb-3 last:mb-0",
  
  // Form control row for horizontal alignment
  row: "flex items-end gap-3",
  
  // Form field with label that maintains consistent spacing
  field: "flex flex-col",
  
  // Label with consistent spacing
  label: "text-xs mb-1.5 block",
  
  // Grid layout for form fields
  grid: "grid gap-3",
  grid2: "grid grid-cols-2 gap-3",
  grid3: "grid grid-cols-3 gap-3",
  
  // Flex container for controls
  controls: "flex items-center gap-2"
}; 