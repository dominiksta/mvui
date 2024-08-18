export interface Subscribable<T> {
  subscribe(observer?: ((value: T) => void)): () => void;
}

export function isSubscribable<T>(input: unknown): input is Subscribable<T> {
  return (
    input !== null && input !== undefined && typeof input === 'object'
    && Symbol.observable in input
  );
}

export type TeardownLogic = (() => void) | void;

export type Observer<T> = {
  next(value: T): void,
  error(err: any): void,
  complete(): void,
}

export type ObserverDefinition<T> =
  Partial<Observer<T>> | ((value: T) => void) | void;


// export interface Writable<T> extends Subscribable<T> {
//   next(value: T): void;
// }
// 
// export function isWritable<T>(input: unknown): input is Writable<T> {
//   return isSubscribable(input) && 'next' in input;
// }
// 
// export interface StatefulWritable<T> extends Writable<T> {
//   value: T;
// }
// 
// export function isStatefulWritable<T>(input: unknown): input is Writable<T> {
//   return isWritable(input) && 'value' in input;
// }
