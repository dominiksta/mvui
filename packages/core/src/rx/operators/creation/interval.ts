import Stream from "../../stream";

/**
 * TODO
 */
export default function interval(
  ms: number
): Stream<number> {
  return new Stream(observer => {
    let iteration = 0;
    const interval = setInterval(() => {
      observer.next(iteration++);
    }, ms);

    return function teardown() {
      clearInterval(interval);
    }
  })
}
