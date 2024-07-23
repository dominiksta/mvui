import * as esbuild from 'esbuild'

await esbuild.build({
  entryPoints: ['src/index.ts'],
  bundle: true,
  // minify: true,
  sourcemap: true,
  format: 'esm',
  outfile: 'dist/min/mvui-core.js',
})
