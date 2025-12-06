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

/**
@description
A utility type that converts specific properties (some or all) of first record to value types defined in second one.

@example
type Rec = RecordConversion<{ a: number; b: string }, { b: number }> // { a: number; b: number }
*/
export type RecordConversion<T extends Record<PropertyKey, unknown>, U extends { [K in keyof T]?: unknown }> = Omit<
  T,
  keyof U
> &
  U;

/**
@description
A utility type that makes just specific properties of first record optional.

@example
type Rec = RecordOptionals<{ a: number; b: string }, "b"> // { a: number; b?: string }
*/
export type RecordOptionals<T extends Record<PropertyKey, unknown>, U extends keyof T> = Omit<T, U> &
  Partial<Pick<T, U>>;

type SafeResultSuccess<T> = {
  success: true;
  data: T;
};

type SafeResultFailure = {
  success: false;
  error: unknown;
};

export type SafeResult<T> = SafeResultSuccess<T> | SafeResultFailure;


