import * as methods from "./methods.js";

type ClientMethod<T extends methods.Post | methods.Get | methods.Put | methods.Patch | methods.Delete> = (
  path: string,
  init: Parameters<T>[1]
) => ReturnType<T>;

type CreateApiClientSettings = {
  urlBase: string;
};

interface IClient {
  post: ClientMethod<methods.Post>;
  get: ClientMethod<methods.Get>;
  put: ClientMethod<methods.Put>;
  patch: ClientMethod<methods.Patch>;
  delete: ClientMethod<methods.Delete>;
}

const createClient = ({ urlBase }: CreateApiClientSettings): IClient => {
  const post: IClient["post"] = async (path, init) => {
    const res = await methods.post(`${urlBase}${path}`, init);

    return res;
  };

  const get: IClient["get"] = async (path, init) => {
    const res = await methods.get(`${urlBase}${path}`, init);

    return res;
  };

  const put: IClient["put"] = async (path, init) => {
    const res = await methods.put(`${urlBase}${path}`, init);

    return res;
  };

  const patch: IClient["patch"] = async (path, init) => {
    const res = await methods.patch(`${urlBase}${path}`, init);

    return res;
  };

  const del: IClient["delete"] = async (path, init) => {
    const res = await methods.del(`${urlBase}${path}`, init);

    return res;
  };

  return {
    post,
    get,
    put,
    patch,
    delete: del,
  };
};

export default createClient;
