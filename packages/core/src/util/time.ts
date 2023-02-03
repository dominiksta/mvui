export function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

/**
 * Return a new function that will behave exactly like `fun`, except it will
 * ignore calls happening more often then `wait` ms apart
 */
export function throttle<T extends Function>(
  fun: T,
  wait: number = 50
): T {
  let lastRun = -wait;

  const callable = (...args: any[]) => {
    const now = Date.now();
    if (now - lastRun > wait) {
      // console.log("call");
      fun(...args);
      lastRun = now;
    }
  };

  const tmp: any = callable;
  return tmp as T;
}
