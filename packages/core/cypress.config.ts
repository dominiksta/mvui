import { defineConfig } from "cypress";

export default defineConfig({
  includeShadowDom: true,
  component: {

    devServer: {
      bundler: 'webpack',
    } as any,
    // for some reason the types indicate that you have to specify a framework, but you
    // actually dont have to and if you do, there is also an annoying warning that pops up
    // every time you start cypress and the relevant framework plugin is not installed

    indexHtmlFile: "cypress/support/component-index.html",
  },
  video: false,
});
