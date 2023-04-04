import Stream from "../../stream";

/**
   TODO
 */
export default function throwError(
  errorOrFactory: Error | (() => Error),
) {
  const factory = typeof errorOrFactory === 'function'
    ? errorOrFactory : () => errorOrFactory;
  return new Stream<void>(observer => { observer.error(factory()); })
}
