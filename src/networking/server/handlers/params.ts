import { SchemaConstraint } from "schemas/types.js";

export function handleReqParams<T extends SchemaConstraint>(
  req: Request,
  res: Response,
  schemas: { path: T },
): { path: z.infer<T> } | null;
export function handleReqParams<T extends SchemaConstraint>(
  req: Request,
  res: Response,
  schemas: { query: T },
): { query: z.infer<T> } | null;
export function handleReqParams<T extends SchemaConstraint, U extends SchemaConstraint>(
  req: Request,
  res: Response,
  schemas: { path: T; query: U },
): { path: z.infer<T>; query: z.infer<U> } | null;
export function handleReqParams<T extends SchemaConstraint, U extends SchemaConstraint>(
  req: Request,
  res: Response,
  schemas: { path: T } | { query: U } | { path: T; query: U },
): { path: z.infer<T> } | { query: z.infer<U> } | { path: z.infer<T>; query: z.infer<U> } | null {
  if ("path" in schemas && "query" in schemas) {
    const pathParams = handleParams(req, res, "path", schemas.path);

    if (pathParams === null) return null;

    const queryParams = handleParams(req, res, "query", schemas.query);

    if (queryParams === null) return null;

    return { path: pathParams, query: queryParams };
  }

  if ("path" in schemas) {
    const pathParams = handleParams(req, res, "path", schemas.path);

    if (pathParams === null) return null;

    return { path: pathParams };
  }

  if ("query" in schemas) {
    const queryParams = handleParams(req, res, "query", schemas.query);

    if (queryParams === null) return null;

    return { query: queryParams };
  }

  return null;
}

const handleParams = <T extends "path" | "query", U extends SchemaConstraint>(
  req: Request,
  res: Response,
  type: T,
  schema: U,
): z.infer<U> | null => {
  const params = type === "path" ? req.params : req.query;
  const parsingResult = schema.safeParse(params);

  if (!parsingResult.success) {
    res.status(400).send({
      message: `${type[0].toUpperCase()}${type.substring(1)} params are invalid.`,
      error: parsingResult.error.issues,
    });

    return null;
  }

  return parsingResult.data;
};