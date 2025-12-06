import { SafeRes } from "networking/client/types.js";

export const checkResStatus = async (res: Response) => {
  if (res.ok) return res;
  throw res;
};

export const readRes = async (res: Response) => {
  try {
    const contentType = res.headers.get("content-type");

    if (contentType) {
      if (contentType.startsWith("application/json")) {
        return await res.json();
      } else if (contentType.startsWith("text/plain")) {
        return await res.text();
      }

      throw new Error(`Content-Type ${contentType} not supported.`);
    }

    throw new Error(`Content-Type header is empty.`);
  } catch (err) {
    throw new Error(`Failed to read response: ${err}`);
  }
};

export const safeReq = async <T>(req: () => Promise<T>): SafeRes<T> => {
  try {
    return { success: true, data: await req() };
  } catch (error) {
    console.error(error);

    return {
      success: false,
      error,
    };
  }
};
