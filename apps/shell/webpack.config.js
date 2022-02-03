const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin');
const mf = require('@angular-architects/module-federation/webpack');
const path = require('path');
const share = mf.share;

/**
 * We use the NX_TSCONFIG_PATH environment variable when using the @nrwl/angular:webpack-browser
 * builder as it will generate a temporary tsconfig file which contains any required remappings of
 * shared libraries.
 * A remapping will occur when a library is buildable, as webpack needs to know the location of the
 * built files for the buildable library.
 * This NX_TSCONFIG_PATH environment variable is set by the @nrwl/angular:webpack-browser and it contains
 * the location of the generated temporary tsconfig file.
 */
const tsConfigPath =
  process.env.NX_TSCONFIG_PATH ??
  path.join(__dirname, '../../tsconfig.base.json');

const workspaceRootPath = path.join(__dirname, '../../');
const sharedMappings = new mf.SharedMappings();
sharedMappings.register(
  tsConfigPath,
  [
    /* mapped paths to share */
  ],
  workspaceRootPath
);

module.exports = {
  output: {
    uniqueName: 'shell',
    publicPath: 'auto',
  },
  optimization: {
    runtimeChunk: false,
  },
  experiments: {
    outputModule: true,
  },
  resolve: {
    alias: {
      ...sharedMappings.getAliases(),
    },
  },
  plugins: [
    new ModuleFederationPlugin({
      library: {
        type: 'module',
      },
      remotes: {
        "mfe1": "http://localhost:4201/remoteEntry.js",
    },
      shared: {
      // Angular
      "@angular/core": { requiredVersion: '13.2.0' },
      "@angular/common": { requiredVersion: '13.2.0' },
      "@angular/common/http": { requiredVersion: '13.2.0' },
      "@angular/router": { requiredVersion: '13.2.0' },
      "@angular/platform-browser": {requiredVersion: '13.2.0' },
      "@angular/platform-browser/animations": {requiredVersion: '13.2.0' },
      // RxJs
      "rxjs": { requiredVersion: '7.4.0' },
      "rxjs/operators": { requiredVersion: '7.4.0' },
      // Material
      "@angular/cdk": {requiredVersion: '13.2.0' },
      "@angular/material/table": {requiredVersion: '13.2.0' },
      "@angular/material/list": {requiredVersion: '13.2.0' },
      "@angular/material/icon": {requiredVersion: '13.2.0' },
      "@angular/material/badge": {requiredVersion: '13.2.0' },
      "@angular/material/menu": {requiredVersion: '13.2.0' },
      "@angular/material/button": {requiredVersion: '13.2.0' },
      },
    }),
    sharedMappings.getPlugin(),
  ],
};
