import * as rx from "./rx";
import Component, { ComponentTemplateElement } from "./component";
import { TemplateElement, TemplateElementChildren } from "./template-element";

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


type TemplateElementCreator<T extends Component> = (
  childrenOrParams?: TemplateElementChildren |
    ComponentTemplateElement<T>['params'],
  children?: TemplateElementChildren,
) => ComponentTemplateElement<T>
