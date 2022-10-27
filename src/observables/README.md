# Observables and Subjects

## Usage

These are used across mvui to to implement reactive state.

```typescript
const subj$ = new Subject(0);

subj$.map(v => v + 1).map(v => v + 1).subscribe(console.log);

setInterval(() => {
  subj$.next(subj$.value + 1);
}, 500)

// Output will produce a series of numbers starting at 2 and incrementing 
// by two each iteration
```

## Observables? Like RxJS?

Well yes but no. This is an *extremely* simplified version of two basic concepts in RxJS:

- `Observable`: This class maps relatively closely to how it works in RxJS, with the
  exception that there are no operators, but `map` and `filter` are available as instance
  methods.
- `Subject`: This maps more closely to a `BehaviourSubject` in RxJS, but since we are not
  trying to actually reimplement RxJS here, a shorter and less annoying to type name
  seemed more reasonable.
