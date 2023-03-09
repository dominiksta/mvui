const babel = require("@babel/core");
const fs = require('fs');
const path = require('path');
const jsdocUtil = require('./jsdoc-util');
const markdownUtil = require('./markdown-util');
const fsUtil = require('./fs-util');

const IN_DIR = './src/components/';
const OUT_DIR = '../docs/stdlib/';

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
  const inFull = path.resolve(IN_DIR);
  const fileFull = path.resolve(filename);
  const pathDiff = fileFull.split(inFull)[1];

  console.log('processing ' + filename);
  const parsed = descForFile(filename);
  if (parsed) {
    console.log('found component');
    const reference = markdownUtil.markdownReferenceForComponentDescription(parsed);
    const description = parsed.description;

    const outDir = OUT_DIR + path.dirname(pathDiff).substring(1) + '/';
    fs.mkdirSync(outDir, { recursive: true });

    fs.writeFileSync(
      outDir + path.basename(filename).split('.ts')[0] + '.reference.md',
      reference
    );

    console.log(path.dirname(filename));
    fs.writeFileSync(
      outDir +  path.basename(filename).split('.ts')[0] + '.description.md',
      description
    );
  } else {
    console.log('no component found');
  }
}

for (let f of fsUtil.getFiles(IN_DIR)) processFile(f);
