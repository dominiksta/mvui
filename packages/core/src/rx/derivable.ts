import DerivedState from "./derived-state";
import State from "./state";

export type Derivable<T> = DerivedState<T> | State<T>;
