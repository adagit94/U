type Get = (path: string) => Promise<Response>;
type Post = (path: string, optionals?: Partial<{ body: BodyInit; headers: HeadersInit }>) => Promise<Response>;
type Put = (path: string, optionals?: Partial<{ body: BodyInit; headers: HeadersInit }>) => Promise<Response>;
type Delete = (path: string) => Promise<Response>;

interface IApiClient {
  get: Get;
  post: Post;
  put: Put;
  delete: Delete;
}

type CreateApiClientSettings = {
  urlBase: string;
};

const createApiClient = ({ urlBase }: CreateApiClientSettings): IApiClient => {
  const get: Get = async (path) => {
    const res = await fetch(`${urlBase}${path}`, {
      method: "GET",
    });

    return res;
  };

  const post: Post = async (path, { headers, body } = {}) => {
    const res = await fetch(`${urlBase}${path}`, {
      method: "POST",
      headers,
      body,
    });

    return res;
  };

  const put: Put = async (path, { headers, body } = {}) => {
    const res = await fetch(`${urlBase}${path}`, {
      method: "PUT",
      headers,
      body,
    });

    return res;
  };

  const deleteOp: Delete = async (path) => {
    const res = await fetch(`${urlBase}${path}`, {
      method: "DELETE",
    });

    return res;
  };

  return {
    get,
    post,
    put,
    delete: deleteOp,
  };
};

export default createApiClient;
