import { rx } from "$thispkg";
import { sleep } from "$thispkg/util/time";
import { attempt } from "../../../support/helpers";

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

  })
})
