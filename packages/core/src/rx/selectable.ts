import Selector from "./selector";
import State from "./state";

export type Selectable<T> = Selector<T> | State<T>;
