import * as esbuild from 'esbuild'

await esbuild.build({
  entryPoints: ['src/index.min.ts'],
  external: ['@mvuijs/core'],
  bundle: true,
  minify: true,
  sourcemap: true,
  format: 'esm',
  outfile: 'dist/min/mvui-ui5.js',
})
