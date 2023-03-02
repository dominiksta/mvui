const babel = require("@babel/core");
const fs = require('fs');
const path = require('path');
const jsdocUtil = require('./jsdoc-util');
const markdownUtil = require('./markdown-util');

const IN_DIR = './src/components/';
const OUT_DIR = './docs/';

fs.mkdirSync(OUT_DIR, { recursive: true });

function descForFile(filename) {
  const plainJs = babel.transformFileSync(filename, {
    presets: ["@babel/preset-typescript"],
    // filename: 'test.ts',
  }).code;

  const docBlocks = jsdocUtil.getCommentBlocks(plainJs);
  const parsed = docBlocks.map(jsdocUtil.parseJsdoc).filter(p => p.kind !== '');

  const klass = parsed.find(el => el.kind === 'class');
  if (klass) delete klass.kind;

  const methods = parsed.filter(el => el.kind === 'method');
  for (let method of methods) {
    delete method.kind;
  }

  if (klass) {
    return {
      ...klass,
      methods
    }
  }
}

function processFile(filename) {
  console.log('processing ' + filename);
  const parsed = descForFile(filename);
  if (parsed) {
    console.log('found component');
    const reference = markdownUtil.markdownReferenceForComponentDescription(parsed);
    const description = parsed.description;
    fs.writeFileSync(
      OUT_DIR + path.basename(filename).split('.ts')[0] + '.reference.md',
      reference
    );

    fs.writeFileSync(
      OUT_DIR + path.basename(filename).split('.ts')[0] + '.description.md',
      description
    );
  } else {
    console.log('no component found');
  }
}

fs.readdirSync(IN_DIR).forEach(file => {
  processFile(IN_DIR + file);
});
