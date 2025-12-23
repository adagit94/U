import z from "zod";

export type SchemaConstraint = z.ZodType
export type Schema<T extends SchemaConstraint> = T
export type SchemaValue<T extends SchemaConstraint> = z.infer<T>