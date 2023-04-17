import { default as _interval } from "./interval";
import delay from "../delay";
import Stream from "../../stream";
import take from "../take";

/**
   The stream equivalent of a setTimeout.

   @group Stream Creation Operators
 */
export default function timer(due: number | Date) {
  return new Stream<void>(obs => { obs.next() }).pipe(delay(due), take(1));
}
