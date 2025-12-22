import { HttpMethod } from "networking/types.js";
import { GenRecord, Variadic } from "types.js";

type GenParsersConstraint<Keys extends string> = Partial<GenRecord<Keys, (input: unknown) => unknown>>;

type RouteMethodConstraint = {
  handler: Variadic<unknown>;
  parsers?: GenParsersConstraint<"req" | "res" | "query">;
};

type RouteConstraint = {
  path: string;
  methods: Partial<Record<HttpMethod, RouteMethodConstraint>>;
  parsers?: GenParsersConstraint<"path">;
};

export type RoutesConstraint = Record<string, RouteConstraint>;

