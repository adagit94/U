import { Fetch, FetchReqInit } from "networking/client/types.js";

type Post = Fetch<Omit<FetchReqInit, "method">>;
const post: Post = (url, init) => fetch(url, { ...init, method: "POST" });

type Get = Fetch<Omit<FetchReqInit, "method" | "body">>;
const get: Get = (url, init) => fetch(url, { ...init, method: "GET", body: undefined });

type Put = Fetch<Omit<FetchReqInit, "method">>;
const put: Put = (url, init) => fetch(url, { ...init, method: "PUT" });

type Patch = Fetch<Omit<FetchReqInit, "method">>;
const patch: Patch = (url, init) => fetch(url, { ...init, method: "PATCH" });

type Delete = Fetch<Omit<FetchReqInit, "method" | "body">>;
const del: Delete = (url, init) => fetch(url, { ...init, method: "DELETE", body: undefined });

export type { Post, Get, Put, Patch, Delete };
export { post, get, put, patch, del };
