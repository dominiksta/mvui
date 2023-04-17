export interface Subscribable<T> {
  subscribe(observer?: ((value: T) => void)): () => void;
}

export function isSubscribable<T>(input: unknown): input is Subscribable<T> {
  return (
    input !== null && input !== undefined && typeof input === 'object'
    && 'subscribe' in input
  );
}

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
