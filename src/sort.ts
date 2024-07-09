import { get } from "lodash"

/**
 * @description Function sorts standard records (JS objects) and compares values of same type (number or string) under some path.
 * @param items An array of records.
 * @param keyPaths Path or paths that are used sequentialy to compare values in case of preceding comparison being equal.
 * @param order 1: ascending, -1: descending
 * @returns Sorted records.
 */
export const sortObjects = <T extends Record<string, unknown>>(
  items: T[],
  keyPaths: string | string[],
  order: 1 | -1 = 1
): T[] => {
  const paths = Array.isArray(keyPaths) ? keyPaths : [keyPaths]

  return [...items].sort((a, b) => {
    for (const path of paths) {
      const aVal = get(a, path)
      const bVal = get(b, path)

      if (aVal === bVal) continue

      if (typeof aVal === "string" && typeof bVal === "string") {
        const comparison = aVal.localeCompare(bVal)

        if (comparison !== 0) return comparison * order
      } else if (typeof aVal === "number" && typeof bVal === "number") {
        if (aVal < bVal) return -1 * order
        if (aVal > bVal) return 1 * order
      }
    }

    return 0
  })
}

/**
 * @description Function sorts standard records (JS objects) and compares values of same type (number or string) under some path.
 * @param items An array of records.
 * @param keyPaths Path or paths that are used sequentialy to compare values in case of preceding comparison being equal.
 * @returns Sorted records.
 */
export const sortObjectsAsc = <T extends Record<string, unknown>>(
  items: T[],
  keyPaths: string | string[]
): T[] => sortObjects(items, keyPaths)

/**
 * @description Function sorts standard records (JS objects) and compares values of same type (number or string) under some path.
 * @param items An array of records.
 * @param keyPaths Path or paths that are used sequentialy to compare values in case of preceding comparison being equal.
 * @returns Sorted records.
 */
export const sortObjectsDesc = <T extends Record<string, unknown>>(
  items: T[],
  keyPaths: string | string[]
): T[] => sortObjects(items, keyPaths, -1)

/**
 * @description Function converts values to strings and then sorts them.
 * @param items Items to sort.
 * @param order 1: ascending, -1: descending
 * @returns Sorted array.
 */
export const sortAsStrings = <T>(items: T[], order: 1 | -1 = 1) => {
  return [...items].sort((a, b) => {
    const aString = String(a)
    const bString = String(b)

    return aString.localeCompare(bString) * order
  })
}

/**
 * @description Function converts values to numbers and then sorts them.
 * @param items Items to sort.
 * @param order 1: ascending, -1: descending
 * @returns Sorted array.
 */
export const sortAsNumbers = <T>(items: T[], order: 1 | -1 = 1) => {
  return [...items].sort((a, b) => {
    const aNum = Number(a)
    const bNum = Number(b)

    return (aNum - bNum) * order
  })
}
