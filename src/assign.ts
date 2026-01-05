import { isRecord } from "assert.js";
import { RecursiveAssignment } from "types.js";

export function assign<T extends Record<PropertyKey, unknown>, U extends Record<PropertyKey, unknown>>(
  o1: T,
  o2: U
): Omit<T, keyof U> & U {
  return Object.assign({}, o1, o2);
}

export function assign3<
  T extends Record<PropertyKey, unknown>,
  U extends Record<PropertyKey, unknown>,
  V extends Record<PropertyKey, unknown>
>(o1: T, o2: U, o3: V): Omit<T, keyof U | keyof V> & (Omit<U, keyof V> & V) {
  return Object.assign({}, o1, o2, o3);
}

export function assign4<
  T extends Record<PropertyKey, unknown>,
  U extends Record<PropertyKey, unknown>,
  V extends Record<PropertyKey, unknown>,
  W extends Record<PropertyKey, unknown>
>(
  o1: T,
  o2: U,
  o3: V,
  o4: W
): Omit<T, keyof U | keyof V | keyof W> & (Omit<U, keyof V | keyof W> & (Omit<V, keyof W> & W)) {
  return Object.assign({}, o1, o2, o3, o4);
}

export function deepAssign<T extends Record<PropertyKey, unknown>, U extends Record<PropertyKey, unknown>>(
  o1: T,
  o2: U
): RecursiveAssignment<T, U> {
  const keys = new Set<keyof T | keyof U>([...Object.keys(o1), ...Object.keys(o2)]);
  let obj: Record<PropertyKey, unknown> = {};

  for (const key of keys) {
    if (key in o1 && key in o2) {
      if (isRecord(o1[key]) && isRecord(o2[key])) {
        const x = o1[key] as T[keyof T] & Record<PropertyKey, unknown>;
        const y = o2[key] as U[keyof U] & Record<PropertyKey, unknown>;

        obj[key] = deepAssign(x, y);
      } else {
        obj[key] = o2[key];
      }
    } else if (key in o1) {
      obj[key] = o1[key];
    } else if (key in o2) {
      obj[key] = o2[key];
    }
  }

  return obj as RecursiveAssignment<T, U>;
}
