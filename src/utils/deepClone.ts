/**
 * Deep clone utility using Lodash's cloneDeep
 * This properly handles functions, dates, regexps, and other special objects
 */
import cloneDeep from 'lodash/cloneDeep';

export function deepClone<T>(obj: T): T {
  return cloneDeep(obj);
}
