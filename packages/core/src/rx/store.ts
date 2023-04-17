import { Subscribable } from "./interface";
import { identity } from "../util/other";
import { DerivedState } from "./derived-state";
import MulticastStream from "./multicast-stream";
import State, { LinkedState } from "./state";
import Stream, { ObserverDefinition } from "./stream";
import { RecursivePartial } from "../util/types";
import { patchObject } from "../util/datastructure";

type DefaultReducers<StateT> = {
  set: (current: StateT, payload: StateT) => StateT,
  patch: (current: StateT, payload: RecursivePartial<StateT>) => StateT,
  reset: (current: StateT) => StateT,
};

type ReducersT<ReducersT, StateT> = ReducersT & DefaultReducers<StateT>;

type ReduceT<
  CustomReducersT extends {
    [key: string]: (current: StateT, payload: any) => StateT
  }, StateT
> = {
  [K in keyof ReducersT<CustomReducersT, StateT>]: (
    payload: Parameters<ReducersT<CustomReducersT, StateT>[K]>[1] extends undefined
        ? void
        : Parameters<ReducersT<CustomReducersT, StateT>[K]>[1]
  ) => void
};

type EffectDefinition<
  CustomReducersT extends { [key: string]: (current: StateT, payload: any) => StateT },
  StateT,
  PayloadT
> =
  (reduce: ReduceT<CustomReducersT, StateT>, payload: Stream<PayloadT>)
    => Stream<any>;

/**
   A Store holds some state, but it differs from a simple {@link State} object in three
   ways:

   - You can/should define state transistions as pure functions called "reducers" instead
     of calling ".next" directly.
   - You can/should define derived state with the "selectors" parameter instead of calling
     ".derive" directly.
   - You can/should define side effects using "store.effect" instead. More on this later.

   Fundamentally, this is very similar in spirit and terminology to [Redux][1] or
   [NgRx][2].

   ### Basic Example

   ```typescript
   const store = new rx.Store({
     initialState: { p1: 4, p2: 'hi' },
     reducers: {
       lower: v => ({ ...v, p2: v.p2.toLowerCase() }),
       upper: v => ({ ...v, p2: v.p2.toUpperCase() }),
       concat: (v, add: string) => ({ ...v, p2: v.p2 + add }),
     },
     selectors: {
       appendWorld: v => v.p2 + ' World',
     }
   });

   store.select.appendWorld.subscribe(v => console.log(v));

   store.reduce.upper(); // logs: HI World
   store.reduce.concat(' dear'); // logs: HI dear World
   ```

   Expressing the same code with a simple State object would look like this:

   ```typescript
   const state = new rx.State({ p1: 4, p2: 'hi' });

   const appendWorld = state.derive(v => v.p2 + ' World');

   appendWorld.subscribe(v => console.log(v));

   state.next(v => v.toUpperCase()); // logs: HI World
   state.next(v => v + ' dear'); // logs: HI dear World
   ```

   While using a State object is less code and simpler to understand in simple scenarious,
   a Store has the huge advantage of being more "declarative", which in this context
   simply means that **all code related to state transitions can be centralized** in one
   place. This can make refactoring and reading complex stateful logic significantly
   easier.

   However, you absolutely *should* use a "normal" State object for simple use cases.

   ### Effects

   Effects are an important strategy to avoid race conditions when asynchronously updating
   the state of a Store. See {@link Store#effect}.

   ### Usage in a Component

   A Store largely does not care about where it is defined. It is also a much lighter
   abstraction then redux, so defining it in the render() method of a component is not an
   issue.

   The only thing to note is that the store should be wrapped in a `this.subscribe` call
   to set up and tear down the effects properly.

   ```typescript
   class StoreComponent extends Component {
     render() {
       const store = this.subscribe(new rx.Store({
         initialState: { p1: 4, p2: 'hi' },
         reducers: {
           concat: (v, add: string) => ({ ...v, p2: v.p2 + add }),
         },
       }));

       const effect = store.effect(
         (reduce, payload: rx.Stream<void>) => payload.pipe(
           rx.delay(10),
           rx.tap(_ => reduce.concat(' effect'))
         )
       );

       return [
         h.span(store.state.derive(v => v.p2)),
         h.button({
           events: { click: _ => {
             effect();
           }}
         }, 'Add "effect"'),
       ]
     }
   }

   ```

   [1]: https://redux.js.org/
   [2]: https://ngrx.io/guide/component-store
 */
