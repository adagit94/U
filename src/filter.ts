import { get } from "lodash";

export const difference = <T>(a: T[], b: T[], comparator = (a: T, b: T) => a === b): T[] =>
  a.filter((item) => !b.some((item2) => comparator(item, item2)));

export const differenceByPath = <T>(a: T[], b: T[], keyPath: string | string[]): T[] =>
  difference(a, b, (item, item2) => get(item, keyPath) === get(item2, keyPath));

export const intersection = <T>(a: T[], b: T[], comparator = (a: T, b: T) => a === b): T[] =>
  a.filter((item) => b.some((item2) => comparator(item, item2)));

export const intersectionByPath = <T>(a: T[], b: T[], keyPath: string | string[]): T[] =>
  intersection(a, b, (item, item2) => get(item, keyPath) === get(item2, keyPath));

export const filterDuplicities = <T>(items: T[], comparator = (a: T, b: T) => a === b) => {
  let registeredItems: T[] = [];

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const isRegistered = registeredItems.some((registeredItem) => comparator(registeredItem, item));

    if (!isRegistered) {
        registeredItems.push(item)
    }
  }

  return registeredItems;
};
