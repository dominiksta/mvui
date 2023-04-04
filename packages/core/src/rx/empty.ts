import Stream from "./stream";

const EMPTY = new Stream(observer => observer.complete());
export default EMPTY;
