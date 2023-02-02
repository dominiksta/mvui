import Component from "component";

export function testDoc<T extends Component | undefined>(
  comp: T
): [Document, T] {
  const doc = new Document();
  if (comp) doc.appendChild(comp);
  return [doc, comp];
}

export async function waitFrame() {
  return new Promise(resolve => {
    requestAnimationFrame(resolve)
  })
}
