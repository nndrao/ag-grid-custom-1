import { themeQuartz } from "ag-grid-community";

// Create a custom AG Grid theme with Roboto as the default font
export const customTheme = themeQuartz.withParams({
  fontFamily: {
    family: "Roboto",
    weight: "400",
    size: "14px",
  },
  fontSize: 14,
  headerFontFamily: {
    family: "Roboto",
    weight: "500",
    size: "14px",
  },
  headerFontSize: 14,
  headerFontWeight: 500,
  cellFontFamily: {
    family: "Roboto",
  },
  subHeaderFontFamily: {
    family: "Roboto",
    weight: "400",
  },
  footerFontFamily: {
    family: "Roboto",
    weight: "400",
  },
  // Add other theme parameters as needed
});

// Export CSS variables that can be used in component styling
export const gridFontStyles = {
  "--ag-font-family": "'Roboto', sans-serif",
  "--ag-font-size": "14px",
  "--ag-header-font-family": "'Roboto', sans-serif",
  "--ag-header-font-weight": "500",
  "--ag-header-font-size": "14px",
  "--ag-cell-font-family": "'Roboto', sans-serif",
  "--ag-data-font-family": "'Roboto', sans-serif",
}; 