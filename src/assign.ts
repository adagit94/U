import { isRecord } from "types.js";

export function assign2<T extends Record<PropertyKey, unknown>, U extends Record<PropertyKey, unknown>>(
  o1: T,
  o2: U
): Omit<T, keyof U> & U {
  return Object.assign({}, o1, o2);
}

export function assign3<
  T extends Record<PropertyKey, unknown>,
  U extends Record<PropertyKey, unknown>,
  V extends Record<PropertyKey, unknown>
>(o1: T, o2: U, o3: V): Omit<T, keyof (U | V)> & (Omit<U, keyof V> & V) {
  return Object.assign({}, o1, o2, o3);
}

export function assign4<
  T extends Record<PropertyKey, unknown>,
  U extends Record<PropertyKey, unknown>,
  V extends Record<PropertyKey, unknown>,
  W extends Record<PropertyKey, unknown>
>(o1: T, o2: U, o3: V, o4: W): Omit<T, keyof (U | V | W)> & (Omit<U, keyof (V | W)> & (Omit<V, keyof W> & W)) {
  return Object.assign({}, o1, o2, o3, o4);
}

export function deepAssign<
  T extends Record<PropertyKey, unknown>,
  U extends Record<PropertyKey, unknown>
>(o1: T, o2: U): RecursiveAssignment<T, U> {
  const keys = new Set([...Object.keys(o1), ...Object.keys(o2)])
  let obj = {}

  for (const key of keys) {
    if (key in o1 && key in o2) {
      if (isRecord(o1) && isRecord(o2)) {
        
      }
    }
  }
}
