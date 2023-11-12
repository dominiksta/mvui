
export function identity<T>(v: T): T { return v; }

export function singletonValue<T>(creator: () => T): () => T {
  let val: T | undefined = undefined;
  return () => {
    if (val === undefined) val = creator();
    return val;
  }
}
