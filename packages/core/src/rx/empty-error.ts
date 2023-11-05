
/**
   Thrown by some operators when a {@link Stream} completes without emitting a value.
 */
export default class EmptyError extends Error {
  constructor(msg?: string, options?: ErrorOptions) {
    super(msg, options);
    this.name = 'EmptyError';
  }
}
