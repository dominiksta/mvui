export default class Observable<T> {

  constructor(
    private subscriber: (next: (value: T) => void) => any
  ) { }

  subscribe(next: ((value: T) => void)) {
    this.subscriber(next)
  }

  map<ReturnT>(mapper: (value: T) => ReturnT): Observable<ReturnT> {
    return new Observable(next => {
      this.subscribe(v => { next(mapper(v)) })
    })
  }

  filter(filter: (value: T) => boolean): Observable<T> {
    return new Observable(next => {
      this.subscribe(v => { if (filter(v)) next(v) })
    })
  }
  
}
