const camelToDashRegexp = /[A-Z]/g;
export const camelToDash = (camel: string) => {
  let repl = camel.replace(camelToDashRegexp, m => "-" + m.toLowerCase());
  if (repl[0] === '-') repl = repl.substring(1);
  return repl;
}
