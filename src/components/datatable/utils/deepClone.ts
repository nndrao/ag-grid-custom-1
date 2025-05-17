/**
 * Efficient cloning utility for specific object types
 * Uses shallow copying where possible and structured cloning for complex objects
 */

/**
 * Shallow clone for simple objects and arrays
 */
export function shallowClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return [...obj] as unknown as T;
  }
  
  return { ...obj };
}

/**
 * Structured clone for complex objects
 * Note: Does not work with functions, DOM nodes, or certain objects
 */
export function structuredClone<T>(obj: T): T {
  if (typeof window !== 'undefined' && 'structuredClone' in window) {
    // Use native structuredClone if available
    return window.structuredClone(obj);
  }
  
  // Fallback to JSON parse/stringify (limited but fast)
  try {
    return JSON.parse(JSON.stringify(obj));
  } catch (error) {
    console.warn('Failed to clone object, returning shallow clone:', error);
    return shallowClone(obj);
  }
}

/**
 * Deep clone replacement with optimized strategy
 * Uses different strategies based on the object type
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  // For grid options, use structured clone as they don't contain functions
  if ('defaultColDef' in obj || 'columnDefs' in obj) {
    return structuredClone(obj);
  }
  
  // For simple objects and arrays, use shallow clone
  return shallowClone(obj);
}

/**
 * Merge grid options efficiently without deep cloning
 */
export function mergeGridOptions(base: any, custom: any): any {
  if (!custom) return base;
  
  const merged = { ...base };
  
  Object.keys(custom).forEach(key => {
    const customValue = custom[key];
    
    if (customValue === undefined) return;
    
    if (Array.isArray(customValue)) {
      // Arrays are replaced entirely
      merged[key] = customValue;
    } else if (typeof customValue === 'object' && customValue !== null) {
      // For objects, shallow merge
      merged[key] = { ...(base[key] || {}), ...customValue };
    } else {
      // Primitives and functions are replaced
      merged[key] = customValue;
    }
  });
  
  return merged;
}