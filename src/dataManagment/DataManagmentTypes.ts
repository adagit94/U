import { IState } from "state";
import { ImmutableGetter, Variadic } from "types";

type Advance<T extends Record<string, unknown>, U extends unknown[] = []> = Variadic<
  T &
    Partial<{
      close: (successfull: boolean) => void;
    }>,
  U
>;

export type Reset = () => void;

export type GetData<T> = ImmutableGetter<T>;

export type SetData<T> = (data: T) => void;

export type LoadData<T, U extends unknown[] = []> = Variadic<T | Promise<T>, U>;

export type FilterData<T, U extends unknown[] = []> = Variadic<T | Promise<T>, U>;

export type PagerStateBase = { totalCount?: number };

export interface IPager<T extends PagerStateBase, U extends Record<string, unknown>, V extends unknown[] = []> extends IState<T> {
  advance: Advance<U, V>;
}

export interface IDataLoader<T, U extends unknown[] = []> {
  load: LoadData<T, U>;
}

export interface IDataFilter<T, U extends unknown[] = []> {
  filter: FilterData<T, U>;
}
