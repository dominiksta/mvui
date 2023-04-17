import { RecursivePartial } from "./types";

/**
   "Patch" (partially update) a given object `obj` with antother object `patch`. Useful
   specifically for immutability, e.g. in the context of a {@link rx.Store}.

   @example
   ```typescript
   const patchee = {
     hi: 4,
     yes: {
       deep: {
         nesting: 'is cool',
         otherProp: 7,
       }
     },
   };

   const patcher = {
     hi: 2,
     yes: { deep: { nesting: 'is funny' }}
   };

   console.log(patchObject(patchee, patcher));
   // logs:
   // {
   //   hi: 2,
   //   yes: {
   //     deep: {
   //       nesting: 'is funny',
   //       otherProp: 7,
   //     }
   //   },
   // }
   ```
 */
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
