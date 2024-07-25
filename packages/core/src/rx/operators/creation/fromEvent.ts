import Stream from "../../stream";

/**
   Create a {@link Stream} from certain events of a given HTMLElement. Usually, you
   probably just want to bind to events directly in the template. This operator is used by
   Mvui internally to do just that. But sometimes, you may want to do this "manually"
   yourself, maybe to chain some operators.

   @example
   ```typescript
   const btn = document.createElement('button');
   btn.innerText = 'click me';
   document.body.append(btn);
   rx.fromEvent(btn, 'click').subscribe(() => {
     console.log('click');
   });
   ```

   @example
   ```typescript
   class MyComponent extends Component {
     render {
       const myRef = this.ref<HTMLButtonElement>();
       this.onRendered(() => {
         this.subscribe(rx.fromEvent(myRef.current, 'click'), () => {
           console.log('click');
         })
       });
       return [
         h.button({ ref: myRef }, 'click me'),
       ]
     }
   }
   ```

   @group Stream Creation Operators
 */
export default function fromEvent<T extends keyof HTMLElementEventMap>(
  el: HTMLElement, eventType: T
): Stream<HTMLElementEventMap[T]> {
  return new Stream(observer => {
    const listener = observer.next.bind(observer);

    el.addEventListener(eventType, listener);
    
    return function teardown() {
      el.removeEventListener(eventType, listener);
    }
  })
}
