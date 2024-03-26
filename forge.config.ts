import type { ForgeConfig } from '@electron-forge/shared-types';
import { MakerSquirrel } from '@electron-forge/maker-squirrel';
import { MakerZIP } from '@electron-forge/maker-zip';
//import { MakerDeb } from '@electron-forge/maker-deb';
import { MakerRpm } from '@electron-forge/maker-rpm';
import { AutoUnpackNativesPlugin } from '@electron-forge/plugin-auto-unpack-natives';
import { WebpackPlugin } from '@electron-forge/plugin-webpack';
import { FusesPlugin } from '@electron-forge/plugin-fuses';
import { FuseV1Options, FuseVersion } from '@electron/fuses';

import { mainConfig } from './webpack.main.config';
import { rendererConfig } from './webpack.renderer.config';

import path from 'path';

const config: ForgeConfig = {
  packagerConfig: {
    asar: true,
    extraResource: [

      //===========================================
      // This will copy the files to the resources
      // folder.
      //===========================================
      path.resolve(__dirname, './package.json'),
      path.resolve(__dirname, './src/env.sample'),
      path.resolve(__dirname, './src/favicon.ico'),
      path.resolve(__dirname, './resources/win'),
      path.resolve(__dirname, './resources/assets'),
      path.resolve(__dirname, './resources/libs'),
      path.resolve(__dirname, './resources/icons'),
      path.resolve(__dirname, './resources/tools'),
      path.resolve(__dirname, './resources/css'),
      //path.resolve(__dirname, './resources/node_modules'),
    ],
    // beforeAsar: [
    //   async (forgeConfig, tempdir) => {

    //     // Perform operations before packaging the app into .asar
    //     // For example, copy additional files or directories to the app directory
  
    //     const fs = require('fs-extra');
    //     const path = require('path');
  
    //     const sourceFilePath = path.join(__dirname, './src/icons');
    //     const destinationFilePath = path.join('', './icons');
  
    //     // Copy the additional file to the app directory
    //     await fs.copyFile(sourceFilePath, destinationFilePath);
    //   },
    //   // Add more custom hooks if needed...
    // ],
  },
  rebuildConfig: {},
  //makers: [new MakerSquirrel({}), new MakerZIP({}, ['darwin']), new MakerRpm({}), new MakerDeb({})],
  makers: [new MakerSquirrel({}), new MakerZIP({}, ['darwin']), new MakerRpm({})],
  plugins: [
    new AutoUnpackNativesPlugin({}),
    new WebpackPlugin({
      mainConfig,
      renderer: {
        config: rendererConfig,
        entryPoints: [
          {
            html: './src/index.html',
            js: './src/renderer.ts',
            name: 'main_window',
            preload: {
              js: './src/preload.ts',
            },
          },
        ],
      },
    }),
    // Fuses are used to enable/disable various Electron functionality
    // at package time, before code signing the application
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
};

export default config;