export default class Store<
  StateT,
  CustomReducersT extends { [key: string]: (current: StateT, payload: any) => StateT },
  SelectorsT extends { [key: string]: (current: StateT) => any },
> implements Subscribable<StateT> {

  state: DerivedState<StateT>;

  get value() { return this.#state.value; }

  #state: State<StateT>;
  #reducers: ReducersT<CustomReducersT, StateT>;
  select: {
    [K in keyof SelectorsT]: DerivedState<ReturnType<SelectorsT[K]>>
  };
  /**
     Call one of the defined reducers. Internally calls {@link Store#dispatch}.
   */
  reduce: ReduceT<CustomReducersT, StateT>;

  constructor(
    definition: {
      initialState: StateT,
      reducers: CustomReducersT,
      selectors?: SelectorsT,
    },
  ) {
    this.#state = new State(definition.initialState);
    this.state = this.#state.derive(identity);

    this.#reducers = {
      ...definition.reducers,
      set: (_, value) => value,
      reset: (_) => definition.initialState,
      patch: (old, payload) => patchObject(old as any, payload),
    } as ReducersT<CustomReducersT, StateT>;

    this.select = {} as any; // meh
    for (const s in definition.selectors)
      this.select[s] = this.#state.derive(definition.selectors[s]);

    const reducers = this.#reducers;
    this.reduce = {} as any; // meh
    Object.keys(reducers).forEach((k: keyof typeof reducers) => {
      this.reduce[k] = (payload: any) => this.dispatch({ type: k, payload } as any);
    })
  }

  /**
     Dispatch an action object "manually" to call a reducer. You will likely typically
     want to instead use the {@link Store#reduce} object to call reducers like regular
     functions instead.

     @example
     ```typescript
     const store = new rx.Store({
       initialState: 0,
       reducers: {
         inc: (v, payload: int) => v + payload,
       },
     });

     // these two calls are equivalent:
     store.dispatch({ type: 'inc', 4 });
     store.reduce.inc(4);
     ```
   */
  dispatch<K extends keyof ReducersT<CustomReducersT, StateT>>(
    action: Parameters<ReducersT<CustomReducersT, StateT>[K]>[1] extends undefined
      ? { type: K }
      : { type: K, payload: Parameters<ReducersT<CustomReducersT, StateT>[K]>[1] }
  ) {
    this.#state.next(
      this.#reducers[action.type](
        this.#state.value, (action as any)['payload']
      )
    );
  }

  /**
     Since all "reducer" functions must be pure functions, we need some other mechanism to
     modify state based on side effects, such as HTTP calls. You could technically of
     course just write an async function that calls the reducers of a store. However, this
     can easily result in race conditions (Imagine a user double clicking a button; What
     happens if the first request completes first?). Effects can solve this problem by
     using operators, specifically flattening operators like {@link switchMap}.

     ```typescript
     type SearchResult = { name: string, weight: number };

     const store = new rx.Store<SearchResult[]>({
       initialState: [],
       reducers: { },
     });

     const search = store.effect(
       (reduce, payload: rx.Stream<string>) => payload.pipe(
         rx.switchMap(payload => http.get<SearchResult[]>(
           '/api/search', { pathParams: { query: payload }}
         )),
         rx.tap(response => reduce.set(response.body))
       )
     );

     store.subscribe(); // this sets up the effects

     search('search 1');
     search('search 2'); // old requests get automatically canceled here

     // the async function alternative (beware the race conditions)
     async function searchMeh(payload: string) {
       const response = await lastValueFrom(
         http.get<SearchResult[]>('/api/search', { pathParams: { query: payload })
       );
       store.reduce.set(response.body);
     }

     searchMeh('search 1');
     searchMeh('search 2'); // first request might terminate later
     ```
   */
  effect<PayloadT>(
    definition: EffectDefinition<CustomReducersT, StateT, PayloadT>
  ): (payload: PayloadT) => void {
    const args = new MulticastStream<PayloadT>();
    this.#effects.push({ def: definition, args });
    if (this.#refCount !== 0)
      this.#unsubEffects.push(definition(this.reduce, args).subscribe())
    return payload => args.next(payload);
  }

  #effects: {
    def: EffectDefinition<CustomReducersT, StateT, any>, args: MulticastStream<any>
  }[] = [];

  #unsubEffects: (() => void)[] = [];


  // how often this store is subscribed to
  #refCount = 0;

  /**
     Set up listeners for defined {@link Store#effect}s. When all subscribers have
     unsubscribed, effect listeners will be torn down again.

     Otherwise behaves much same as subscribing directly to `this.{@link Store#state}`.
   */
  subscribe(observer: ObserverDefinition<StateT>) {
    this.#refCount++;
    if (this.#refCount === 1) {
      this.#unsubEffects = this.#effects.map(eDef =>
        eDef.def(this.reduce, eDef.args).subscribe()
      );
    }

    const unsubState = this.#state.subscribe(observer);

    return () => {
      this.#refCount--;
      if (this.#refCount === 0)
        for (const unsubEffect of this.#unsubEffects) unsubEffect();
      unsubState();
    };
  }


  // huge type definition incoming

  /**
     Get some (nested) object property of the current state. May be bound to a
     component template. When calling ".next", a "patch" action will be dispatched.

     @example
     ```typescript
     const store = new rx.Store({
       initialState: { a: 4, b: { c: 'hi' } },
       reducers: { },
     });

     console.log(store.partial('b', 'c').value); // -> hi
     console.log(store.value.b.c);               // -> hi
     store.partial('b', 'c').next('hi dear');
     console.log(store.partial('b', 'c').value); // -> hi dear
     console.log(store.value.b.c);               // -> hi dear
     ```
   */
  partial<
    K1 extends keyof StateT,
  >(k1: K1): LinkedState<StateT, StateT[K1]>;

  /** @ignore */
  partial<
    K1 extends keyof StateT, K2 extends keyof StateT[K1],
  >(k1: K1, k2: K2): LinkedState<StateT, StateT[K1][K2]>;

  /** @ignore */
  partial<
    K1 extends keyof StateT, K2 extends keyof StateT[K1],
    K3 extends keyof StateT[K1][K2],
  >(k1: K1, k2: K2, k3: K3): LinkedState<StateT, StateT[K1][K2][K3]>;

  /** @ignore */
  partial<
    K1 extends keyof StateT, K2 extends keyof StateT[K1],
    K3 extends keyof StateT[K1][K2], K4 extends keyof StateT[K1][K2][K3],
  >(k1: K1, k2: K2, k3: K3, k4: K4): LinkedState<StateT, StateT[K1][K2][K3][K4]>;

  /** @ignore */
  partial<
    K1 extends keyof StateT, K2 extends keyof StateT[K1],
    K3 extends keyof StateT[K1][K2], K4 extends keyof StateT[K1][K2][K3],
    K5 extends keyof StateT[K1][K2][K3][K4]
  >(
    k1: K1, k2: K2, k3: K3, k4: K4, k5: K5
  ): LinkedState<StateT, StateT[K1][K2][K3][K4][K5]>;

  partial<
    K1 extends keyof StateT, K2 extends keyof StateT[K1],
    K3 extends keyof StateT[K1][K2], K4 extends keyof StateT[K1][K2][K3],
    K5 extends keyof StateT[K1][K2][K3][K4],
    K6 extends keyof StateT[K1][K2][K3][K4][K5],
  >(
    k1: K1, k2: K2, k3: K3, k4: K4, k5: K5, k6: K6
  ): LinkedState<StateT, StateT[K1][K2][K3][K4][K5][K6]>;

  /** @ignore */
  partial<
    K1 extends keyof StateT, K2 extends keyof StateT[K1],
    K3 extends keyof StateT[K1][K2], K4 extends keyof StateT[K1][K2][K3],
    K5 extends keyof StateT[K1][K2][K3][K4],
    K6 extends keyof StateT[K1][K2][K3][K4][K5],
  >(
    k1: K1, k2: K2, k3: K3, k4: K4, k5: K5, k6: K6, ...rest: string[]
  ): LinkedState<StateT, unknown>;

  partial(...args: (string | number | symbol)[]): LinkedState<StateT, any> {
    return this.#state.createLinked(
      v => {
        let current: any = v;
        for (const a of args) current = current[a];
        return current;
      },
      (v, _next) => {
        const patcher = {} as any;
        let current = patcher;
        for (const a of args.slice(0, -1)) {
          current[a] = {};
          current = current[a];
        }
        current[args[args.length - 1]] = v;
        this.reduce.patch(patcher);
      }
    );
  }
}
