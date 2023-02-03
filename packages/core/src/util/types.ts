export type Newable<T> = { new (...args: any[]): T };
export type Constructor<T> = new (...args: any[]) => T;
