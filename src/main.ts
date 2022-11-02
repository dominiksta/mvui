import Html from "./html"
import { Observable, Subject } from "./observables";

const testEl = Html.Div([
  Html.H1('Heading'),
  Html.H3({ style: { background: 'red' } }, 'Heading Level 3'),
  Html.P('Here is some text in a paragraph'),
  Html.Input({ attrs: { type: "number", value: "4" }, instance: { alt: "hi" }})
]).render()

document.body.appendChild(testEl);



const obs$ = new Observable<number>((next) => {
  next(1);
  next(2);
  console.log("hi");
  next(3);
  setTimeout(() => {
    next(4);
    // subscriber.complete();
  }, 1000);
})

// obs$.subscribe(v => console.log(v));
obs$.map(v => v + 1).filter(v => v % 2 == 0).subscribe(console.log)


const subj$ = new Subject(0);
// const unsub = subj$.subscribe(console.log);
// subj$.map(v => v + 1).subscribe(console.log);
// subj$.map(v => v + 1).map(v => v + 1).subscribe(console.log);
const unsub = subj$.map(v => v + 1).filter(v => v % 2 == 0).subscribe(console.log);

setInterval(() => {
  // if (subj$.value < 10)
  subj$.next(subj$.value + 1);
}, 500)

setTimeout(() => {
  // console.log(subscription);
  unsub()
}, 3000)
