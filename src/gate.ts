export const xor = (...booleans: boolean[]) => {
  const result = booleans.reduce<[boolean, boolean]>(
    (result, bool) => [bool === false ? true : result[0], bool === true ? true : result[1]],
    [false, false]
  )

  return result[0] && result[1]
}

