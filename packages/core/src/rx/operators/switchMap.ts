import Stream, { OperatorFunction } from "../stream";
import from, { StreamInput } from "./creation/from";

/**
   Switch from one Stream to another. This is really useful for robust asynchronous
   reactivity. It is analogous to the RxJS operator of the same name. There are a million
   explanations of what it does already online which will explain better then any
   docstring here could.

   @see https://rxjs.dev/api/operators/switchMap
   @see https://blog.angular-university.io/rxjs-switchmap-operator/
   @see https://youtu.be/Byttv3YpjQk?si=diaiWakSuzCPrSJM&t=528

   @group Stream Operators
 */
export default function switchMap<T, O>(
  project: (value: T) => StreamInput<O>,
): OperatorFunction<T, O> {
  return orig => new Stream(observer => {

    let unsubProjected: (() => void) | undefined;

    let completedOrig = false, completedProjected = false;
    const maybeComplete = () =>
      completedOrig && completedProjected && observer.complete();

    const unsubOrig = orig.subscribe({
      ...observer,
      complete() {
        completedOrig = true;
        maybeComplete();
      },
      next(vOrig) {
        // console.debug('switchMap: next: ', vOrig);
        if (unsubProjected !== undefined) {
          // console.debug('unsub from orig with orig value: ', vOrig);
          unsubProjected();
        } 
        completedProjected = false;
        unsubProjected = from(project(vOrig)).subscribe({
          ...observer,
          next(vProjected) {
            // console.debug('switchMap: projected next: ', vProjected);
            observer.next(vProjected);
          },
          complete() {
            completedProjected = true;
            maybeComplete();
          }
        });
      }
    });

    return unsubOrig;
  });
}
