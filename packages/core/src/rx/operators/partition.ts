import Stream from "../stream";
import from, { StreamInput } from "./creation/from";

/**
   Split a source stream in two: Every emission matching `predicate` will go into the
   first output stream, every other emission into the second.

   @example
   ```typescript
   const [threes, others] = rx.partition(rx.of(3, 4, 3, 7, 3, 5), v => v === 3);
   threes.subscribe(console.log); // will print: 3, 3, 3
   others.subscribe(console.log); // will print: 4, 7, 5
   ```

   @group Stream Operators
 */
export default function partition<T>(
  input: StreamInput<T>, predicate: (value: T) => boolean,
): [Stream<T>, Stream<T>] {
  return [
    from(input).filter(v => predicate(v)),
    from(input).filter(v => !predicate(v)),
  ]
}
