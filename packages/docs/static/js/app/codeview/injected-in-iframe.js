/**
 * 
 */

import { Component } from '@mvuijs/core';
import { style, MVUI_GLOBALS } from "@mvuijs/core";

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
