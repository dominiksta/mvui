import { rx } from "$thispkg";
import { OperatorFunction } from "$thispkg/rx/stream";
import { attempt, sleep } from "../../support/helpers";

context('Reactivity', () => {
  describe('Streams', () => {
    it('subscribing to a synchronous definition returns the correct result',
      attempt(() => {

        const obs$ = new rx.Stream<number>(observer => {
          observer.next(1); observer.next(2); observer.next(3);
        })

        const result: number[] = [];
        obs$.subscribe(v => result.push(v));
        expect(result.length).to.be.eq(3);
        expect(result).to.deep.eq([1, 2, 3]);
      }))

    it('completion', attempt(() => {
      const obs$ = new rx.Stream<number>(observer => {
        observer.next(1);
        observer.next(2);
        observer.complete();
        observer.next(3);
      })

      let result: number[] = [];
      let completed = false;
      obs$.map(v => v + 1).subscribe({
        next(v) { result.push(v); },
        error(e) { console.log('e'); },
        complete() { completed = true; }
      });

      expect(completed).to.be.true;
      expect(result.length).to.eq(2);
      expect(result).to.deep.eq([2, 3]);
    }))

    it('unsubscribe cancels further emissions', attempt(async () => {
      let values: number[] = [];
      const unsub = new rx.Stream<number>(observer => {
        observer.next(1);
        sleep(300).then(() => observer.next(2));
      }).subscribe(v => values.push(v));

      expect(values).to.deep.eq([1]);
      unsub();
      await sleep(400);
      expect(values).to.deep.eq([1]);
    }))


    it('error handling', attempt(() => {
      const obs$ = new rx.Stream<number>(observer => {
        observer.next(1);
        observer.next(2);
        // note that if we threw in a setTimeout here, the error would not be caught. while
        // maybe unintuitive, this is actually also how it works in rxjs
        throw new Error('hi');
        // observer.complete();
        observer.next(3);
      })

      let result: number[] = [];
      let calledError = false;

      obs$.map(v => v + 1).subscribe({
        next(v) { result.push(v) },
        error(e) {
          calledError = true;
          expect(e instanceof Error).to.be.true;
          expect(e.message).to.eq('hi');
        },
        complete() {
          // complete is not called on error
          expect(false).to.be.true;
        }
      });

      expect(calledError).to.be.true;
      expect(result.length).to.eq(2);
      expect(result).to.deep.eq([2, 3]);
    }))

    it('complete before error', attempt(() => {
      const stream = new rx.Stream<number>(observer => {
        observer.next(1);
        observer.next(2);
        observer.complete();
        throw new Error('err');
        observer.next(3);
      })

      let result: number[] = [];
      let completed = false;
      stream.map(v => v + 1).subscribe({
        next(v) { result.push(v); },
        complete() { completed = true; }
      });

      expect(completed).to.be.true;
      expect(result.length).to.eq(2);
      expect(result).to.deep.eq([2, 3]);
    }))


    it('streams are unicast', attempt(() => {
      let resource = 0;
      const obs$ = new rx.Stream<number>(observer => {
        resource++;
        observer.next(1); observer.next(2); observer.next(3);
      })

      obs$.subscribe();
      obs$.subscribe();

      expect(resource).to.eq(2);
    }))

    it('pipe', attempt(() => {
      const obs$ = new rx.Stream<number>(observer => {
        observer.next(1); observer.next(2); observer.next(3);
      })

      const result: number[] = [];
      obs$.pipe(
        rx.map(v => v + 1), rx.map(v => v + 2),
      ).subscribe(v => result.push(v));
      expect(result.length).to.eq(3);
      expect(result).to.deep.eq([4, 5, 6]);
    }))

    it('map operator', attempt(() => {
      const obs$ = new rx.Stream<number>(observer => {
        observer.next(1); observer.next(2); observer.next(3);
      })

      const result: number[] = [];
      obs$.map(v => v + 3).subscribe(v => result.push(v));
      expect(result.length).to.eq(3);
      expect(result).to.deep.eq([4, 5, 6]);
    }))

    it('filter operator', attempt(() => {
      const obs$ = new rx.Stream<number>(observer => {
        observer.next(1); observer.next(2); observer.next(3);
      })

      const result: number[] = [];
      obs$.filter(v => v === 2 || v === 3).subscribe(v => result.push(v));
      expect(result.length).to.eq(2);
      expect(result).to.deep.eq([2, 3]);
    }))


    it('map & filter chain', attempt(() => {
      const obs$ = new rx.Stream<number>(observer => {
        observer.next(1); observer.next(2); observer.next(3);
        observer.next(4); observer.next(5); observer.next(6);
      })

      let result: (number | string)[] = [];
      obs$.map(v => v + 2)
        .filter(v => v % 2 === 0)
        .map(v => v === 4 ? 'hi' : v)
        .subscribe(v => result.push(v));

      expect(result.length).to.eq(3);
      expect(result).to.deep.eq(['hi', 6, 8]);

      result = [];
      obs$.pipe(
        rx.map(v => v + 2),
        rx.filter(v => v % 2 === 0),
        rx.map(v => v === 4 ? 'hi' : v),
      ).subscribe(v => result.push(v));

      expect(result.length).to.eq(3);
      expect(result).to.deep.eq(['hi', 6, 8]);
    }))


    it('custom operators', attempt(() => {
      const obs$ = new rx.Stream<number>(observer => {
        observer.next(1); observer.next(2); observer.next(3);
        observer.next(4); observer.next(5); observer.next(6);
      })

      const customOperator: () => OperatorFunction<number, number | string> = () =>
        rx.pipe(
          rx.map((v: number) => v + 2),
          rx.filter((v: number) => v % 2 === 0),
          rx.map(v => v === 4 ? 'hi' : v),
        );

      const result: (number | string)[] = [];
      obs$.pipe(
        customOperator(),
      ).subscribe(v => result.push(v));

      expect(result.length).to.eq(3);
      expect(result).to.deep.eq(['hi', 6, 8]);

    }))

    it('async subscribe & cleanup', attempt(async () => {
      const values: {
        one: number[], two: number[]
      } = {
        one: [], two: []
      }

      let cleared = 0;

      const obs = new rx.Stream<number>(obs => {
        let val = 0;
        const interval = setInterval(() => obs.next(val++), 100);
        // console.log(interval);
        return () => {
          clearInterval(interval);
          cleared++;
        }
      })

      const unsub1 = obs.subscribe(v => {
        values.one.push(v);
      })

      const unsub2 = obs.subscribe(v => {
        values.two.push(v);
      })

      setTimeout(() => {
        unsub1(); // console.log('unsub 1');
      }, 550);

      setTimeout(() => {
        unsub2(); // console.log('unsub 2');
      }, 1050);

      expect(cleared).to.eq(0);

      await sleep(700);

      expect(cleared).to.eq(1);

      await sleep(2000);

      expect(cleared).to.eq(2);

      expect(values.one).to.deep.eq([0, 1, 2, 3, 4]);
      expect(values.two).to.deep.eq([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    }))

  })
})

