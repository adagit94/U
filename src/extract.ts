import { get } from "lodash";

export const disjoint = <T>(a: T[], b: T[], comparator: (a: T, b: T) => boolean): T[] =>
  a.filter((item) => !b.some((item2) => comparator(item, item2)));

export const disjointByPath = <T>(a: T[], b: T[], keyPath: string | string[]): T[] =>
  disjoint(a, b, (item, item2) => get(item, keyPath) === get(item2, keyPath));
