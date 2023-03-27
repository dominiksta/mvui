import Stream from "./rx/stream";
import switchMap from "./rx/operators/switchMap";
import fromFetch from "./rx/operators/creation/fromFetch";
import from from "./rx/operators/creation/from";

/**
   A simple HTTP client. When compared to a bare fetch, there are three main things
   added/changed:

   1. It returns a {@link Stream}. This enables the easier use of higher order operators
      like {@link switchMap}.
   2. There is some basic convenience around parsing a json body and setting request path
      parameters.
   3. Instead of just silently failing and setting an `ok` value to false like fetch does,
      an HttpError object is thrown in the Stream.

   ### Basic Example

   ```typescript
   http.get<{ someJsonBodyField: number }>(
     '/some-path', { pathParams: { id: 4 }}
   ).subscribe(resp => console.log(resp.body);

   // provided that the /some-path endpoint exists and the types are correct,
   // this will print { someJsonbodyfield: <someNumber> }
   ```

   ### Example with `switchMap`

   ```typescript
   // imagine this in a template
   rx.fromEvent(myInput, 'change').pipe(
     rx.debounceTime(100),
     rx.map(v => (v.target as any).value as string),
     rx.switchMap(v => http.get('/search', { pathParams: { name: v })),
   ).subscribe(resp = console.log(resp.body));

   // provided that the /search endpoint exists and the types are correct,
   // this will print log the api response for each new input value
   ```

   Note that this example will *cancel unfinished requests and ensure that the emitted
   response always maps to the most current input value*. For more information on this
   behaviour, have a look at the {@link switchMap} operator.
 */
export const http = {
  get: _get,
  post: _post,
  put: _put,
  patch: _patch,
  delete: _delete,
}

// const test1 = http.get('/'); // body should be unknown
// const test2 = http.get('/', { parseBody: true }); // body should be unknown
// const test3 = http.get('/', { parseBody: false }); // body should be string
// const test4 = http.get<{hi: string}>('/'); // body should be {hi: string}
// const test5 = http.get<{hi: string}>('/', { parseBody: false }); // should not compile

// get
// ----------------------------------------------------------------------

function _get<ResponseT>(
  path: string, options?: RequestOptions<true>,
): Stream<{body: ResponseT, detail: Response}>;
function _get(
  path: string, options?: RequestOptions<false>,
): Stream<{body: string, detail: Response}>;
function _get<ResponseT>(
  path: string, options?: RequestOptions<boolean>,
): Stream<{body: string | ResponseT, detail: Response}> {
  return request('GET', path, options);
}

// post
// ----------------------------------------------------------------------

function _post<ResponseT>(
  path: string, options?: RequestOptions<true>,
): Stream<{body: ResponseT, detail: Response}>;
function _post(
  path: string, options?: RequestOptions<false>,
): Stream<{body: string, detail: Response}>;
function _post<ResponseT>(
  path: string, options?: RequestOptions<boolean>,
): Stream<{body: string | ResponseT, detail: Response}> {
  return request('POST', path, options);
}

// put
// ----------------------------------------------------------------------

function _put<ResponseT>(
  path: string, options?: RequestOptions<true>,
): Stream<{body: ResponseT, detail: Response}>;
function _put(
  path: string, options?: RequestOptions<false>,
): Stream<{body: string, detail: Response}>;
function _put<ResponseT>(
  path: string, options?: RequestOptions<boolean>,
): Stream<{body: string | ResponseT, detail: Response}> {
  return request('PUT', path, options);
}

// patch
// ----------------------------------------------------------------------

function _patch<ResponseT>(
  path: string, options?: RequestOptions<true>,
): Stream<{body: ResponseT, detail: Response}>;
function _patch(
  path: string, options?: RequestOptions<false>,
): Stream<{body: string, detail: Response}>;
function _patch<ResponseT>(
  path: string, options?: RequestOptions<boolean>,
): Stream<{body: string | ResponseT, detail: Response}> {
  return request('PATCH', path, options);
}

// delete
// ----------------------------------------------------------------------

function _delete<ResponseT>(
  path: string, options?: RequestOptions<true>,
): Stream<{body: ResponseT, detail: Response}>;
function _delete(
  path: string, options?: RequestOptions<false>,
): Stream<{body: string, detail: Response}>;
function _delete<ResponseT>(
  path: string, options?: RequestOptions<boolean>,
): Stream<{body: string | ResponseT, detail: Response}> {
  return request('DELETE', path, options);
}

// generic request
// ----------------------------------------------------------------------

interface RequestOptions<ParseJsonT extends boolean> {
  pathParams?: { [key: string]: any },
  body?: string | object,
  parseBody?: ParseJsonT,
  init?: RequestInit,
}

function request<ResponseBodyT, ParseJsonT extends boolean>(
  verb: string,
  path: string,
  options?: RequestOptions<ParseJsonT>,
): Stream<{
  body: ResponseBodyT,
  detail: Response,
}> {

  const pathWithParams = (options && options.pathParams)
    ? path + new URLSearchParams(options.pathParams)
    : path;

  const body = options && options.body;

  const request = new Request(
    pathWithParams, {
    body: typeof body === 'string' ? body : JSON.stringify(body),
    method: verb,
  });

  return fromFetch(request).pipe(
    switchMap(response => from(new Promise((resolve, reject) => {
      if (!response.ok) reject(new HttpError(request, response));

      const body = (options && options.parseBody === false)
        ? response.text() : response.json();

      body.then(v => resolve({
        body: v,
        detail: response,
      }))
    })))
  );
}

class HttpError extends Error {
  constructor(
    public request: Request,
    public response: Response,
    public rethrow?: any,
  ) {
    const msg =
      `${request.method} ${request.url}: ${response.status} ${response.statusText}`;
    super(msg, rethrow);
    this.name = 'ResponseError';
  }
}
