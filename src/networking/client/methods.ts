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

type Options = Fetch<Omit<FetchReqInit, "method">>;
const options: Options = (url, init) => fetch(url, { ...init, method: "OPTIONS" });

type Connect = Fetch<Omit<FetchReqInit, "method" | "body">>;
const connect: Connect = (url, init) => fetch(url, { ...init, method: "CONNECT", body: undefined });

type Head = Fetch<Omit<FetchReqInit, "method" | "body">>;
const head: Head = (url, init) => fetch(url, { ...init, method: "HEAD", body: undefined });

type Trace = Fetch<Omit<FetchReqInit, "method" | "body">>;
const trace: Trace = (url, init) => fetch(url, { ...init, method: "TRACE", body: undefined });

type Method = Post | Get | Put | Patch | Delete | Options | Connect | Head | Trace

export type { Post, Get, Put, Patch, Delete, Options, Connect, Head, Trace, Method };
export { post, get, put, patch, del, options, connect, head, trace };
