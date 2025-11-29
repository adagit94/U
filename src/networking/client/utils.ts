import { SafeRes } from "networking/client/types.js";

export const checkResStatus = async (res: Response) => {
  if (res.ok) return res;
  throw res;
};

export const readRes = async (res: Response) => {
  try {
    const contentType = res.headers.get("content-type");

    switch (contentType) {
      case "application/json":
        return await res.json();

      case "text/plain":
        return await res.text();
    }

    throw new Error(`Content-Type ${contentType} not supported.`);
  } catch (err) {
    throw new Error(`Failed to read response: ${err}`);
  }
};

export const safeReq = async <T>(req: () => Promise<Response>, parseRes: (res: Response) => T): SafeRes<T> => {
  try {
    const res = await checkResStatus(await req());
    const parsedRes = await parseRes(res);

    return { data: parsedRes };
  } catch (error) {
    return {
      error,
    };
  }
};
