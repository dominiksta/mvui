import { Subscribable } from "../rx/subscribable";

export type Newable<T> = { new (...args: any[]): T };
export type Constructor<T> = new (...args: any[]) => T;

export type ToStringable = { toString: () => string };
export type MaybeSubscribable<T> = Subscribable<T> | T;
