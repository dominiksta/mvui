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

function showLogs() {
  const pre = document.createElement('pre');
  document.body.appendChild(pre);
  const origConsoleLog = console.log;
  console.log = (text, ...args) => {
    if (!(typeof text === 'string' || typeof text === 'number'))
      text = JSON.stringify(text);
    pre.innerHTML = pre.innerHTML + text + '\n';
    origConsoleLog.apply([text, ...args]);
  }
}

async function displayComponent() {
  const code = window.__USER_CODE;
  try {
    document.body.innerHTML = '';
    showLogs();
    const module = await evalEsm(code);

    setDefaultStyles();
    if (module.default) {
      // we have exported a default web component
      document.body.appendChild(new module.default());
    }
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
