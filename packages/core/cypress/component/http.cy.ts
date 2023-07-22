import { http, rx } from "$thispkg";
import { sleep } from "$thispkg/util/time";
import { attempt } from "../support/helpers";

context('Reactivity', () => {
  
  describe('http', () => {

    it('fromFetch operator: basic get', attempt(async () => {

      return new Promise<void>(resolve => {
        rx.fromFetch('/test').subscribe({
          next: async v => {
            expect(await v.json()).to.deep.eq([1, 2, 3]);
            resolve();
          },
          error(e) { throw e; }
        })
      });

    }))

    it('fromFetch operator: error 404', attempt(async () => {

      return new Promise<void>(resolve => {
        rx.fromFetch('/404').subscribe({
          next: _ => {
            assert(false);
          },
          error(e) {
            expect(e).to.be.instanceof(Response);
            expect(e.ok).to.be.false;
            expect(e.status).to.be.eq(404);
            resolve();
          }
        })
      });

    }))

    it('switchMap with http.get', attempt(async () => {

      let values: number[] = [];
      rx.interval(200).pipe(
        rx.take(3),
        rx.switchMap(iter =>
          http.get<number[]>('/first-takes-longer').pipe(
            rx.map(resp => {
              // console.log(resp.body);
              return resp.body.map(el => el + iter)
            })
          )
        ),
      ).subscribe(v => v.forEach(v => values.push(v)));

      await sleep(800);

      expect(values).to.deep.eq([2, 3, 4, 3, 4, 5])

    }))

    it('async/await with http.get', attempt(async () => {
      const resp = await http.get<number[]>('/test');
      expect(resp.body).to.deep.eq([1, 2, 3]);
    }))

  })
})
