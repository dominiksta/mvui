import { Subject } from "./observables";

function identity<T>(v: T) { return v; };

export default class Prop<T> extends Subject<T> {

  options: {
    reflect: boolean | string,
    converter: {
      toString: (v: T) => string, fromString: (v: string) => T
    }
  } = {
    reflect: false,
    converter: { toString: identity as any, fromString: identity as any }
  }

  constructor(
    initial: T,
    options?: {
      reflect?: boolean | string,
      converter?: {
      toString: (v: T) => string, fromString: (v: string) => T
      } | StringConstructor | NumberConstructor |
      BooleanConstructor | ObjectConstructor
    },
  ) {
    super(initial);

    if (options) {
      if (options.reflect) this.options.reflect = options.reflect;

      if (options.converter) {
        if ('fromString' in options.converter) {
          this.options.converter = options.converter;
        } else if (options.converter === Number) {
          this.options.converter = {
            fromString: v => {
              const ret = parseFloat(v);
              if (isNaN(ret)) throw new Error(
                `Could not parse number prop: ${v}`
              );
              return ret as any;
            },
            toString: JSON.stringify,
          }
        } else if (options.converter === String) {
          this.options.converter = {
            fromString: identity as any,
            toString: identity as any,
          }
        } else if (options.converter === Boolean) {
          this.options.converter = {
            fromString: v => (v === 'true') as any,
            toString: JSON.stringify,
          }
        } else if (options.converter === Object) {
          this.options.converter = {
            fromString: JSON.parse,
            toString: JSON.stringify,
          }
        }
      }
    }
    
  }
}
