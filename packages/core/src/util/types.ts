import { Stream } from "../rx";

export type Newable<T> = { new (...args: any[]): T };
export type Constructor<T> = new (...args: any[]) => T;

export type ToStringable = { toString: () => string };
export type MaybeStream<T> = Stream<T> | T;
