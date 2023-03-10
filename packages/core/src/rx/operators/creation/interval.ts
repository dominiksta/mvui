import Stream from "../../stream";

/**
 * TODO
 */
export default function interval(
  ms: number
): Stream<void> {
  return new Stream(observer => {
    const interval = setInterval(observer.next.bind(observer), ms);

    return function teardown() {
      clearInterval(interval);
    }
  })
}
