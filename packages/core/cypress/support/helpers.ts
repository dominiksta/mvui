import { getContainerEl } from "@cypress/mount-utils";

/**
   This is basically cypress heresy, but mvui chooses to almost completely avoid the `cy.`
   functions in cypress for now. They seem to behave in some awkward ways that might make
   sense for e2e testing, but not really for testing a framework it seems. The major
   annoyances are:

   - Retries only really work when the reference to the object you want to test does not
     change. There does not seem to be an option to pass a callback like here in
     `assertWithTimeout`.
   - There is quite a bit of mental overhead doing things "the cypress way (TM)". Maybe
     one can get used to this, but its definitely annoying.
   - Nested `thens`... What is this, the 90s? ^^ Since when does async/await exist? I mean
     come on.
 */

/** wait for one browser animation frame */
export async function waitFrame() {
  return new Promise(resolve => {
    requestAnimationFrame(resolve)
  })
}

/** sleep for `ms` */
export async function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

/**
   Works basically like `assert(cb())`, except that `cb` is re-run every `interval` ms for
   `timeout` ms, giving it a couple more chances to return true. Useful if you dont really
   care about setting up explicit delays for tests.
 */
export async function assertWithTimeout(
  cb: () => boolean, timeout = 2000, interval = 200
) {
  let alreadyWaited = 0;
  while (!cb() && alreadyWaited < timeout) {
    await waitFrame();
    alreadyWaited += interval;
    await sleep(interval);
  }
  assert(cb(), cb.toString());
}

/**
   Mount a new instance of the HTMLElement class given to the cypress testbed iframe
   thingy.
 */
export function mount<T extends HTMLElement>(klass: { new(): T }): T {
  const container = getContainerEl();
  const comp = new klass();
  container.appendChild(comp);
  return comp;
}

/**
   The fact that this function has to exist is a bit stupid. Without wrapping every single
   test in this function (`it('testname', attempt(() => { <test code here> }))`), when an
   error is thrown, you cannot get a properly source mapped trace in the console in
   firefox. This is because cypress apparently catches all errors and when you click
   "print to console", it will print the trace as a string in a format that only
   chrome/electron understands instead of just printing the error object - for some
   reason.

   This also applies to cypress events like with `cy.on('uncaught:exception', ..)` or
   equivalent global listeners. Maybe there is some fancy mocha thing where you can wrap
   an entier suite but if so its not exactly obvious.
 */
export function attempt(
  this: any,
  cb: Mocha.Func | Mocha.AsyncFunc | undefined
): (done: Mocha.Done) => any {
  return (done) => {
    if (typeof cb === 'undefined') return;
    try {
      const ret = (cb as any)();
      if (ret instanceof Promise) {
        ret.then(() => done());
      } else {
        done();
      }
      return;
    } catch (e) {
      console.log(e);
      throw e;
    }
  }
}
