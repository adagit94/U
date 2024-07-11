/**
 * @description Iterates recursively object structures and triggers passed function for every value along the way.
 * @param obj An array or record object from which recursion starts.
 * @param fn Function that is triggered for every value.
 */
export const recurseObject = (
  obj: object,
  fn: (
    key: string | number,
    val: unknown,
    obj: object,
    keyPath: (string | number)[]
  ) => void
) => {
  ;(function recurse(obj: object, keyPath: (string | number)[] = []) {
    if (Array.isArray(obj)) {
      obj.forEach((item, index) => {
        const kp = [...keyPath, index]

        fn(index, item, obj, kp)

        if (typeof item === "object" && item !== null) {
          recurse(item, kp)
        }
      })
    } else if (typeof obj === "object" && obj !== null) {
      Object.entries(obj).forEach(([key, val]) => {
        const kp = [...keyPath, key]

        fn(key, val, obj, kp)

        if (typeof val === "object" && val !== null) {
          recurse(val, kp)
        }
      })
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
