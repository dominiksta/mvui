import { Observable, Subject, PromisedSubject } from "./rx";
import { sleep } from "./util/time";
import TestPage from "./test/page";

const testPage = new TestPage();
document.body.appendChild(testPage);
// setTimeout(() => document.body.removeChild(testPage), 200);
// setTimeout(() => document.body.appendChild(testPage), 600);


// const obs$ = new Observable<number>((next) => {
//   next(1);
//   next(2);
//   console.log("hi");
//   next(3);
//   setTimeout(() => {
//     next(4);
//     // subscriber.complete();
//   }, 1000);
// })
// 
// // obs$.subscribe(v => console.log(v));
// obs$.map(v => v + 1).filter(v => v % 2 == 0).subscribe(console.log)
// 

// const subj$ = new Subject(0);
// // const unsub = subj$.subscribe(console.log);
// // subj$.map(v => v + 1).subscribe(console.log);
// // subj$.map(v => v + 1).map(v => v + 1).subscribe(console.log);
// const unsub = subj$.map(v => v + 1).filter(v => v % 2 == 0).subscribe(console.log);
// 
// setInterval(() => {
//   // if (subj$.value < 10)
//   subj$.next(subj$.value + 1);
// }, 500)
// 
// setTimeout(() => {
//   // console.log(subscription);
//   unsub()
// }, 3000)


// const promised$ = new PromisedSubject(async () => {
//   await sleep(1000);
//   return "hi";
// })
// 
// // promised$.map(v => v.data).subscribe(console.warn)
// promised$.data.subscribe(console.warn)
