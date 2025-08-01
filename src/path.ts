import { isRecord } from "types.js";

export const changeIndex = <T>(items: T[], currentIndex: number, newIndex: number) => {
  items = [...items];

  const item = items[currentIndex];

  items.splice(currentIndex, 1);
  items.splice(newIndex > currentIndex ? newIndex - 1 : newIndex, 0, item);

  return items;
};

export const addAtIndex = <T>(items: T[], item: T, index: number) => {
  items = [...items];

  items.splice(index, 0, item);

  return items;
};

export const replaceAtIndex = <T>(items: T[], item: T, index: number) => {
  items = [...items];

  items.splice(index, 1, item);

  return items;
};

export const walkPath = (obj: Record<string | number, unknown>, path: (string | number)[], destinationOnly = true) => {
  let value: unknown = obj;
  let i = 0;

  while (i < path.length) {
    const pathSegment = path[i];

    if (isRecord(value) && Object.hasOwn(value, pathSegment)) {
      value = value[pathSegment];
      i++
    } else {
      if (destinationOnly) value = undefined;
      break;
    }
  }

  const walkedPath = path.slice(0, i);

  return { value, walkedPath, destinationReached: walkedPath.length === path.length };
};
