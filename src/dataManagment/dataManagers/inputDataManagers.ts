import { IDataFilter, IDataLoader, IPager, PagerStateBase } from "dataManagment/DataManagmentTypes";
import { createDataSource, DataSourceStateBase, IDataSource } from "dataManagment/dataSources/dataSources";
import { get, isEqual } from "lodash";
import { createQueue, ExecuteTask, IQueue, QueueTask } from "queues";
import { GetState, SetState } from "state";
import { PrimitiveValue } from "types";

type RecordValue = Record<string | number, unknown>;

type InputDataManagerQueueTask = QueueTask & { handle: () => Promise<void> };

export type InputDataManagerState<
  DataItem extends PrimitiveValue | RecordValue,
  PagerState extends Record<string, unknown>,
> = DataSourceStateBase<DataItem[]> & PagerState;

export type InputLoaderData<DataItem extends PrimitiveValue | RecordValue> = {
  baseData: Readonly<DataItem[]>;
  allData: Readonly<DataItem[]>;
};

export type InputLoaderOptionals<SelectedValue extends PrimitiveValue | RecordValue> = Partial<
  { search: string; reqTotalCount: boolean; missingItemsForValues: SelectedValue[] } & QueueTask
>;

type DataInitOptionals<SelectedValue extends PrimitiveValue | RecordValue> = Pick<
  InputLoaderOptionals<SelectedValue>,
  "reqTotalCount"
>;

type FilterParams<SelectedValue extends PrimitiveValue | RecordValue> = [string, DataInitOptionals<SelectedValue>];

abstract class InputDataManager<
    Settings extends
      | PrimitiveInputDataManagerSettings
      | ObjectInputDataManagerSettings<RecordValue, PrimitiveValue | RecordValue>,
    DataItem extends PrimitiveValue | RecordValue,
    SelectedValue extends PrimitiveValue | RecordValue,
    PagerState extends PagerStateBase,
    PagerAdvanceInfo extends Record<string, unknown>,
    Pager extends IPager<PagerState, PagerAdvanceInfo>,
    Loader extends IDataLoader<
      InputDataManagerState<DataItem, Partial<PagerState>>,
      [PagerAdvanceInfo, InputLoaderData<DataItem>, InputLoaderOptionals<SelectedValue>]
    >,
  >
  implements
    IDataSource<DataItem[], InputDataManagerState<DataItem, PagerState>>,
    IDataFilter<boolean | undefined, FilterParams<SelectedValue>>,
    IPager<InputDataManagerState<DataItem, PagerState>, { result: Promise<boolean> }>
{
  constructor(pager: Pager, loader: Loader, settings: Settings) {
    this.queue = createQueue({ executeTask: this.executeQueueTask });
    this.dataSource = createDataSource<DataItem[]>({ initState: () => ({ data: [], exhausted: false }) });
    this.pager = pager;
    this.loader = loader;
    this.settings = settings;
  }

  private queue: IQueue<InputDataManagerQueueTask>;
  private dataSource: IDataSource<DataItem[]>;
  private pager: Pager;
  private loader: Loader;
  private selectedItems: DataItem[] = [];
  protected selectedValues: SelectedValue[] = [];
  protected settings: Settings;

  protected abstract getDataItemsForValues: () => DataItem[];
  protected abstract getValuesMissingDataItems: () => SelectedValue[];

  private executeQueueTask: ExecuteTask<InputDataManagerQueueTask> = async (task) => {
    await task.handle();
  };

  private missingDataItemsForValues = () => {
    return this.selectedItems.length !== this.selectedValues.length;
  };

  private load = async (optionals: InputLoaderOptionals<SelectedValue> = {}): Promise<boolean> => {
    return new Promise((resolve) => {
      this.queue.setTask({
        priority: optionals.priority,
        privileged: optionals.privileged,
        handle: async () => {
          if (optionals.missingItemsForValues !== undefined) {
            const missingItemsForValues = this.getValuesMissingDataItems();

            if (missingItemsForValues.length === 0) {
              resolve(true);
              return;
            }

            optionals = { ...optionals, missingItemsForValues };
          }

          const step = this.pager.advance();
          const data = { baseData: this.dataSource.getData(), allData: this.getData() };

          try {
            let stateUpdate = await this.loader.load(step, data, optionals);

            if (optionals.missingItemsForValues !== undefined) {
              this.selectedItems = [...this.selectedItems, ...stateUpdate.data];
              stateUpdate = { ...stateUpdate, data: this.dataSource.getData() };
            }

            this.setState(stateUpdate as Partial<InputDataManagerState<DataItem, PagerState>>);
            step.close?.(true);
            resolve(true);
          } catch (err) {
            console.error(`Data load failed:`, err);
            step.close?.(false);
            resolve(false);
          }
        },
      });
    });
  };

  public getData = () => {
    const baseData: Readonly<DataItem[]> = this.dataSource.getData();

    // filter out selected items that are included in base data set and prepend only those that are missing
    const prependedSelectedItems = this.selectedItems.filter(
      (selectedItem) => !baseData.some((item) => isEqual(item, selectedItem)),
    );

    return [...prependedSelectedItems, ...baseData];
  };

  public setData = (data: DataItem[]) => {
    this.pager.reset();
    this.dataSource.setData(data);
  };

  public init = ({ reqTotalCount }: DataInitOptionals<SelectedValue> = {}) => {
    this.pager.reset();
    return this.load({ reqTotalCount, privileged: true });
  };

  public filter = (search: string, { reqTotalCount }: DataInitOptionals<SelectedValue> = {}) => {
    this.pager.reset();
    return this.load({ search, reqTotalCount, privileged: true });
  };

  public advance = () => {
    return { result: this.load() };
  };

  public setSelection = (values: SelectedValue | SelectedValue[] | undefined | null) => {
    this.selectedValues = (Array.isArray(values) ? values : [values]).filter((v) => v !== undefined && v !== null);
    this.selectedItems = this.getDataItemsForValues();
  };

  public sync(values: SelectedValue | SelectedValue[] | undefined | null): Promise<boolean> | void {
    this.setSelection(values);

    if (this.missingDataItemsForValues()) {
      return this.load({ missingItemsForValues: this.getValuesMissingDataItems() });
    }
  }

  public getState: GetState<InputDataManagerState<DataItem, PagerState>> = () => ({
    ...this.dataSource.getState(),
    ...this.pager.getState(),
  });

  public setState: SetState<InputDataManagerState<DataItem, PagerState>> = (update) => {
    const state = typeof update === "function" ? update(this.getState()) : update;

    this.dataSource.setState({ data: state.data, exhausted: state.exhausted });
    this.pager.setState(state);

    return this.getState();
  };

  public reset = () => {
    this.pager.reset();
    this.dataSource.reset();
  };
}

