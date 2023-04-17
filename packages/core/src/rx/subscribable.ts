export interface Subscribable<T> {
  subscribe(observer?: ((value: T) => void)): () => void;
}

export function isSubscribable<T>(input: unknown): input is Subscribable<T> {
  return (
    input !== null && input !== undefined && typeof input === 'object'
    && 'subscribe' in input
  );
}
