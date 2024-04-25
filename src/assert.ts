export const isNumber = (x: unknown): x is number =>
    x !== undefined && x !== null && !Number.isNaN(x) && typeof x === "number"