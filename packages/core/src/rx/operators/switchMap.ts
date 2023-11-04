import Stream, { OperatorFunction } from "../stream";
import from, { StreamInput } from "./creation/from";

/**
   TODO

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
