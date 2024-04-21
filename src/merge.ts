/**
 * @description TS Extension of builtin Object.assign supporting types for any number of passed objects.
 * @param objects List of objects that should be merged into new object reference.
 * @returns New object reference with all properties from passed objects and with values overwritten in order objects were passed.
 */
export const mergeObjects = <T extends Record<string | number, unknown>[]>(
  ...objects: T
): { [rec in T[number] as keyof rec]: rec[keyof rec] } =>
  Object.assign({}, ...objects)
