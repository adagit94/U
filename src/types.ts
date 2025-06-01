export type PrimitiveValue = string | number | boolean;

export type Variadic<T, U extends unknown[] = []> = (...args: U) => T;

export type ImmutableGetter<T> = () => Readonly<T>;

export type ConversionRecursive<Obj extends object, ValueType> = {
    [k in keyof Obj]: Obj[k] extends object ? ConversionRecursive<Obj[k], ValueType> : ValueType
}

export type UnionValues<Obj extends object, ValueType> = {
    [k in keyof Obj]: Obj[k] | ValueType
}

export type UnionValuesRecursive<Obj extends object, ValueType> = {
    [k in keyof Obj]: Obj[k] extends object
        ? ConversionRecursive<Obj[k], ValueType>
        : Obj[k] | ValueType
}

export type PartialRecursive<Obj extends object> = Partial<{
    [k in keyof Obj]: Obj[k] extends object ? PartialRecursive<Obj[k]> : Obj[k]
}>