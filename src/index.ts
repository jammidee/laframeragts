/**
 * Copyright (C) 2023 Lalulla, Inc. All rights reserved.
 * Copyright (c) 2023 - Joel M. Damaso - mailto:jammi_dee@yahoo.com Manila/Philippines
 * This file is part of Lalulla System.
 * 
 * LaKuboTron Framework is distributed under the terms of the GNU General Public License 
 * as published by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * LaKuboTron System is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A 
 * PARTICULAR PURPOSE.  See the GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with Lalulla System.  If not, see <http://www.gnu.org/licenses/>.
 * 
 * Framework Designed by: Jammi Dee (jammi_dee@yahoo.com)
 *
 * File Create Date: 03/24/2024
 * Created by: Jammi Dee
 * Modified by: Jammi Dee
 *
*/

import { app, BrowserWindow , nativeImage, ipcMain, Menu, ipcRenderer, dialog, Tray } from 'electron';

const path                  = require('path');
const fs                    = require('fs');

import os                     from 'os';
import axios                  from 'axios';

//Custom library
import libt                   from './libs/lalibtools';

// This allows TypeScript to pick up the magic constants that's auto-generated by Forge's Webpack
// plugin that tells the Electron app where to look for the Webpack-bundled app code (depending on
// whether you're running in development or production).
declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

// Keep the last connection status
var lastConnStatus = "ERROR";

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

//==================
// Global variables
//==================
var glovars = {
  token:          "",
  macaddress:     "",
  deviceid:       "",
  driveserial:    "",

  username:       "sadmin",
  entityid:       "LALULLA",
  appid:          "RAG",
  roleid:         "USER",
  locked:         "YES",
  allowlogon:     "NO"

};

//=============================================================
// Added by Jammi Dee 01/19/2024
// Function to copy the example .env file if it doesn't exist
//=============================================================
const initializeEnvFile = () => {
  const envFilePath = path.join(process.cwd(), './.env');
  const exampleEnvFilePath = process.cwd() + '/resources/env.sample';

  //console.log(` CWD ${process.cwd()} env.sample path ${exampleEnvFilePath}`);

  if (!fs.existsSync(envFilePath)) {
    const exampleEnvContent = fs.readFileSync(exampleEnvFilePath, 'utf-8');
    fs.writeFileSync(envFilePath, exampleEnvContent);
  }
};

//==================================
// Added by Jammi Dee 01/19/2024
// Function to get the MAC address
//==================================
const macAddress = libt.getMacAddress();

if (macAddress) {

  glovars.macaddress = macAddress
  console.log('MAC Address:', macAddress);

} else {
  console.log('MAC Address not found.');
};

//========================================
// Updates detection section
// Get the app version from package.json
//========================================
//const packageJsonPath     = path.join(__dirname, '../../resources/package.json');
console.log(`CWD ${process.cwd()}`);
const packageJsonPath     = process.cwd() +  '/resources/package.json';
const packageJsonContent  = fs.readFileSync(packageJsonPath, 'utf-8');
const appVersion          = JSON.parse(packageJsonContent).version;

let mainWindow: BrowserWindow | null;
const createWindow = (): void => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    height: 600,
    width: 800,
    //icon: path.join(__dirname, '../../favicon.ico'),
    icon: process.cwd() +  '/resources/favicon.ico',
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  // and load the index.html of the app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  const pagedata = { title: process.env.PAGE_INDEX_TITLE || 'Lalula Rag TS' };

  // mainWindow.webContents.on('dom-ready', () => {
  //   mainWindow.webContents.executeJavaScript(`document.title = "${pagedata.title}";`);
  // });
  mainWindow.webContents.on('dom-ready', () => {
    mainWindow.webContents.send('data-to-index', pagedata );
  });

  // Create an empty menu
  // const menu = Menu.buildFromTemplate([]);
  // Menu.setApplicationMenu(menu);

  //Create the customized menu here
  const createMainMenu = require('./modmenu');
  createMainMenu(app, mainWindow, glovars, "ON");

  // Maximize the window
  mainWindow.maximize();

  //====================
  // Open the DevTools.
  //====================
  mainWindow.webContents.openDevTools();

  //=========================================
  // Other initialization can be placed here
  //=========================================
  // ...
  // ...initialization that does not require
  // ...fully loaded UI.

  //===========================================
  // Get the OS information using node-os-utils
  const osInformation = {
    platform:       os.platform(),
    arch:           os.arch(),
    release:        os.release(),
    totalMemory:    os.totalmem(),
    freeMemory:     os.freemem(),
    cpuModel:       os.cpus()[0].model,
    cpuCores:       os.cpus().length,
  };

  //console.log('OS Information:', osInformation);
  //============================================

  //=============================================================
  // Demo mode scripts. This will protect the app from executing 
  // when the date had expired.
  // Added by Jammi Dee 02/10/2019
  //=============================================================

    //Expiration date of the demo app
    var xdate = new Date("2030-07-19");
    //The current date
    var cdate = new Date();

    if( cdate > xdate){
      //throw  new Error ('Time-bound access to the app error!');
      console.log('==============================================');
      console.log('Time-bound access to the app has been reached!');
      console.log('The limit is ' + xdate );
      console.log('==============================================');
      
      app.quit();
      
    }

  //=============================================================  

  // Add this part to handle the "Open File" functionality
  ipcMain.on('main-open-file-dialog', function (event) {
    dialog.showOpenDialog(mainWindow, {
      properties: ['openFile'],
      filters: [
        { name: 'Text Files', extensions: ['txt'] },
        { name: 'All Files', extensions: ['*'] },
      ],
    })
    .then(result => {
      if (!result.canceled) {
        event.sender.send('selected-file', result.filePaths[0]);
      } else {
        console.log('No selected file!');
      }
    })
    .catch(err => {
      console.error(err);
    });
  });

  // Handle the login process after local initialization
  ipcMain.on('request-to-login', function (event) {

    //============================
    // Require login for the user
    //============================
    //console.log(`Allow_login ${process.env.ALLOW_LOGIN}`);
    if( (process.env.ALLOW_LOGIN || 'NO') === 'YES'){
      //createLoginWindow( mainWindow );
    }    

  });  

  // Add this part to handle the "Open File" functionality
  ipcMain.on('login-response', function (event, { success, token }) {

    console.log( `The token is ${token}` );

  });


};

