import Stream from "../../stream";

/**
   Create a {@link Stream} from an array. All values are emitted instantly.

   @example
   ```typescript
   rx.of([1, 2, 3]).subscribe(console.log);
   // prints instantly:
   // 1
   // 2
   // 3
   ```

   @group Stream Creation Operators
 */
export default function of<ValuesT>(...values: ValuesT[]): Stream<ValuesT> {
  return new Stream(observer => {
    for (let value of values) observer.next(value);
    observer.complete();
  })
}
