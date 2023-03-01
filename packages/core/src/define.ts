import * as rx from "./rx";
import Component from "./component";
import TemplateElement, { TemplateElementChildren } from "./template-element";

/**
 * TODO
 */
export default function define<
  ClassT extends { new(): Component },
>(
  cls: ClassT
): [ TemplateElementCreator<InstanceType<ClassT>>, ClassT ] {
  (cls as any).register();

  const templateElementCreator: TemplateElementCreator<InstanceType<ClassT>> = (
    childrenOrParams, children,
  ) => new TemplateElement<InstanceType<ClassT>>(
    () => new (cls as any)(),
    childrenOrParams, children
  ) as ComponentTemplateElement<InstanceType<ClassT>>;

  return [templateElementCreator, cls];
}


/** Helper type to infer the custom events of a Component */
type ComponentTemplateElement<
  CompT extends Component<any>,
> = TemplateElement<
  CompT,
  CompT extends Component<infer I> ? I : never,
  CompT,
  { [key in keyof CompT['props']]:
    CompT['props'][key] extends rx.State<infer I> ? I : never }
>;

type TemplateElementCreator<T extends Component> = (
  childrenOrParams?: TemplateElementChildren |
    ComponentTemplateElement<T>['params'],
  children?: TemplateElementChildren,
) => ComponentTemplateElement<T>
