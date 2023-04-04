import Stream from "../../stream";

export default function of<ValuesT>(values: Iterable<ValuesT>): Stream<ValuesT> {
  return new Stream(observer => {
    for (let value of values) observer.next(value);
    observer.complete();
  })
}
