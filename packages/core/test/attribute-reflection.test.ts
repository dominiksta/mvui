import { test, expect } from '@jest/globals';
import Component from 'component';
import { define, MVUI_GLOBALS, rx } from 'index';
import { testDoc, waitFrame } from './util';

test('basic attribute reflection', async () => {
  MVUI_GLOBALS.APP_DEBUG = false;

  const [_, AttrReflectionTest] = define(class AttrReflectionTest extends Component {
    static useShadow = false;

    props = {
      attrBool: new rx.Prop(false, { reflect: true, converter: Boolean }),
      attrString: new rx.Prop('hi', { reflect: true }),
      attrNum: new rx.Prop(5, { reflect: true, converter: Number }),
    }
    render = () => [];
  });

  const [_doc, comp] = testDoc(new AttrReflectionTest());

  comp.props.attrBool.subscribe(
    v => {
      // console.log('value changed: ', v);
      expect(comp.getAttribute('attr-bool')).toBe(`${v}`);
    }
  )

  // we have to wait for a frame here to let the mutationobserver trigger
  await waitFrame();

  expect(comp.getAttribute('attr-bool')).toBe('false');
  expect(comp.getAttribute('attr-string')).toBe('hi');
  expect(comp.getAttribute('attr-num')).toBe('5');
  
  expect(comp.props.attrBool.value).toBe(false);
  expect(comp.props.attrString.value).toBe('hi');
  expect(comp.props.attrNum.value).toBe(5);

  comp.setAttribute('attr-bool', 'true')
  await waitFrame();

  expect(comp.props.attrBool.value).toBe(true);
  expect(comp.getAttribute('attr-bool')).toBe('true');

  comp.setAttribute('attr-bool', 'false')
  await waitFrame();

  expect(comp.props.attrBool.value).toBe(false);
  expect(comp.getAttribute('attr-bool')).toBe('false');

  comp.props.attrBool.next(true);

  expect(comp.props.attrBool.value).toBe(true);
  expect(comp.getAttribute('attr-bool')).toBe('true');

});
