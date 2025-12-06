import { Fetch, FetchReqInit } from "networking/client/types.js";
import { HttpMethod } from "networking/types.js";

type Post = Fetch<Omit<FetchReqInit, "method">>;
const post: Post = (url, init) => fetch(url, { ...init, method: HttpMethod.Post });

type Get = Fetch<Omit<FetchReqInit, "method" | "body">>;
const get: Get = (url, init) => fetch(url, { ...init, method: HttpMethod.Get, body: undefined });

type Put = Fetch<Omit<FetchReqInit, "method">>;
const put: Put = (url, init) => fetch(url, { ...init, method: HttpMethod.Put });

type Patch = Fetch<Omit<FetchReqInit, "method">>;
const patch: Patch = (url, init) => fetch(url, { ...init, method: HttpMethod.Patch });

type Delete = Fetch<Omit<FetchReqInit, "method" | "body">>;
const del: Delete = (url, init) => fetch(url, { ...init, method: HttpMethod.Delete, body: undefined });

type Options = Fetch<Omit<FetchReqInit, "method">>;
const options: Options = (url, init) => fetch(url, { ...init, method: HttpMethod.Options });

type Connect = Fetch<Omit<FetchReqInit, "method" | "body">>;
const connect: Connect = (url, init) => fetch(url, { ...init, method: HttpMethod.Connect, body: undefined });

type Head = Fetch<Omit<FetchReqInit, "method" | "body">>;
const head: Head = (url, init) => fetch(url, { ...init, method: HttpMethod.Head, body: undefined });

type Trace = Fetch<Omit<FetchReqInit, "method" | "body">>;
const trace: Trace = (url, init) => fetch(url, { ...init, method: HttpMethod.Trace, body: undefined });

type Method = Post | Get | Put | Patch | Delete | Options | Connect | Head | Trace

export type { Post, Get, Put, Patch, Delete, Options, Connect, Head, Trace, Method };
export { post, get, put, patch, del, options, connect, head, trace };
