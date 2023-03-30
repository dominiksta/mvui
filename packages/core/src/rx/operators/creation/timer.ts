import { default as _interval } from "./interval";
import delay from "../delay";
import Stream from "../../stream";
import take from "../take";

/** The stream equivalent of a setTimeout. */
export default function timer(due: number | Date) {
  return new Stream(obs => { obs.next(null) }).pipe(delay(due), take(1));
}