//Added by Jammi Dee
function createTray() {
  //const iconPath = path.join(__dirname, '../../resources/favicon.ico'); // Replace with your icon path
  const iconPath = process.cwd() +  '/resources/favicon.ico';
  let tray = new Tray(iconPath);

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show App',
      click: function () {
        mainWindow.show();
        mainWindow.maximize();
      },
      icon: nativeImage
      //.createFromPath(path.join(__dirname, '../../resources/icons/std/mdpi/1_navigation_back.png')).resize({ width: 16, height: 16 })
      .createFromPath(process.cwd() +  '/resources/icons/std/mdpi/1_navigation_back.png').resize({ width: 16, height: 16 })
    },
    {
      label: 'Quit',
      click: function () {
        //app.isQuiting = true;
        app.quit();
      },
      icon: nativeImage
      //.createFromPath(path.join(__dirname, '../../resources/icons/std/mdpi/1_navigation_cancel.png')).resize({ width: 16, height: 16 })
      .createFromPath( process.cwd() +  '/resources/icons/std/mdpi/1_navigation_cancel.png').resize({ width: 16, height: 16 })
    }
  ]);

  tray.setToolTip(app.getName());
  tray.setContextMenu(contextMenu);
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
//app.on('ready', createWindow);
app.whenReady().then(() => {

  // Perform your initialization before reading the .env file
  initializeEnvFile();

  //Check if there is a latest version
  //checkForUpdates(appVersion, updateUrl);

  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });

  createTray();

  // Set up an interval to send IPC messages every second
  const appServerCheck: any           = process.env.APP_SERVER_CHECK || 'YES';
  const appServerCheckInterval: any   = process.env.APP_SERVER_CHECK_INTERVAL || 10000;

  if( appServerCheck === 'YES'){
    setInterval( async () => {

      //Get the server time
      async function getServerDateTime( token : String ) {
        try {
    
          const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          };
          const response = await axios.get(`${process.env.APP_PROTOCOL}://${process.env.APP_HOST}:${process.env.APP_PORT}/api/v1/security/datetime`,{headers});
          return response ;
    
        } catch (error) {
    
          console.log(error);
          //throw new Error('No connectivity');
          return 'ERROR';
    
        }
      }

      const createMainMenu  = require('./modmenu');
      const constatus: any  = await getServerDateTime(glovars.token);

      if( lastConnStatus == "ERROR" && constatus !== "ERROR"){

        // have menu
        createMainMenu(app, mainWindow, glovars, "ON" );

      }
      if( lastConnStatus !== "ERROR" && constatus == "ERROR"){

        // No menu
        createMainMenu(app, mainWindow, glovars, "OFF" );

      }

      if( constatus === "ERROR"){

        mainWindow.webContents.send('main-update-time', 'Cannot connect to the server <span style="color: red;"><b>(OFFLINE)</b></span>');

      } else {

        //console.log(constatus.data.datetime);
        const currentTime = new Date( constatus.data.datetime ).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true });
        mainWindow.webContents.send('main-update-time', `${currentTime} <span style="color: green;"><b>(ONLINE)</b></span>` );

      }
      
      // const currentTime = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true });
      // mainWindow.webContents.send('main-update-time', `${currentTime} <span style="color: green;"><b>(ONLINE)</b></span>` );

      lastConnStatus = constatus;

    }, appServerCheckInterval );

  }; // if( appServerCheck === 'YES')

});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Handle the request to Quit the application
ipcMain.on('quit-to-index', (event, formData) => {
  app.quit();
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
