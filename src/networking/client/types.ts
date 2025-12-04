import { SafeResult } from "types.js";

export type FetchURL = string | URL;
export type FetchReqInit = RequestInit;
export type Fetch<Init extends RequestInit> = (url: FetchURL, init?: Init) => Promise<Response>;

export type SafeRes<T> = Promise<SafeResult<T>>;
