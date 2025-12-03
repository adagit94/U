export type FetchURL = string | URL;
export type FetchReqInit = RequestInit;
export type Fetch<Init extends RequestInit> = (url: FetchURL, init?: Init) => Promise<Response>;

type SafeResSuccess<T> = {
  success: true;
  data: T;
};

type SafeResFailure = {
  success: false;
  error: unknown;
};

export type SafeRes<T> = Promise<SafeResSuccess<T> | SafeResFailure>;
