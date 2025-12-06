import * as methods from "./methods.js";

type ClientMethod<T extends methods.Method> = (path: string, init: Parameters<T>[1]) => ReturnType<T>;

type CreateApiClientSettings = {
  urlBase: string;
};

interface IClient {
  post: ClientMethod<methods.Post>;
  get: ClientMethod<methods.Get>;
  put: ClientMethod<methods.Put>;
  patch: ClientMethod<methods.Patch>;
  delete: ClientMethod<methods.Delete>;
  options: ClientMethod<methods.Options>;
  connect: ClientMethod<methods.Connect>;
  head: ClientMethod<methods.Head>;
  trace: ClientMethod<methods.Trace>;
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

  const options: IClient["options"] = async (path, init) => {
    const res = await methods.options(`${urlBase}${path}`, init);

    return res;
  };

  const connect: IClient["connect"] = async (path, init) => {
    const res = await methods.connect(`${urlBase}${path}`, init);

    return res;
  };

  const head: IClient["head"] = async (path, init) => {
    const res = await methods.head(`${urlBase}${path}`, init);

    return res;
  };

  const trace: IClient["trace"] = async (path, init) => {
    const res = await methods.trace(`${urlBase}${path}`, init);

    return res;
  };

  return {
    post,
    get,
    put,
    patch,
    delete: del,
    options,
    connect,
    head,
    trace
  };
};

export default createClient;
