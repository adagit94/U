/**
 * @description Iterates recursively object structures and triggers passed function for every value along the way.
 * @param obj An array or record object from which recursion starts.
 * @param fn Function that is triggered for every value.
 */
export const recurseObjects = (
    obj: object,
    fn: (key: string | number, val: unknown, obj: object) => void
  ) => {
    if (Array.isArray(obj)) {
      obj.forEach((item, index) => {
        fn(index, item, obj)
  
        if (typeof item === "object" && item !== null) {
          recurseObjects(item, fn)
        }
      })
    } else if (typeof obj === "object" && obj !== null) {
      Object.entries(obj).forEach(([key, val]) => {
        fn(key, val, obj)
  
        if (typeof val === "object" && val !== null) {
          recurseObjects(val, fn)
        }
      })
    }
  }

  /**
   * @description Function iterates passed array and triggers function related to given step interval at appropriate index.
   * @param arr An array of values.
   * @param steps Tuple with first element being step after which function passed as second element would be triggered.
   * @param start First index from which iteration starts.
   */
export const handleSteps = <T>(arr: T[], steps: [number, (value: T, index: number, step: number) => void][], start = 0) => {
    for (let i = start; i < arr.length; i++) {
        for (const [step, fn] of steps) {
            if (i % step === 0) fn(arr[i], i, step)
        }
    }
}