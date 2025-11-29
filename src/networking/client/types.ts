export type FetchURL = string | URL;
export type FetchReqInit = RequestInit;
export type Fetch<Init extends RequestInit> = (url: FetchURL, init?: Init) => Promise<Response>;

type SafeResSuccess<T> = {
    data: T
}

type SafeResFailure = {
    error: unknown
}

export type SafeRes<T> = Promise<SafeResSuccess<T> | SafeResFailure>;