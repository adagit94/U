import * as methods from "./httpMethods.js";

type HttpClientMethod<T extends methods.Method> = (path: string, init: Parameters<T>[1]) => ReturnType<T>;

type CreateHttpClientSettings = {
  urlBase: string;
};

interface IHttpClient {
  post: HttpClientMethod<methods.Post>;
  get: HttpClientMethod<methods.Get>;
  put: HttpClientMethod<methods.Put>;
  patch: HttpClientMethod<methods.Patch>;
  delete: HttpClientMethod<methods.Delete>;
  options: HttpClientMethod<methods.Options>;
  connect: HttpClientMethod<methods.Connect>;
  head: HttpClientMethod<methods.Head>;
  trace: HttpClientMethod<methods.Trace>;
}

const createHttpClient = ({ urlBase }: CreateHttpClientSettings): IHttpClient => {
  const post: IHttpClient["post"] = async (path, init) => {
    const res = await methods.post(`${urlBase}${path}`, init);

    return res;
  };

  const get: IHttpClient["get"] = async (path, init) => {
    const res = await methods.get(`${urlBase}${path}`, init);

    return res;
  };

  const put: IHttpClient["put"] = async (path, init) => {
    const res = await methods.put(`${urlBase}${path}`, init);

    return res;
  };

  const patch: IHttpClient["patch"] = async (path, init) => {
    const res = await methods.patch(`${urlBase}${path}`, init);

    return res;
  };

  const del: IHttpClient["delete"] = async (path, init) => {
    const res = await methods.del(`${urlBase}${path}`, init);

    return res;
  };

  const options: IHttpClient["options"] = async (path, init) => {
    const res = await methods.options(`${urlBase}${path}`, init);

    return res;
  };

  const connect: IHttpClient["connect"] = async (path, init) => {
    const res = await methods.connect(`${urlBase}${path}`, init);

    return res;
  };

  const head: IHttpClient["head"] = async (path, init) => {
    const res = await methods.head(`${urlBase}${path}`, init);

    return res;
  };

  const trace: IHttpClient["trace"] = async (path, init) => {
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

export default createHttpClient;
