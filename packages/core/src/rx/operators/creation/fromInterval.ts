import Stream from "../../stream";

/**
 * TODO
 */
export default function fromInterval(
  ms: number
): Stream<void> {
  return new Stream(observer => {
    const interval = setInterval(observer.next.bind(observer), ms);

    return function teardown() {
      clearInterval(interval);
    }
  })
}
