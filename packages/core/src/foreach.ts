import { ToStringable } from './util';
import { DerivedState, State } from './rx';
import { TemplateElement, TEMPLATE_TRACKED } from './template-element';

type StateOrDerived<T> = State<T> | DerivedState<T>;

export default function foreach<T>(
  stream: State<T[]>,
  trackBy: ((value: T) => ToStringable) | 'pos',
  def: (el: DerivedState<T>, i: number) => TemplateElement<any>,
): DerivedState<TemplateElement<any>[]>;

export default function foreach<T>(
  stream: DerivedState<T[]>,
  trackBy: ((value: T) => ToStringable) | 'pos',
  def: (el: DerivedState<T>, i: number) => TemplateElement<any>,
): DerivedState<TemplateElement<any>[]>;

/**
   Generate a list of template elements for a reactive input list. While you *could* also
   just use {@link rx.derive} or {@link rx.map} for the same purpose, using `h.foreach`
   allows Mvui to skip re-rendering the generated children. In general, you should prefer
   using `h.foreach` to generate templates from reactive lists for both performance
   benefits and more intuitive behaviour.

   When possible, you should provide a way to uniquely identify the elements of the list
   by providing a `trackBy` function. Providing just the string 'pos' as a `trackBy`
   function instructs Mvui to keep track of template elements by their position, which
   will work fine in some scenarious but complex reordering operations may result in weird
   behaviour.

   The basic idea of this is the same as [keys in
   React](https://react.dev/learn/rendering-lists) or [trackBy in
   Angular](https://stackoverflow.com/questions/42108217/how-to-use-trackby-with-ngfor). The
   React documentation in particular does a great job of further explaining the concept.

   @example
   ```typescript
   const numbers: { [n: number]: string } = {
     1: 'one', 2: 'two', 3: 'three', 4: 'four', 5: 'five', 6: 'six',
   }

   @Component.register
   class ForeachTrackByPos extends Component {
     render() {
       const initial: string[] = [1, 2, 3].map(n => numbers[n]);
       const list = new rx.State(structuredClone(initial));

       return [
         h.button({
           events: { click: _ => list.next((l: string[]) => [
             ...l.slice(0, 1), ...l.slice(2)
           ]) }
         }, 'Remove Second'),
         h.button({
           fields: { id: 'reset' },
           events: { click: _ => list.next(structuredClone(initial)) }
         }, 'Reset'),
         h.section(
           { fields: { id: 'inputs' }},
           h.foreach(list, 'pos', (el: rx.DerivedState<string>, i) => h.div([
             h.input(
               {
                 fields: { value: el },
                 events: {
                   keyup: e => {
                     list.value[i] = (e.target as HTMLInputElement).value;
                     list.next((l: string[]) => [...l]);
                   }
                 }
               }
             ),
             h.span(h.pre(el)),
           ]))
         )
       ]
     }
   }
   ```
 */
export default function foreach<T>(
  stream: StateOrDerived<T[]>,
  trackBy: ((value: T) => ToStringable) | 'pos',
  def: (el: any, i: number) => TemplateElement<any>,
): DerivedState<TemplateElement<any>[]> {
  // when the list size changes, we still want to have some sane value for the template
  // elements that are no longer in the dom, since all template elements that belong to
  // the current component will update until the *component*, not the template el is
  // unmounted.
  // TODO: remove this once new subscription order is implemented

  let prev: T[] = [];
  return stream.derive((list: T[]) => list.map((_, i) => {
    for (let j = 0; j < list.length; j++) prev[j] = list[j];

    const track = (el: T) => (trackBy === 'pos' ? i : trackBy(el)).toString();
    const trackedOuter = track(list[i]);

    const template = def(stream.derive((l: T[]) => {
      if (trackBy === 'pos') {
        return l.length > i ? l[i] : prev[i];
      } else {
        const foundL = l.filter(el => track(el) === trackedOuter);
        // throwing here completes the stream, which causes this foreach to ignore any
        // further updates to the input list, making this hard to recover from. however,
        // i am personally almost always a fan of hard failures vs weird behaviour for
        // the end user.
        if (foundL.length > 1) throw new Error(
          `Duplicate or missing tracking keys: ` +
          `${JSON.stringify({ searchedFor: trackedOuter, exist: l.map(track) })}`
        );
        // console.debug({ found: foundL, i, 'l[i]': l[i], 'prev[i]': prev[i] });
        return foundL.length === 1 ? foundL[0] : prev[i];
      }
    }), i);

    (template as any)[TEMPLATE_TRACKED] = trackedOuter;
    return template;
  }));
}
