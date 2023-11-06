import { Component, h, rx, style } from '@mvui/core';
import { theme } from '@mvui/stdlib';
import { Sandbox } from './sandbox.js';
import '/js/ace-builds/src-noconflict/ace.js';


function getEditorHeight(editor){
  let newHeight;
  newHeight = editor.getSession()
    .getScreenLength() *
    (editor.renderer.lineHeight + editor.renderer.scrollBar.getWidth());
  newHeight = newHeight > 70 ? newHeight : 70;
  return `${newHeight}px`;
}

async function evalEsm(text) {
  const dataUri = 'data:text/javascript;charset=utf-8,'
        + encodeURIComponent(text);
  return await import(dataUri);
}

export default class Codeview extends Component {

  static useShadow = true;

  props = {
    // 'both' or 'tabs'
    display: rx.prop({ defaultValue: 'both' }),
    // 'output' or 'code', only makes sense when `display` is 'tabs'
    initialTab: rx.prop({ defaultValue: 'output'}),
    outputHeight: rx.prop({ reflect: true, defaultValue: '80px' }),
  }

  #runCode(text) {
    const js = Babel.transform(
      text, { filename: 'hi.ts', presets: ["typescript"] }
    ).code;
  }

  render() {
    const editorChange = new rx.State('');

    this.onRendered(async () => {
      const slot = await this.query('#slot');

      let text = slot.children[0].assignedNodes()[0].data;
      text = text.split('\n').slice(2, -2).join('\n');

      const el = (await this.query('#editor'));
      el.style.width = '100%';

      const editor = ace.edit(el);

      editor.renderer.attachToShadowRoot();

      editor.on('change', () => editorChange.next(editor.getValue()));

      editor.setValue(text, -1);
      editor.clearSelection();

      editor.setHighlightActiveLine(false);
      editor.renderer.setShowGutter(false);
      editor.setShowPrintMargin(false);

      requestAnimationFrame(() => {
        editor.container.style.height = getEditorHeight(editor);
        editor.resize();
      })

      ace.config.set('basePath', '/js/ace-builds/src-min-noconflict/');
      editor.session.setMode('ace/mode/typescript');

      this.onRemoved(style.currentTheme$.subscribe(async theme => {
        editor.setTheme(
          theme === 'dark' ? 'ace/theme/tomorrow_night_bright' :  'ace/theme/tomorrow'
        );
        (await this.query('#wrapper')).style.backgroundColor =
          theme === 'dark' ? 'black' : 'white';
      }));
    });

    return [
      h.pre({ attrs: { id: 'slot'}, fields: { hidden: true }}, h.slot()),
      h.div({ attrs: { id: 'wrapper' }}, [
        h.div({ attrs: { id: 'editor' }}),
      ]),
      h.div({ attrs: { id: 'sep' }}),
      Sandbox.t({
        props: {
          code: editorChange,
          height: this.props.outputHeight.derive(h => h === '' ? '80px' : h),
        }
      })
    ]
  }

  static styles = style.sheet({
    ':host': {
      display: 'block',
      marginTop: '10px',
      border: `1px solid ${theme.theme.fgContrastMiddle}`,
      borderRadius: '5px',
    },
    '#sep': {
      borderBottom: '1px solid grey',
    },
    '#editor': {
      fontSize: '12pt',
    },
    '#wrapper': {
      padding: '10px',
    },
    '.ace_gutter-active-line': {
      background: 'none !important',
    }
  });
  
}
Codeview.register();
