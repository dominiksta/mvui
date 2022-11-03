
export function arrayCompare<T>(arr1: Array<T>, arr2: Array<T>): boolean {
  for (var i = 0, l = arr1.length; i < l; i++) {
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
