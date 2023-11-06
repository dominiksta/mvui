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


// credits: https://jobs.ataccama.com/blog/how-to-convert-object-props-with-undefined-type-to-optional-properties-in-typescript
type GetMandatoryKeys<T> = {
  [P in keyof T]: T[P] extends Exclude<T[P], undefined> ? P : never
}[keyof T];

export type UndefinedToOptional<T> = Partial<T> & Pick<T, GetMandatoryKeys<T>>;

// can sometimes help clean up types
export type Expand<T> = { [P in keyof T]: T[P] };
