import { Component, h, rx, define, style } from '@mvui/core';
import 'https://unpkg.com/@babel/standalone/babel.min.js'; // TODO

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function injectImportMap(window_) {
  const scriptEl = window_.document.createElement('script');
  scriptEl.type = "importmap";
  scriptEl.innerHTML = JSON.stringify({
    'imports': {
      '@mvui/core': '/js/mvui/core/mvui-core.js',
      '@mvui/stdlib': '/js/mvui/stdlib/mvui-stdlib.js'
    }
  });
  window_.document.body.appendChild(scriptEl);
}

async function injectScript(window_, code) {
  const scriptEl = window_.document.createElement('script');
  scriptEl.type = "module";
  scriptEl.innerHTML = code;
  window_.document.body.appendChild(scriptEl);
}

async function injectUserCode(window_, code) {
  window_.__USER_CODE = code;
}

async function getToInject() {
  // TODO: force cache
  const resp = await fetch('/js/app/codeview/injected-in-iframe.js');
  return await resp.text();
}

export class Sandbox extends Component {

  props = {
    code: new rx.Prop(''),
    height: new rx.Prop('80px'),
    autoBackground: new rx.Prop(true),
  }

  render() {
    const isLoading = new rx.State(false);

    this.props.code.pipe(
      rx.skip(1), rx.debounceTime(500, true)
    ).subscribe(async (code) => {
      console.debug('sandbox code update', code);
      if (code.trim() === '') return;
      isLoading.next(true);
      const content = await this.query('#content');
      content.innerHTML = '';

      const iframe = document.createElement('iframe');
      iframe.style.height = this.props.height.value;

      content.appendChild(iframe);

      const win = iframe.contentWindow;

      await sleep(100);
      await injectImportMap(win);
      await injectScript(win, await getToInject());
      await sleep(100);

      try {
        code = Babel.transform(
          code, { filename: 'hi.ts', presets: ["typescript"] }
        ).code;
      } catch (e) {
        win.displayError(e);
      }

      win.addEventListener('error', e => {
        e.preventDefault();
        win.displayError(e.error);
      });

      await injectUserCode(win, code);
      await sleep(100);
      win.displayComponent();

      isLoading.next(false);

      this.onRemoved(style.currentTheme$.subscribe(async theme => {
        if (!this.props.autoBackground.value) return;
        win.document.body.style.backgroundColor =
          theme === 'dark' ? 'black' : 'white';
        win.document.body.style.color =
          theme === 'dark' ? 'white' : 'black';
        (await this.query('#status')).style.backgroundColor =
          theme === 'dark' ? 'black' : 'white';
        (await this.query('#status')).style.color =
          theme === 'dark' ? 'white' : 'black';
      }));

    });

    return [
      h.div({attrs: { id: 'content' }, style: { height: this.props.height }}),
      h.div({attrs: { id: 'status' }}, isLoading.derive(v => v ? 'Loading...' : 'Ready')),
    ]
  }

  static styles = style.sheet({
    ':host': {
      display: 'block',
    },
    'iframe': {
      display: 'block',
      width: '100%',
      border: 'none',
    },
    '#status': {
      height: '1.4em',
      paddingLeft: '10px',
    }
  });
  
}

export const [ sandbox ] = define(Sandbox);
