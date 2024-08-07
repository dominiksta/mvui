import Stream from "../../stream";

/**
   A thin wrapper around `fetch`. Functionally equivalent to `rx.from(fetch(...))`, but
   requests will be cancelled on completion.

   @example
   ```typescript
   rx.fromFetch('/test').subscribe(async v => console.log(await v.json()));
   ```

   @group Stream Creation Operators

   @see {@link switchMap}
 */
export default function fromFetch(
  input: RequestInfo | URL, init?: RequestInit
): Stream<Response> {
  return new Stream(observer => {
    const abortCtrl = new AbortController();
    fetch(input, { signal: abortCtrl.signal, ...init })
      .then(v => {
        if (v.ok) observer.next(v);
        else observer.error(v);
      })
      .catch(e => observer.error(e))
      .finally(() => observer.complete());
    return () => {
      abortCtrl.abort();
    }
  });
}
