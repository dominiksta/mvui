import { Observer } from "../../interface";
import Stream from "../../stream";

type ObserverDefinitionInterop<T> =
  Partial<Observer<T>> | ((value: T) => void) | undefined;

type StreamInterop<T> = {
  [Symbol.observable]: () => {
    subscribe: (obs: ObserverDefinitionInterop<T>) => { unsubscribe: () => void }
  }
};

// we cannot just use StreamInterop because of the way that rxjs implements
// Symbol.observable. it works with plain js but typescript gets confused
type StreamInteropRxJS<T> = {
  subscribe: (obs: ObserverDefinitionInterop<T>) => { unsubscribe: () => void }
};

export type StreamInput<T> = Stream<T>
  | Iterable<T>
  | Promise<T>
  | StreamInterop<T>
  | StreamInteropRxJS<T>;

export function from<T>(noop: Stream<T>): Stream<T>;
export function from<T>(iterable: Iterable<T>): Stream<T>;
export function from<T>(promise: Promise<T>): Stream<T>;
export function from<T>(interop: StreamInterop<T>): Stream<T>;
export function from<T>(interopRxJS: StreamInteropRxJS<T>): Stream<T>;

/**
   Convert an Arrray or a Promise to a Stream.

   @group Stream Creation Operators
 */
export default function from<T>(
  input: StreamInput<T>
): Stream<T> {
  if (input instanceof Stream) return input;
  if (isIterable(input)) {
    return new Stream(observer => {
      for (let value of input) observer.next(value);
      observer.complete();
    });
  } else if (isPromise(input)) {
    return new Stream(observer => {
      input
        .then(v => observer.next(v))
        .catch(e => observer.error(e))
        .finally(() => observer.complete());
    });
  } else if (isInterop(input)) {
    return new Stream(observer => {
      return input[Symbol.observable]().subscribe(observer).unsubscribe;
    });
  } else if (isInteropRxJS(input)) {
    return new Stream(observer => {
      return input.subscribe(observer).unsubscribe;
    });
  } else {
    throw new Error('Could not convert given value to stream');
  }
}

function isIterable(input: unknown): input is Iterable<unknown> {
  if (
    input === null
    || input === undefined
    || typeof input !== 'object'
  ) return false

  return (typeof (input as any)[Symbol.iterator] === 'function') ||
         input instanceof Array;
}

function isPromise(input: unknown): input is Promise<unknown> {
  if (typeof input !== 'object') return false;
  return typeof (input as any)?.then === 'function';
}

function isInterop(input: unknown): input is StreamInterop<unknown> {
  return typeof (input as any)[Symbol.observable] === 'function';
}

function isInteropRxJS(input: unknown): input is StreamInteropRxJS<unknown> {
  return typeof (input as any)['subscribe'] === 'function';
}
