import Observable from "../../observable";

export default function of<ValuesT>(values: Iterable<ValuesT>): Observable<ValuesT> {
  return new Observable(observer => {
    for (let value of values) observer.next(value);
  })
}
