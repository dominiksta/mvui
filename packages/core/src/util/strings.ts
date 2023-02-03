const camelToDashRegexp = /[A-Z]/g;
export const camelToDash = (camel: string) => {
  return camel.replace(camelToDashRegexp, m => "-" + m.toLowerCase());
}
