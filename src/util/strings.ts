const camelToDashRegexp = /[A-Z]/g;
export const camelToDash = (camel: string) =>
  camel.replace(camelToDashRegexp, m => "-" + m.toLowerCase());
