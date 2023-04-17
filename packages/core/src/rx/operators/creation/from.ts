import Stream from "../../stream";


export function from<ValuesT>(values: Iterable<ValuesT>): Stream<ValuesT>;

export function from<ValuesT>(promise: Promise<ValuesT>): Stream<ValuesT>;

/**
   Convert an Arrray or a Promise to a Stream.

   @group Stream Creation Operators
 */
export default function from<ValuesT>(
  input: Iterable<ValuesT> | Promise<ValuesT>
): Stream<ValuesT> {
  if (isIterable(input)) {
    return new Stream(observer => {
      for (let value of input) observer.next(value);
    });
  } else if (isPromse(input)) {
    return new Stream(observer => {
      input
        .then(v => observer.next(v))
        .catch(e => observer.error(e))
        .finally(() => observer.complete());
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

  return typeof (input as any)[Symbol.iterator] === 'function';
}

function isPromse(input: unknown): input is Promise<unknown> {
  if (typeof input !== 'object') return false;
  return typeof (input as any)?.then === 'function';
}
