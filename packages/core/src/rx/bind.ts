import { identity } from "../util/other";
import State, { LinkedState } from "./state";

const BIND_MARKER = Symbol();
export type Binding<T> = { marker: typeof BIND_MARKER, value: State<T> };

/**
   This marks a {@link State} object in a template to be a two-way-binding

   @example
   ```typescript
   class MyBoundInput extends Component {
     props = { value: new Prop('') };

     render = () => [
       h.input({ fields: { ...this.props }, events: {
         keyup: e => this.props.value.next(e.target.value)
       }})
     ]
   }

   class BindingTest extends Component {
     #state = new rx.State('initial');

     render = () => [
       MyBoundInput.new({ props: { value: rx.bind(this.#state) }}),
       h.input({ fields: { value: rx.bind(this.#state) }}),
       h.div(this.#state),
       h.button({ events: { click: _ => this.#state.next('intial') }}, 'reset')
     ]
   }
   ```

   ### Serialization / Type Coercion

   You may wish to serialize between the element and your state object. This is because
   some elements - most notably the native input element - will have a `value` that is
   always a string regardless of wether or not that makes sense, like with an input with
   `type`=`number`.

   (You could also do this serialization manually by using {@link State#linked}.)

   ```typescript
   // ... in some component
   render() {
     const state = new rx.State(6);
     return [
       h.input({ fields: {
         type: 'number',
         // The value field of an HTML input is always a string by default
         value: rx.bind(state, { serialize: true })
       }}),
     ];
   }
   // ...
   ```
 */
export default function bind<T>(
  state: State<T>,
  options?: {
    serialize?: boolean,
  },
): any { // HACK: the return type here is any because we need to fit this into the
         // template
  if (options && options.serialize) {
    return { marker: BIND_MARKER, value: serialize(state) };
  } else {
    return { marker: BIND_MARKER, value: state };
  }
}


export function isBinding<T>(maybeBinding: unknown): undefined | State<T> {
  if (
    typeof maybeBinding === 'object' && maybeBinding !== null &&
      'marker' in maybeBinding && 'value' in maybeBinding
      && maybeBinding['value'] instanceof State
  ) {
    return maybeBinding.value;
  } else {
    return undefined;
  }
}

function serialize<T>(
  state: State<T>,
): LinkedState<T, string> {
  const t = typeof state.value;
  switch (typeof state.value) {
    case 'number':
      return state.createLinked(
        JSON.stringify,
        v => {
          const ret = parseFloat(v);
          if (isNaN(ret)) throw new Error(
            `Could not parse number for serialized state: ${v}`
          );
          return ret as any;
        },
      );
    case 'string':
      return state.createLinked(
        identity as any,
        identity as any,
      );
    case 'boolean':
      return state.createLinked(
        JSON.stringify,
        v => (v === 'true') as any
      );
    case 'object':
      return state.createLinked(
        JSON.stringify,
        JSON.parse
      );
    case 'undefined':
      return state.createLinked(
        _ => 'undefined',
        _ => undefined as any,
      );
    default:
      throw new Error(`Unsupported type to serialize: ${t}`)
  }
}
