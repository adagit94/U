import { PrimitiveValue } from "types.js";

export const composeQueryStr = <T extends Record<string | number, PrimitiveValue>>(params: T) => {
  let queryStr = Object.entries(params).map(([key, val]) => `${key}=${val}`).join("&");

  if (queryStr.length > 0) {
    queryStr = `?${queryStr}`;
  }

  return queryStr;
};