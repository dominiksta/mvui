import { TemplateElement } from "./template-element";
import { Stream } from "./rx";

export class Fragment<T> {
  #id: string;
  get id() { return this.#id; }

  static readonly MARKER = '__mvui_fragment';

  constructor(
    public stream: Stream<T>,
    public template: (value: T) => TemplateElement<any>[]
  ) {
    this.#id = crypto.randomUUID();
  }
}
