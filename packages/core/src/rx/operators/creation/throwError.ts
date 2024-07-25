import Stream from "../../stream";

/**
   Creates a new stream that immediatly emits an error value. Generally speaking, you can
   just `throw` an error in a Stream and it will be picked up like you would expect. There
   are situations however where you may want to create a Stream with this operator, which
   will emit the error value on every subscription.

   @example
   ```typescript
   rx.throwError(new Error('hi')).subscribe({ error: console.log });
   // prints the error
   ```

   @group Stream Creation Operators
 */
export default function throwError(
  errorOrFactory: Error | (() => Error),
) {
  const factory = typeof errorOrFactory === 'function'
    ? errorOrFactory : () => errorOrFactory;
  return new Stream<void>(observer => { observer.error(factory()); })
}
