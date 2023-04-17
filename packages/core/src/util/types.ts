import { Subscribable } from "../rx/interface";

export type Newable<T> = { new (...args: any[]): T };
export type Constructor<T> = new (...args: any[]) => T;

export type ToStringable = { toString: () => string };
export type MaybeSubscribable<T> = Subscribable<T> | T;

// credits: https://stackoverflow.com/a/51365037
export type RecursivePartial<T> = {
  [P in keyof T]?:
    T[P] extends (infer U)[] ? RecursivePartial<U>[] :
    T[P] extends object ? RecursivePartial<T[P]> :
    T[P];
};
