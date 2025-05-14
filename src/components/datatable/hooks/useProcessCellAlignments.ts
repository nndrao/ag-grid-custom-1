/**
 * Utility function to process vertical and horizontal alignment settings 
 * and generate the appropriate cellStyle function
 */
export function processCellAlignments(defaultColDef: any): any {
  if (!defaultColDef) return defaultColDef;
  
  // Clone the defaultColDef to avoid mutation issues
  const colDef = { ...defaultColDef };
  
  // Extract alignment properties
  const verticalAlign = colDef.verticalAlign as 'start' | 'center' | 'end' | undefined;
  const horizontalAlign = colDef.horizontalAlign as 'left' | 'center' | 'right' | undefined;
  
  // Only create cellStyle if at least one alignment is specified
  if (verticalAlign || horizontalAlign) {
    // Create a function that returns the style object
    colDef.cellStyle = () => {
      const styleObj: any = { display: 'flex' };
      
      // Add vertical alignment
      if (verticalAlign) {
        styleObj.alignItems = verticalAlign;
      }
      
      // Add horizontal alignment
      if (horizontalAlign) {
        switch (horizontalAlign) {
          case 'left':
            styleObj.justifyContent = 'flex-start';
            break;
          case 'center':
            styleObj.justifyContent = 'center';
            break;
          case 'right':
            styleObj.justifyContent = 'flex-end';
            break;
        }
      }
      
      return styleObj;
    };
  } else {
    // If both alignments are unset, remove the cellStyle function
    delete colDef.cellStyle;
  }
  
  return colDef;
}
