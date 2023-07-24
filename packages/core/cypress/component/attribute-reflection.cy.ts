import { Component, rx, MVUI_GLOBALS } from '$thispkg';
import { attempt, mount, waitFrame } from '../support/helpers';

describe('attribute reflection', () => {
  it('basic attribute reflection', attempt(async () => {
    MVUI_GLOBALS.APP_DEBUG = false;
    
    @Component.register
    class AttrReflectionTest extends Component {
      static useShadow = false;
      
      props = {
        attrBool: new rx.Prop(false, { reflect: true, converter: Boolean }),
        attrString: new rx.Prop('hi', { reflect: true }),
        attrNum: new rx.Prop(5, { reflect: true, converter: Number }),
      }
      render = () => [];
    };
    
    const comp = mount(AttrReflectionTest);
    // const [_doc, comp] = testDoc(new AttrReflectionTest());
    
    comp.props.attrBool.subscribe(
      v => {
        // console.log('value changed: ', v);
        expect(comp.getAttribute('attr-bool')).to.be.eq(`${v}`);
      }
    )
    
    // we have to wait for a frame here to let the mutationobserver trigger
    await waitFrame();
    
    expect(comp.getAttribute('attr-bool')).to.be.eq('false');
    expect(comp.getAttribute('attr-string')).to.be.eq('hi');
    expect(comp.getAttribute('attr-num')).to.be.eq('5');
    
    expect(comp.props.attrBool.value).to.be.false;
    expect(comp.props.attrString.value).to.be.eq('hi');
    expect(comp.props.attrNum.value).to.be.eq(5);
    
    comp.setAttribute('attr-bool', 'true')
    await waitFrame();
    
    expect(comp.props.attrBool.value).to.be.true;
    expect(comp.getAttribute('attr-bool')).to.be.eq('true');
    
    comp.setAttribute('attr-bool', 'false')
    await waitFrame();
    
    expect(comp.props.attrBool.value).to.be.false;
    expect(comp.getAttribute('attr-bool')).to.be.eq('false');
    
    comp.props.attrBool.next(true);
    
    expect(comp.props.attrBool.value).to.be.true;
    expect(comp.getAttribute('attr-bool')).to.be.eq('true');
    
  }));
})

