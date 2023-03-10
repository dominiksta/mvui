/**
 * 
 */

import { Component } from '@mvui/core';
import { style, MVUI_GLOBALS } from "@mvui/core";
import { theme } from "@mvui/stdlib";

style.currentTheme$.subscribe(t => {
  style.setTheme(
    theme.MVUI_STDLIB_THEME_NAME,
    t === 'dark' ? theme.darkTheme : theme.lightTheme
  );
});

function setDefaultStyles() {
  const styleEl = document.createElement('style');
  styleEl.innerHTML = '* { font-family: Ubuntu; }';
  document.body.appendChild(styleEl);
}

async function evalEsm(text) {
  // console.log(text);
  const dataUri = 'data:text/javascript;charset=utf-8,'
        + encodeURIComponent(text);
  return await import(dataUri);
}

async function displayComponent() {
  const code = window.__USER_CODE;
  try {
    const module = await evalEsm(code);

    if (module.default.prototype instanceof Component) {
      module.default.register();
    } else {
      customElements.define('playground-component', module.default);
    }

    document.body.innerHTML = '';
    setDefaultStyles();
    document.body.appendChild(new module.default());
  } catch (e) {
    displayError(e);
  }
}
window.displayComponent = displayComponent;

function displayError(e) {
  document.body.innerHTML = e.name + ': ' + e.message;
  console.error(e);
}
window.displayError = displayError;
