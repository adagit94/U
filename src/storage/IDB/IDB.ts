import Monitor from "utils/Monitor";
import IdbUtils from "./IDBUtils.js";

type DataItem = { id: string | number; [k: string]: unknown };
export type Data = DataItem | DataItem[];
type CreateStoreOptionals = Partial<{
  data: Data;
}>;

export default class IDB {
  static #NAME = "_idb";
  static #db: IDBDatabase;

  static #openConnection(onUpgradeNeeded?: (e: IDBVersionChangeEvent) => void): Promise<IDBOpenDBRequest> {
    const connection = window.indexedDB.open(IDB.#NAME, this.#db ? this.#db.version + 1 : undefined);

    return new Promise((resolve, reject) => {
      connection.onsuccess = () => {
        this.#db = connection.result;
        resolve(connection);
      };

      connection.onerror = () => {
        reject(new Error("Inicialization of Indexed DB connection failed."));
      };

      if (onUpgradeNeeded) connection.onupgradeneeded = onUpgradeNeeded;
    });
  }

  static #openStoreTransaction(name: string, mode: IDBTransactionMode = "readwrite") {
    const transaction = this.#db.transaction(name, mode).objectStore(name);

    return transaction;
  }

  public static init = async () => {
    if (window.indexedDB && !this.#db) {
      await this.#openConnection().catch((err) => {
        Monitor.error(err, undefined, false);
      });
    }
  };

  public static storeExists(name: string): boolean {
    return this.#db.objectStoreNames.contains(name);
  }

  public static async createStore(name: string, optionals?: CreateStoreOptionals): Promise<IDBObjectStore> {
    this.#db.close();

    const store: IDBObjectStore = await new Promise((resolve) => {
      let store: IDBObjectStore;

      this.#openConnection((e) => {
        store = (e.target as any).result.createObjectStore(name, {
          keyPath: "id",
        });
      }).then(async () => {
        const data = optionals?.data;

        if (data) {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          await IdbUtils.setDataItems(this.#openStoreTransaction(name), "add", data!);
        }

        resolve(store);
      });
    });

    return store;
  }

  public static async deleteStore(name: string): Promise<undefined> {
    this.#db.close();

    return new Promise((resolve) => {
      this.#openConnection(() => {
        this.#db.deleteObjectStore(name);
      }).then(() => resolve(undefined));
    });
  }

  public static get<T = DataItem>(storeName: string, id?: string | number): Promise<T & { id: string | number }> {
    const store = this.#openStoreTransaction(storeName, "readonly");
    const req = id === undefined ? store.getAll() : store.get(id);

    return new Promise((resolve) => {
      req.onsuccess = () => {
        resolve(req.result);
      };
    });
  }

  public static put(data: Data, storeName: string): Promise<IDBValidKey> {
    return new Promise((resolve) => {
      IdbUtils.setDataItems(this.#openStoreTransaction(storeName), "put", data).then(resolve);
    });
  }

  public static delete(id: string | number, storeName: string): Promise<undefined> {
    let store = this.#openStoreTransaction(storeName);

    return new Promise((resolve) => {
      store.delete(id).onsuccess = () => {
        resolve(undefined);
      };
    });
  }

  public static clear(storeName: string): Promise<undefined> {
    let store = this.#openStoreTransaction(storeName);

    return new Promise((resolve) => {
      store.clear().onsuccess = () => {
        resolve(undefined);
      };
    });
  }
}
