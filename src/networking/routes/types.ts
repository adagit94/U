import { Methods, MethodWithoutBody } from "networking/client/http/httpMethods.js";
import { SchemaConstraint, SchemaValue } from "schemas/types.js";
import { GenRecord } from "types.js";

type GenSchemasConstraint<Keys extends string> = GenRecord<Keys, SchemaConstraint>;

type RouteMethodSchemaKey = "req" | "res" | "query";

type RouteMethodConstraint<SchemasKeys extends RouteMethodSchemaKey = RouteMethodSchemaKey> = {
  schemas: GenSchemasConstraint<SchemasKeys>;
};

export type RouteMethodsConstraint = {
  [Method in keyof Methods]: Method extends MethodWithoutBody
    ? RouteMethodConstraint<Exclude<RouteMethodSchemaKey, "req">>
    : RouteMethodConstraint;
};

export type ComposeRoutePathConstraint = (params?: Partial<SchemaValue<RouteConstraint["schemas"]["path"]>>) => string;

export type RouteConstraint = {
  methods: Partial<RouteMethodsConstraint>;
  schemas: GenSchemasConstraint<"path">;
  composePath: ComposeRoutePathConstraint
};

export type RoutesConstraint = Record<string, RouteConstraint>;
