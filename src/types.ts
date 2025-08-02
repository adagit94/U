export type PrimitiveValue = string | number | boolean;

export type Variadic<T, U extends unknown[] = []> = (...args: U) => T;

export type ImmutableGetter<T> = () => Readonly<T>;

export type ConversionRecursive<Obj extends object, ValueType> = {
  [k in keyof Obj]: Obj[k] extends object ? ConversionRecursive<Obj[k], ValueType> : ValueType;
};

export type UnionValues<Obj extends object, ValueType> = {
  [k in keyof Obj]: Obj[k] | ValueType;
};

export type UnionValuesRecursive<Obj extends object, ValueType> = {
  [k in keyof Obj]: Obj[k] extends object ? ConversionRecursive<Obj[k], ValueType> : Obj[k] | ValueType;
};

export type PartialRecursive<Obj extends object> = Partial<{
  [k in keyof Obj]: Obj[k] extends object ? PartialRecursive<Obj[k]> : Obj[k];
}>;

export type RecursiveAssignment<T extends Record<PropertyKey, unknown>, U extends Record<PropertyKey, unknown>> = {
  [K in keyof Pick<T, keyof U>]: T[K] extends Record<PropertyKey, unknown>
    ? U[K] extends Record<PropertyKey, unknown>
      ? RecursiveAssignment<T[K], U[K]>
      : U[K]
    : U[K];
} & Omit<T, keyof U> &
  Omit<U, keyof T>;

export const isRecord = (x: unknown): x is Record<PropertyKey, unknown> =>
  typeof x === "object" && x !== null && !Array.isArray(x);
