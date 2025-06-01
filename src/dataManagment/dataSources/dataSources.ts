import { GetData, SetData } from "dataManagment/DataManagmentTypes";
import { createState, InitState, IState } from "state";

export type DataSourceStateBase<T> = { data: Readonly<T>; exhausted?: boolean };

type CreateDataSourceParams<T, U extends DataSourceStateBase<T>> = {
  initState: InitState<U>;
};

export interface IDataSource<T, U extends DataSourceStateBase<T> = DataSourceStateBase<T>> extends IState<U> {
  getData: GetData<T>;
  setData: SetData<T>;
}

export const createDataSource = <T, U extends DataSourceStateBase<T> = DataSourceStateBase<T>>({
  initState,
}: CreateDataSourceParams<T, U>): IDataSource<T, U> => {
  let state = createState({ initState });

  const getData: GetData<T> = () => state.getState().data;

  const setData: SetData<T> = (data) => {
    state.setState((s) => ({ ...s, data }));
  };

  return {
    ...state,
    getData,
    setData,
  };
};

type HandleCachedData<T> = (data: T) => T;

type CreateCachedDataSourceParams<T, U extends DataSourceStateBase<T>> = CreateDataSourceParams<T, U> & {
  handleCachedData: HandleCachedData<T>;
};

export interface ICachedDataSource<T, U extends DataSourceStateBase<T> = DataSourceStateBase<T>>
  extends IDataSource<T, U> {}

export const createCachedDataSource = <T, U extends DataSourceStateBase<T> = DataSourceStateBase<T>>({
  initState,
  handleCachedData,
}: CreateCachedDataSourceParams<T, U>): ICachedDataSource<T, U> => {
  const dataSource = createDataSource<T, U>({ initState });

  const getData: GetData<T> = () => {
    const data = handleCachedData(dataSource.getData());

    return data;
  };

  return { ...dataSource, getData };
};

