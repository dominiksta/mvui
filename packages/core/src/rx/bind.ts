import { identity } from "util/other";
import State, { LinkedState } from "./state";

const BIND_MARKER = Symbol();
export type Binding<T> = { marker: typeof BIND_MARKER, value: State<T> };

/**
 * This marks a {@link State} object in a template to be a two-way-binding
 *
 * @example
 * ```typescript
 * class MyBoundInput extends Component {
 *   props = { value: new Prop('') };
 *
 *   render = () => [
 *     h.input({ fields: { ...this.props }, events: {
 *       keyup: e => this.props.value.next(e.target.value)
 *     }})
 *   ]
 * }
 *
 * class BindingTest extends Component {
 *   #state = new rx.State('initial');
 *
 *   render = () => [
 *     MyBoundInput.new({ props: { value: rx.bind(this.#state) }}),
 *     h.input({ fields: { value: rx.bind(this.#state) }}),
 *     h.div(this.#state),
 *     h.button({ events: { click: _ => this.#state.next('intial') }}, 'reset')
 *   ]
 * }
 * ```
 */
export default function bind<T>(
  state: State<T>
  // TODO: type coercion, maybe custom transform functions
): Binding<T> {
  return { marker: BIND_MARKER, value: state };
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
}
