import {
  InputDataManagerState,
  InputLoaderData,
  InputLoaderOptionals,
  ObjectInputDataManager,
} from "dataManagment/dataManagers/inputDataManagers";
import { IDataLoader, PagerStateBase } from "dataManagment/DataManagmentTypes";
import OffsetPager, { OffsetPagerAdvanceInfo, OffsetPagerState } from "dataManagment/pagers/OffsetPager";
import { describe, expect, test } from "vitest";

type ObjectDataItem = { value: number; display: string };

type Loader = IDataLoader<
  InputDataManagerState<ObjectDataItem, PagerStateBase>,
  [OffsetPagerAdvanceInfo, InputLoaderData<ObjectDataItem>, InputLoaderOptionals<number>]
>;

describe("ObjectDataManager", () => {
  let delay = 0;

  const pager = new OffsetPager({ take: 10 });
  const loader: Loader = {
    load: ({ skip, take }, { baseData }, { search, reqTotalCount, missingItemsForValues }) => {
      let sourceDataSet: ObjectDataItem[] = [];

      for (let i = 1; i <= 20; i++) {
        sourceDataSet.push({ value: i, display: `item${i}` });
      }

      if (missingItemsForValues) {
        return {
          data: sourceDataSet.filter(({ value }) => missingItemsForValues.includes(value)),
        };
      } else {
        const dataBatch = (
          search ? sourceDataSet.filter(({ display }) => display.includes(search)) : sourceDataSet
        ).slice(skip, skip + take);

        const newState = {
          data: skip > 0 ? [...baseData, ...dataBatch] : dataBatch,
          exhausted: OffsetPager.finished(dataBatch.length, take),
          totalCount: reqTotalCount ? sourceDataSet.length : undefined,
        };

        return delay
          ? new Promise((resolve) => {
              setTimeout(() => {
                resolve(newState);
              }, delay);
            })
          : newState;
      }
    },
  };

  const dataManager = new ObjectInputDataManager<
    ObjectDataItem,
    number,
    OffsetPagerState,
    OffsetPagerAdvanceInfo,
    OffsetPager,
    Loader
  >(pager, loader, { valueKey: "value" });

  test("state synchronization", async () => {
    await dataManager.init({ reqTotalCount: true });

    expect(dataManager.getData().length).toBe(10);
    expect(dataManager.getState().exhausted).toBe(false);
    expect(dataManager.getState().totalCount).toBe(20);

    await dataManager.advance().result;

    expect(dataManager.getData().length).toBe(20);

    await dataManager.advance().result;

    expect(dataManager.getState().exhausted).toBe(true);

    await dataManager.filter("item11", { reqTotalCount: true });

    expect(dataManager.getData().length).toBe(1);
    expect(dataManager.getState().exhausted).toBe(true);
    expect(dataManager.getState().totalCount).toBe(20);
  });

  describe("queueing", () => {
    test("ordering", async () => {
      dataManager.reset();

      let promises: Promise<boolean>[] = [];

      delay = 200;

      promises.push(dataManager.advance().result);

      delay = 100;

      promises.push(dataManager.advance().result);

      await Promise.all(promises)

      expect(dataManager.getData().length).toBe(20);
      expect(dataManager.getData()[0].display).toBe("item1");
    });
  });

  test("missing items", async () => {
    delay = 0;

    dataManager.reset();
    await dataManager.sync(1);

    expect(dataManager.getData().length).toBe(1);
    expect(dataManager.getData()[0]).toEqual({ value: 1, display: "item1" });
    expect(dataManager.getState().data.length).toBe(0);

    await dataManager.sync([1, 2]);

    expect(dataManager.getData().length).toBe(2);
    expect(dataManager.getData()).toEqual([
      { value: 1, display: "item1" },
      { value: 2, display: "item2" },
    ]);
    expect(dataManager.getState().data.length).toBe(0);

    dataManager.reset();

    expect(dataManager.getData().length).toBe(2);
    expect(dataManager.getData()).toEqual([
      { value: 1, display: "item1" },
      { value: 2, display: "item2" },
    ]);
    expect(dataManager.getState().data.length).toBe(0);

    await dataManager.sync(1);

    expect(dataManager.getData().length).toBe(1);
    expect(dataManager.getData()[0]).toEqual({ value: 1, display: "item1" });
    expect(dataManager.getState().data.length).toBe(0);

    await dataManager.sync(undefined);

    expect(dataManager.getData().length).toBe(0);
    expect(dataManager.getState().data.length).toBe(0);
  });
});