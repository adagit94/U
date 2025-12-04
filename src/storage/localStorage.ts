import { SafeResult } from "shared";
import * as z from "zod";

export const saveJson = (key: string, data: unknown): SafeResult<string> => {
  try {
    const str = JSON.stringify(data);

    localStorage.setItem(key, str);

    return { success: true, data: str };
  } catch (error) {
    return {
      success: false,
      error,
    };
  }
};

export const readJson = <T extends z.ZodType>(key: string, schema: T): SafeResult<z.infer<T> | null> => {
  try {
    const data = localStorage.getItem(key);

    if (data === null) return { success: true, data: null };

    const parsedData = schema.parse(JSON.parse(data));

    return { success: true, data: parsedData };
  } catch (error) {
    return {
      success: false,
      error,
    };
  }
};
