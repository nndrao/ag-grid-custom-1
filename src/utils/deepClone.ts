// Utility to deep clone objects using JSON methods
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}
