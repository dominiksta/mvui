import { RecursivePartial } from "./types";

export function arrayCompare<T>(arr1: Array<T>, arr2: Array<T>): boolean {
  if (arr1.length !== arr2.length) return false;
  for (let i = 0, l = arr1.length; i < l; i++) {
    // Check if we have nested arrays
    if (arr1[i] instanceof Array && arr2[i] instanceof Array) {
      // recurse into the nested arrays
      if (!arrayCompare(arr1[i] as any, arr2[i] as any))
        return false;
    }
    else if (arr1[i] != arr2[i]) {
      return false;
    }
  }
  return true;
}

export function uniq<T>(arr: Array<T>): Array<T> {
  return arr.filter((el, index) => arr.indexOf(el) === index);
}

export function patchObject<T extends object>(obj: T, patch: RecursivePartial<T>): T {
  const newObj = structuredClone(obj) as any;

  function inner<T>(obj: T, patch: RecursivePartial<T>): T {
    // console.log('obj: ', structuredClone(obj));
    if (typeof patch !== 'object' || !patch) {
      // console.log('-> ret: ', obj);
      return patch;
    }
    for (const key in patch) {
      // console.log('key: ', key, ' in: ', structuredClone(obj));
      obj[key] = inner(obj[key], patch[key] as any);
    }
    return obj;
  }

  return inner(newObj, patch);
}
