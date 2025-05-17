/**
 * Efficient object comparison utilities
 */

/**
 * Shallow equality comparison for simple objects
 */
export function shallowEqual(obj1: any, obj2: any): boolean {
  if (obj1 === obj2) return true;
  
  if (!obj1 || !obj2) return false;
  
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  
  if (keys1.length !== keys2.length) return false;
  
  for (const key of keys1) {
    if (obj1[key] !== obj2[key]) return false;
  }
  
  return true;
}

/**
 * Deep equality comparison optimized for grid settings
 * Handles circular references and functions properly
 */
export function deepEqual(obj1: any, obj2: any, seen = new WeakSet()): boolean {
  // Handle primitive types and null/undefined
  if (obj1 === obj2) return true;
  
  if (obj1 === null || obj2 === null) return false;
  if (obj1 === undefined || obj2 === undefined) return false;
  
  // Handle different types
  const type1 = typeof obj1;
  const type2 = typeof obj2;
  
  if (type1 !== type2) return false;
  
  // Handle functions (compare by reference only)
  if (type1 === 'function') return obj1 === obj2;
  
  // Handle non-object types
  if (type1 !== 'object') return obj1 === obj2;
  
  // Handle arrays
  if (Array.isArray(obj1)) {
    if (!Array.isArray(obj2)) return false;
    if (obj1.length !== obj2.length) return false;
    
    for (let i = 0; i < obj1.length; i++) {
      if (!deepEqual(obj1[i], obj2[i], seen)) return false;
    }
    
    return true;
  }
  
  // Handle circular references
  if (seen.has(obj1) || seen.has(obj2)) {
    return obj1 === obj2;
  }
  
  seen.add(obj1);
  seen.add(obj2);
  
  // Handle objects
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  
  if (keys1.length !== keys2.length) return false;
  
  for (const key of keys1) {
    if (!keys2.includes(key)) return false;
    if (!deepEqual(obj1[key], obj2[key], seen)) return false;
  }
  
  return true;
}

/**
 * Optimized comparison for grid options
 * Skip function comparisons and handle special AG-Grid properties
 */
export function compareGridOptions(option1: any, option2: any): boolean {
  // Handle null/undefined
  if (option1 === option2) return true;
  if (!option1 || !option2) return false;
  
  // For functions, compare by reference
  if (typeof option1 === 'function' || typeof option2 === 'function') {
    return option1 === option2;
  }
  
  // For primitives
  if (typeof option1 !== 'object' || typeof option2 !== 'object') {
    return option1 === option2;
  }
  
  // For objects, use shallow comparison for performance
  // Grid options typically don't have deeply nested structures
  return shallowEqual(option1, option2);
}

/**
 * Fast hash function for object comparison caching
 */
export function objectHash(obj: any): string {
  if (obj === null) return 'null';
  if (obj === undefined) return 'undefined';
  
  const type = typeof obj;
  
  if (type !== 'object') {
    return `${type}:${obj}`;
  }
  
  if (Array.isArray(obj)) {
    return `array:${obj.length}:${obj.slice(0, 3).join(',')}`;
  }
  
  const keys = Object.keys(obj).sort();
  return `object:${keys.length}:${keys.slice(0, 3).join(',')}`;
}