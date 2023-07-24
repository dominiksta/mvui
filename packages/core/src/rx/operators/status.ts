import Stream, { OperatorFunction } from "../stream";

/**
   Show the waiting status of a given stream. Particularly useful for data fetching.

   @see {@link rx.handleStatus}

   @example

   ```typescript
   // ... in a search box component
   render() {
     const text = new rx.State('');
     const results = text.pipe(
       rx.debounceTime(200), rx.distinctUntilChanged(),
       rx.showStatus(rx.switchMap(
         v => http.get<string[]>('/api/search', { params: { text: v } })
       ))
     );

     return [
       h.input({ fields: { value: rx.bind(text) }}),
       h.button({ events: { click: _ => search('text') }}),
       results.pipe(
         rx.handleStatus({
           failure: e => h.span(`Error: ${e}`),
           success: v => v.body.map(el => h.li(el)),
           loading: _ => h.span('Waiting...'),
         })
       ),
     ];
   }
   ```

   @group Stream Operators
 */
export default function showStatus<T, O>(
  project: (before: Stream<T>) => Stream<O>
): OperatorFunction<T, { waiting: boolean, value?: O }> {
  return orig => new Stream(observer => {
    const unsubProject = project(orig).subscribe({
      ...observer,
      next(value) {
        observer.next({ waiting: false, value });
      }
    });

    const unsubOrig = orig.subscribe({
      ...observer,
      next() {
        observer.next({ waiting: true, });
      }
    });

    return () => {
      unsubOrig();
      unsubProject();
    }
  });
}

// huge type definition incoming
// ----------------------------------------------------------------------

export function handleStatus<
  In extends { waiting: boolean, value?: any },
  RetFailure, RetSuccess, RetWaiting,
>(conditions: {
  failure: (e: any) => RetFailure,
  success: (v: Exclude<In['value'], undefined>) => RetSuccess,
  waiting: () => RetWaiting,
}): OperatorFunction<In, RetFailure | RetSuccess | RetWaiting>;

export function handleStatus<
  In extends { waiting: boolean, value?: any },
  RetSuccess, RetWaiting,
>(conditions: {
  success: (v: Exclude<In['value'], undefined>) => RetSuccess,
  waiting: () => RetWaiting,
}): OperatorFunction<In, RetSuccess | RetWaiting>;

export function handleStatus<
  In extends { waiting: boolean, value?: any },
  RetFailure, RetWaiting,
>(conditions: {
  failure: (e: any) => RetFailure,
  waiting: () => RetWaiting,
}): OperatorFunction<In, RetFailure | RetWaiting>;

export function handleStatus<
  In extends { waiting: boolean, value?: any },
  RetFailure, RetSuccess
>(conditions: {
  failure: (e: any) => RetFailure,
  success: (v: Exclude<In['value'], undefined>) => RetSuccess,
}): OperatorFunction<In, RetFailure | RetSuccess>;

export function handleStatus<
  In extends { waiting: boolean, value?: any },
  RetFailure
>(conditions: {
  failure: (e: any) => RetFailure,
}): OperatorFunction<In, RetFailure>;

export function handleStatus<
  In extends { waiting: boolean, value?: any },
  RetSuccess
>(conditions: {
  success: (v: Exclude<In['value'], undefined>) => RetSuccess,
}): OperatorFunction<In, RetSuccess>;

export function handleStatus<
  In extends { waiting: boolean, value?: any },
  RetWaiting,
>(conditions: {
  waiting: () => RetWaiting,
}): OperatorFunction<In, RetWaiting>;


/**
   Handle success/failure/waiting state of a stream previously annotated using {@link
   showStatus} (which see for example and details).

   @see {@link showStatus}

   @group Stream Operators
 */
export function handleStatus<
  In extends { waiting: boolean, value?: any },
  RetFailure, RetSuccess, RetWaiting,
>(
  conditions: {
    failure?: (e: any) => RetFailure,
    success?: (v: Exclude<In['value'], undefined>) => RetSuccess,
    waiting?: () => RetWaiting,
  }
): OperatorFunction<In, RetFailure | RetSuccess | RetWaiting> {
  return orig => new Stream(observer => {
    return orig.subscribe({
      ...observer,
      next(v) {
        if (v.waiting && conditions.waiting) observer.next(conditions.waiting());
        else if (conditions.success) observer.next(conditions.success(v.value));
      },
      error(e) {
        if (conditions.failure) observer.next(conditions.failure(e));
      }
    });
  });
}
