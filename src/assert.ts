export const isNumber = (x: unknown): x is number =>
  x !== undefined && x !== null && !Number.isNaN(x) && typeof x === "number";

export const isPlainObject = (x: unknown): x is Record<PropertyKey, unknown> =>
  typeof x === "object" && x !== null && !Array.isArray(x);