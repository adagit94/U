import { Data } from "./Idb.js";

export default class IdbUtils {
  static async setDataItems(store: IDBObjectStore, operation: "add" | "put", data: Data) {
    const items = Array.isArray(data) ? data : [data];
    let promises: Promise<IDBValidKey>[] = [];

    for (const item of items) {
      const req = store[operation](item);

      promises.push(
        new Promise((resolve) => {
          req.onsuccess = () => {
            resolve(req.result);
          };
        })
      );
    }

    const keys = await Promise.all(promises);

    return keys;
  }
}
