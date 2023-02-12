import State from "./state";

export const BIND_MARKER = Symbol();

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
): State<T> {
  (state as any)[BIND_MARKER] = true;
  return state;
}
