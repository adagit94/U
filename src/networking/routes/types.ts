import { Methods, MethodWithoutBody } from "networking/client/http/httpMethods.js";
import { GenRecord, Variadic } from "types.js";

type GenParsersConstraint<Keys extends string> = GenRecord<Keys, (input: unknown) => unknown>;

type RouteMethodParser = "req" | "res" | "query";

type RouteMethodConstraint<Parsers extends RouteMethodParser = RouteMethodParser> = {
  handler: Variadic<unknown>;
  parsers: GenParsersConstraint<Parsers>;
};

export type RouteMethodsConstraint = {
  [Method in keyof Methods]: Method extends MethodWithoutBody
    ? RouteMethodConstraint<Exclude<RouteMethodParser, "req">>
    : RouteMethodConstraint;
};

export type RouteConstraint = {
  composePath: Variadic<string>;
  methods: Partial<RouteMethodsConstraint>;
  parsers: GenParsersConstraint<"path">;
};

export type RoutesConstraint = Record<string, RouteConstraint>;
