export type Newable<T> = { new (...args: any[]): T };
export type Constructor<T> = abstract new (...args: any[]) => T;