/**
 * @description Iterates recursively object structures and triggers passed function for every value along the way.
 * @param obj An array or record object from which recursion starts.
 * @param func Function that is triggered for every value. Return true to indicate that recursion should terminate.
 */
export const recurseObject = (
  obj: object,
  func: (
      key: string | number,
      val: unknown,
      obj: object,
      keyPath: (string | number)[]
  ) => boolean | void
) => {
  ;(function recurse(obj: object, keyPath: (string | number)[] = []): boolean | void {
      if (Array.isArray(obj)) {
          for (let i = 0; i < obj.length; i++) {
              const item = obj[i]
              const kp = [...keyPath, i]
              const terminate = func(i, item, obj, kp)

              if (terminate) return true

              if (Array.isArray(item) || (typeof item === "object" && item !== null)) {
                  const terminate = recurse(item, kp)

                  if (terminate) return true
              }
          }
      } else {
          const entries = Object.entries(obj)

          for (const [key, val] of entries) {
              const kp = [...keyPath, key]
              const terminate = func(key, val, obj, kp)

              if (terminate) return true

              if (Array.isArray(val) || (typeof val === "object" && val !== null)) {
                  const terminate = recurse(val, kp)

                  if (terminate) return true
              }
          }
      }
  })(obj)
}

export const searchForDuplicities = (
  obj: Record<PropertyKey, unknown> | unknown[],
  { key = "id" }: Partial<{ key: string }> = {}
) => {
  let entities: Record<string, unknown[]> = {}
  let duplicities: Record<string, unknown[]> = {}

  recurseObject(obj, (k, v, o) => {
    if (k === key && (typeof v === "string" || typeof v === "number")) {
      const entry = entities[v]

      if (Array.isArray(entry)) {
        entry.push(o)
        duplicities[v] = entry
      } else {
        entities[v] = [o]
      }
    }
  })

  return duplicities
}

export function matchValues<T>(
  obj: Record<PropertyKey, unknown> | unknown[],
  searchKey: string,
  values: T[],
  comparator: (value: T, objValue: unknown) => boolean
): [T, unknown, object][] {
  let entities: [T, unknown, object][] = []

  recurseObject(obj, (key, val, obj) => {
      if (key !== searchKey) return

      const value = values.find((value) => comparator(value, val))

      if (value === undefined) return

      entities.push([value, val, obj])
  })

  return entities
}

/**
 * @description Function iterates passed array and triggers function related to given step interval at appropriate index.
 * @param arr An array of values.
 * @param steps Tuple with first element being step after which function passed as second element would be triggered.
 * @param start First index from which iteration starts.
 */
export const stepArray = <T>(
  arr: T[],
  steps: [number, (value: T, index: number, step: number) => void][],
  start = 0
) => {
  for (let i = start; i < arr.length; i++) {
    for (const [step, fn] of steps) {
      if (i % step === 0) fn(arr[i], i, step)
    }
  }
}

/**
 * @description Function iterates passed arrays and triggers function related to given step interval at appropriate index.
 * @param arrs An array of arrays with values.
 * @param steps Tuple with first element being step after which function passed as second element would be triggered.
 * @param start First index from which iteration starts.
 */
export const stepArrays = <T extends unknown[]>(
  arrs: T[],
  steps: [number, (values: T[number][], index: number, step: number) => void][],
  start = 0
) => {
  const longestArrLength = arrs.reduce(
    (length, arr) => (arr.length > length ? arr.length : length),
    0
  )

  for (let i = start; i < longestArrLength; i++) {
    let values: T[number][] | undefined

    for (const [step, fn] of steps) {
      if (i % step === 0) {
        values ?? (values = arrs.map((arr) => arr[i]))

        fn(values, i, step)
      }
    }
  }
}
