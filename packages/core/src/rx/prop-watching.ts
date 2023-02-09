const watched = new Map<object, { [key: string]: ((value: any) => void)[]}>();

const WATCHED_STATE_KEY = '__prop_watching';
const WATCHED_STATE_KEY_ORIG = '__prop_watching_orig';

const helpers = {
  setter: function(
    object: object, propKey: string, value: any,
    callbacks: { [key: string]: ((value: any) => void)[]}
  ) {
    // console.debug(
    //   `PropWatching: prop ${propKey} modified on object: `, value, object
    // );
    (object as any)[WATCHED_STATE_KEY][propKey] = value;

    if (!(propKey in callbacks)) {
      // we dont throw here to on purpose to maybe try and let the assignment at
      // least work
      console.error('Prop watching could not find list of callbacks');
      return;
    }

    for (let callback of (callbacks as any)[propKey]) callback(value);
  }
}

const propWatching = {

  /**
   * Run a callback function whenever a property of a given object changes. This works
   * regardless of wether the given property is defined directly or using getters &
   * setters. Not calling {@link removeChangedListener} would likely be a memory leak, so
   * make sure to call that when your listener is no longer needed.
   *
   * Note that this modifies under the hood this sets up new setters & getters. This
   * should not be noticable for pretty much all objects, but some really advanced objects
   * may have problems with this. The original setters & getters are also restored when
   * the all listeners were removed using {@link removeChangedListener}.
   *
   * @example
   * ```typescript
   * class Test {
   *   p = 2;
   * }
   *
   * const test = new Test();
   *
   * let count = 0;
   * propWatching.addChangedListener(test, 'p', _ => { count++; });
   *
   * test.p = 4; // => count == 1
   * test.p = 4; // => count == 2
   * ```
   */
  addChangedListener: function<T extends object>(
    object: T, propKey: Extract<keyof T, string>,
    callback: (value: T[typeof propKey]) => void,
  ) {
    const inMap = watched.get(object);
    const callbacks = inMap ?? {};
    if (!inMap) watched.set(object, callbacks);

    // case 0: we already have set up a listener
    // ----------------------------------------------------------------------

    if (propKey in callbacks) {
      if (callbacks[propKey as any].indexOf(callback) !== -1) return;
      callbacks[propKey as any].push(callback);
      return;
    } else {
      callbacks[propKey as any] = [];
      callbacks[propKey as any].push(callback);
    }
    
    // general setup
    // ----------------------------------------------------------------------
    
    if ((object as any)[WATCHED_STATE_KEY] === undefined) {
      (object as any)[WATCHED_STATE_KEY] = {};
    }
    if ((object as any)[WATCHED_STATE_KEY_ORIG] === undefined) {
      (object as any)[WATCHED_STATE_KEY_ORIG] = {};
    }

    (object as any)[WATCHED_STATE_KEY][propKey] = object[propKey];

    // case 1: prop is defined normally
    // ----------------------------------------------------------------------

    if (Object.keys(object).includes(propKey)) {
      (object as any)[WATCHED_STATE_KEY_ORIG][propKey] = 'normal';

      Object.defineProperty(object, propKey, {
        set(v: T[typeof propKey]) {
          helpers.setter(object, propKey, v, callbacks);
        },
        get() {
          const val = (object as any)[WATCHED_STATE_KEY][propKey];
          // console.debug(`PropWatching: prop ${propKey} read on object: `, val, object);
          return val;
        },
        configurable: true, enumerable: true
      });

      return;
    }

    // case 2: prop is defined with getters & setters
    // ----------------------------------------------------------------------

    const proto = object.constructor.prototype;
    const descs = Object.getOwnPropertyDescriptors(proto);
    const descKeys = Object.keys(descs).filter(el => el !== 'constructor');
    if (descKeys.includes(propKey)) {
      const desc = descs[propKey];

      if (!desc.configurable) throw new Error(
        'Only objects with the "configurable" attribute may be watched'
      );

      const orig = { set: desc.set, get: desc.get };

      (object as any)[WATCHED_STATE_KEY_ORIG][propKey] = orig;

      if (orig.set === undefined) throw new Error(
        'When watching an an object property that is defined by ' +
        'getters or setters, at least the setter must be defined'
      );

      const newSetter = (value: any) => {
        const newVal = orig.set!.bind(object)(value);
        helpers.setter(object, propKey, newVal, callbacks);
      }

      if (orig.get) {
        Object.defineProperty(object, propKey, {
          set(v: any) {
            newSetter(v);
          },
          get() {
            const val = orig.get!.bind(object)();
            // console.debug(
            //   `PropWatching: prop ${propKey} read on object: `, val, object
            // );
            return val;
          },
          configurable: true, enumerable: true
        })
      } else {
        Object.defineProperty(object, propKey, {
          set(v: any) {
            newSetter(v);
          },
          configurable: true, enumerable: true
        })
      }
    }

  },

  /**
   * Remove a listener that was added with {@link addChangedListener} (which see for
   * details).
   *
   * It is possible (but not recommended unless you know what you are doing) to prevent
   * cleaning up the object to its original state with its original getters & setters. It
   * is left as an option in case some library you use does something equally deep as
   * the listeners here and is perhaps therefore not happy about the cleanup.
   *
   * @example
   * ```typescript
   * class Test {
   *   p = 2;
   * }
   *
   * const test = new Test();
   *
   * let count = 0;
   * const listener = () => { count++; };
   * propWatching.addChangedListener(test, 'p', listener);
   *
   * test.p = 4; // => count == 1
   * test.p = 4; // => count == 2
   *
   * propWatching.removeChangedListener(test, 'p', listener);
   *
   * test.p = 4; // => count == 2 (still)
   * ```
   */
  removeChangedListener: function<T extends object>(
    object: T, propKey: Extract<keyof T, string>,
    callback: (value: T[typeof propKey]) => void,
    noCleanup: boolean = false,
  ) {
    const inMap = watched.get(object);
    if (!inMap) throw new Error(
      `PropWatching: No listeners registered for given object`,
    );
    if (!(propKey in inMap)) throw new Error(
      `PropWatching: No listeners registered on ${propKey} for given object`,
    );
    const callbacks: ((value: any) => void)[] = (inMap as any)[propKey];

    if (callbacks.indexOf(callback) === -1) throw new Error(
      `PropWatching: Given listener not registered on ${propKey} for given object`,
    )

    callbacks.splice(callbacks.indexOf(callback), 1);

    if (callbacks.length === 0 && !noCleanup) {
      const orig = (object as any)[WATCHED_STATE_KEY_ORIG][propKey];
      if (typeof orig === 'string' && orig === 'normal') {

        Object.defineProperty(object, propKey, {
          value: (object as any)[WATCHED_STATE_KEY],
          writable: true, configurable: true, enumerable: true
        });

      } else if (typeof orig === 'object') {

        Object.defineProperty(object, propKey, {
          set: orig.set,
          get: orig.get,
          configurable: true, enumerable: true
        });
        
      } else {
        throw new Error(`Unrecognized original value for ${propKey}`);
      }
    }
    
  },
  
}

export default propWatching;