type PrimitiveInputDataManagerSettings = undefined;

export class PrimitiveInputDataManager<
  PagerState extends PagerStateBase,
  PagerAdvanceInfo extends Record<string, unknown>,
  Pager extends IPager<PagerState, PagerAdvanceInfo>,
  Loader extends IDataLoader<
    InputDataManagerState<PrimitiveValue, Partial<PagerState>>,
    [PagerAdvanceInfo, InputLoaderData<PrimitiveValue>, InputLoaderOptionals<PrimitiveValue>]
  >,
> extends InputDataManager<
  PrimitiveInputDataManagerSettings,
  PrimitiveValue,
  PrimitiveValue,
  PagerState,
  PagerAdvanceInfo,
  Pager,
  Loader
> {
  constructor(pager: Pager, loader: Loader) {
    super(pager, loader, undefined);
  }

  protected override getDataItemsForValues = (): PrimitiveValue[] => {
    const data = this.getData();
    let dataItems: PrimitiveValue[] = [];

    for (const value of this.selectedValues) {
      const dataItem = data.find((item) => value === item);

      if (dataItem) dataItems.push(dataItem);
    }

    return dataItems;
  };

  protected override getValuesMissingDataItems = (): PrimitiveValue[] => {
    const data = this.getData();
    let values: PrimitiveValue[] = [];

    for (const value of this.selectedValues) {
      const missingItem = !data.some((item) => value === item);

      if (missingItem) values.push(value);
    }

    return values;
  };
}

type ObjectInputDataManagerSettings<
  DataItem extends RecordValue,
  SelectedValue extends PrimitiveValue | DataItem,
> = SelectedValue extends PrimitiveValue
  ? {
      valueKey: string;
    }
  : undefined;

export class ObjectInputDataManager<
  DataItem extends RecordValue,
  SelectedValue extends PrimitiveValue | DataItem,
  PagerState extends PagerStateBase,
  PagerAdvanceInfo extends Record<string, unknown>,
  Pager extends IPager<PagerState, PagerAdvanceInfo>,
  Loader extends IDataLoader<
    InputDataManagerState<DataItem, Partial<PagerState>>,
    [PagerAdvanceInfo, InputLoaderData<DataItem>, InputLoaderOptionals<SelectedValue>]
  >,
> extends InputDataManager<
  ObjectInputDataManagerSettings<DataItem, SelectedValue>,
  DataItem,
  SelectedValue,
  PagerState,
  PagerAdvanceInfo,
  Pager,
  Loader
> {
  constructor(pager: Pager, loader: Loader, settings: ObjectInputDataManagerSettings<DataItem, SelectedValue>) {
    super(pager, loader, settings);
  }

  protected override getDataItemsForValues = (): DataItem[] => {
    const data = this.getData();
    let dataItems: DataItem[] = [];

    for (const value of this.selectedValues) {
      const dataItem = data.find((item) => {
        const { valueKey } = this.settings ?? {};

        if (valueKey) {
          return get(item, valueKey) === value;
        }

        return isEqual(item, value);
      });

      if (dataItem) dataItems.push(dataItem);
    }

    return dataItems;
  };

  protected override getValuesMissingDataItems = (): SelectedValue[] => {
    const data = this.getData();
    let values: SelectedValue[] = [];

    for (const value of this.selectedValues) {
      const missingItem = !data.some((item) => {
        const { valueKey } = this.settings ?? {};

        if (valueKey) {
          return get(item, valueKey) === value;
        }

        return isEqual(item, value);
      });

      if (missingItem) {
        values.push(value);
      }
    }

    return values;
  };
}
