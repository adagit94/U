export const extract = <T extends Record<string, unknown>, U extends keyof T>(
  source: T,
  ...keys: U[]
): {
  [K in U]: T[K];
} => {
  return keys.reduce(
    (acc, key) => {
      acc[key] = source[key];
      return acc
    },
    {} as {
      [K in U]: T[K];
    },
  );
};