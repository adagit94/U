import { isEqual } from "lodash";

export const filterDuplicities = <T>(items: T[]) => {
  let registeredItems: T[] = [];

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const isRegistered = registeredItems.some((registeredItem) => isEqual(registeredItem, item));

    if (!isRegistered) {
        registeredItems.push(item)
    }
  }

  return registeredItems;
};
