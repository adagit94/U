export const isNumber = (x: unknown): x is number =>
  x !== undefined && x !== null && !Number.isNaN(x) && typeof x === "number";

export const isObject = (x: unknown): x is object =>
  typeof x === "object" && x !== null;

export const isRecord = (x: unknown): x is Record<PropertyKey, unknown> =>
  isObject(x) && !Array.isArray(x);