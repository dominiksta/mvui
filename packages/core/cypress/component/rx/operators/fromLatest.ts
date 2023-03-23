import { rx } from "$thispkg";
import { attempt } from "../../../support/helpers";

export const testFromLatest = () => attempt(() => {
  const [counter, multiplier] = [new rx.State(2), new rx.State(5)];

  function testSum(sum: rx.Stream<number>) {
    sum.subscribe(v => {
      expect(v).to.be.eq(counter.value * multiplier.value);
    });
    counter.next(4);
    multiplier.next(3);
    counter.next(2);
    multiplier.next(5);
  }

  const sumObj = rx.fromLatest(
    { c: counter, m: multiplier }
  ).map(v => v.c * v.m);
  testSum(sumObj);

  const sumArr1 = rx.fromLatest(
    [counter, multiplier]
  ).map(([counter, multiplier]) => counter * multiplier);
  testSum(sumArr1);

  const sumArr2 = rx.fromLatest(
    counter, multiplier
  ).map(([counter, multiplier]) => counter * multiplier);
  testSum(sumArr2);
});

