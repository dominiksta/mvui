import Stream, { OperatorFunction } from "../stream";

/**
   TODO
 */
export default function switchMap<T, O>(
  project: (value: T) => Stream<O>,
): OperatorFunction<T, O> {
  return orig => new Stream(observer => {

    let unsubProjected: (() => void) | undefined;

    let completedOrig = false, completedProjected = false;
    const maybeComplete = () =>
      completedOrig && completedProjected && observer.complete();

    const unsubOrig = orig.subscribe({
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
        unsubProjected = project(vOrig).subscribe({
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

    return () => {
      unsubOrig();
    }
  });
}