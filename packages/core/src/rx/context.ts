import type Component from "../component";

/**
   Contexts are a way that components can share state (or any arbitrary object really)
   that is local to a component *and all its arbitrarily deeply nested children*. In that
   sense they differ from both global and component local state.

   For simple use-cases, it is preferable to use events and state bindings. There are
   situations though where more powerful state sharing is desirable.

   See also {@link Component#getContext} and {@link Component#provideContext}.

   @example
   ```typescript
   const myCtx = new rx.Context(() => new rx.State(0));

   class CtxProvider extends Component {
     render() {
       const ctx = this.provideContext(myCtx);
       return [
         h.div(ctx.derive(v => 'Value in Provider: ')),
         h.slot(),
       ]
     }
   }
   const [ctxprovider] = define(CtxProvider);

   class CtxConsumer extends Component {
     props = { value: new rx.Prop('') }

     render() {
       const ctx = this.getContext(myCtx);
       return [
         h.button({ events: { click: _ => ctx.next(this.props.value) }}),
       ]
     }
   }
   const [ctxconsumer] = define(CtxConsumer);

   class Main extends Component {
     render() {
       return [
         ctxprovider([
           ctxconsumer({ props: { value: 'val1' }),
           ctxconsumer({ props: { value: 'val2' }),
         ])
       ]
     }
   }

   // when clicking one of the consumers, the value in the provider will update
   ```

   ### In Other Frameworks

   Contexts exist in pretty much all modern frontend frameworks in one way or
   another. React, [Solid][1] and [Svelte][2] all have them, [lit-element is
   experimenting][3] with them and even though angular has no contexts specifically, it
   can still share state with nested child components via ["sandboxing"][4].

   [1]: https://www.solidjs.com/docs/latest#createcontext
   [2]: https://svelte.dev/docs#run-time-svelte-setcontext
   [3]: https://lit.dev/docs/data/context/
   [4]: https://angular.io/guide/dependency-injection-in-action#multiple-service-instances-sandboxing
 */
export default class Context<T> {
  constructor(public generateInitialValue: () => T) {}
}
