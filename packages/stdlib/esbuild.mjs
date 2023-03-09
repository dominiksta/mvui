import * as esbuild from 'esbuild'

await esbuild.build({
    entryPoints: ['src/index.ts'],
    bundle: true,
    // minify: true,
    sourcemap: true,
    format: 'esm',
    external: ['@mvui/core'],
    outfile: 'dist/minified/mvui-stdlib.js',
})
