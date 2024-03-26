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

require('dotenv').config();
const path                  = require('path');
const fs                    = require('fs');
const highlight             = require('cli-highlight').highlight;

const machineId             = require('node-machine-id');
const { exec, execSync }    = require('child_process');
const mysql                 = require('mysql2/promise');
const chalk                 = require('chalk');

import os                     from 'os';
import axios                  from 'axios';
import marked                 from 'marked';

import ollama                 from './libs/SimplyOllama';

//Custom library
import libt                   from './libs/lalibtools';
import { checkForUpdates }    from './libs/update-checker';

// This allows TypeScript to pick up the magic constants that's auto-generated by Forge's Webpack
// plugin that tells the Electron app where to look for the Webpack-bundled app code (depending on
// whether you're running in development or production).
declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

//Use for the login window
const { createLoginWindow } = require('./winlogin/index');

// Keep the last connection status
var lastConnStatus = "ERROR";

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

//==================
// Global variables
//==================
var glovars: { // Define the type of glovars object
  token: string;
  macaddress: string;
  deviceid: string;
  driveserial: string;
  clientversion: number;
  latestclientversion: number;
  needupdate: number;
  currversion: string;
  currchanges: string;
  macid: string;
  username: string;
  entityid: string;
  appid: string;
  roleid: string;
  locked: string;
  allowlogon: string;
  models: Array<any>; // Explicitly define models as an array
} = {
  token: "",
  macaddress: "",
  deviceid: "",
  driveserial: "",
  clientversion: 0,
  latestclientversion: 0,
  needupdate: 0,
  currversion: "",
  currchanges: "",
  macid: "",
  username: "sadmin",
  entityid: "LALULLA",
  appid: "RAG",
  roleid: "USER",
  locked: "YES",
  allowlogon: "NO",
  models: [] // Initialize models as an empty array
};

const tools = [
  {
      schema: {
          type: 'function',
          function: {
              name: 'cmd',
              description: 'execute an arbitrary CMD command',
              parameters: {
                  type: 'object',
                  properties: {
                      command: {
                          type: 'string',
                          description: 'CMD command to run'
                      }
                  },
                  required: ['command']
              }
          },
      },
      function: async ({ command }: { command: string } ) => {
          return new Promise((resolve, reject) => {
              console.log(`Running ${command}`);
              exec(command, { silent: true }, (code:any, stdout:any, stderr:any ) => {
      
                  if (code === 0) {
                      console.log(highlight(stdout, { language: 'bash', ignoreIllegals: true }))
                      resolve(stdout);
                  } else {
                      console.log(stderr);
                      resolve(`${stdout}\n${stderr}`)
                  }
              });
          });
      }
  },
  {
      schema: {
          type: 'function',
          function: {
              name: 'sql',
              description: 'execute an arbitrary sql command',
              parameters: {
                  type: 'object',
                  properties: {
                      sqlscript: {
                          type: 'string',
                          description: 'SQL command to run'
                      }
                  },
                  required: ['sqlscript']
              }
          },
      },
      function: async ( {sqlscript}: { sqlscript:string } ) => {
          return new Promise(async (resolve, reject) => {
              console.log(`Running ${sqlscript}`);

              //-----------------
              const connection = await mysql.createConnection({
                  host: process.env.DB_HOST,
                  database: process.env.DB_NAME,
                  user: process.env.DB_USER,
                  password: process.env.DB_PASSWORD,
                });

                try {
                  console.log(`Running SQL query: ${sqlscript}`);
                  const [rows, fields] = await connection.execute(sqlscript);
                  //const result = JSON.stringify(rows);
                  const result = '\n\n' + generateTextTable(rows);
                  //console.log(result);
                  resolve(result);
                } catch (error) {
                  console.error(`Error executing SQL query: ${error.message}`);
                  resolve(`${error.message}\n${error.stack || ''}`);
                } finally {
                  await connection.end();
                }

              //-----------------
          });
      }
  }
];

//Added by Jammi Dee 12/15/2023
function generateTextTable( data: any[] ) {
  const columns = Object.keys(data[0]);
  const columnWidths:any = {};

  // Find the maximum width for each column
  columns.forEach(column => {
    columnWidths[column] = Math.max(column.length, ...data.map(row => String(row[column]).length));
  });

  // Generate the table header
  let table = chalk.blue(`+${columns.map(column => '-'.repeat(columnWidths[column] + 2)).join('+')}+\n`);
  table += chalk.blue(`|${columns.map(column => ` ${column.padEnd(columnWidths[column])} `).join('|')}|\n`);
  table += chalk.blue(`+${columns.map(column => '-'.repeat(columnWidths[column] + 2)).join('+')}+\n`);

  // Generate the table rows
  data.forEach(row => {
    table += chalk.blue(`|${columns.map(column => ` ${String(row[column]).padEnd(columnWidths[column])} `).join('|')}|\n`);
  });

  table += chalk.blue(`+${columns.map(column => '-'.repeat(columnWidths[column] + 2)).join('+')}+\n`);

  return table;
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
        { name: 'Text Files', extensions: ['txt', 'bat', 'scr', 'java', 'js', 'csv', 'py'] },
        { name: 'Document Files', extensions: ['pdf', 'doc', 'docx'] },
        { name: 'Image Files', extensions: ['jpg', 'jpeg', 'png', 'gif'] },
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

// Ask for confirmation before quitting
app.on('before-quit', (event) => {
  //event.preventDefault(); // Prevent the app from quitting immediately
});

// Handle the request to Quit the application
ipcMain.on('quit-to-index', (event, formData) => {
  app.quit();
});

//===================================================
// Global Initialization goes here when DOM is ready
// This means we have a nice UI already to be used.
//===================================================
ipcMain.on('gather-env-info', async function (event) {

  //==========================================
  // Get the latest client version 02/07/2024
  //==========================================
  var needUpdate      = 0;
  var currVersion     = "";
  var currChanges     = "";
  var appUpdatePath   = "";
  try {

    const locVersion  = app.getVersion();
    const locComp     = locVersion.split('.');
    // Calculate the version value
    const locValue =  parseInt(locComp[0]) * 10000 + 
                      parseInt(locComp[1]) * 1000 + 
                      parseInt(locComp[2]);

    glovars.clientversion = locValue;

    const baseUrl   = `${process.env.APP_PROTOCOL}://${process.env.APP_HOST}:${process.env.APP_PORT}`;
    appUpdatePath   = `${baseUrl}/resources/notice/clientlatest.zip`
    const response  = await axios.get(`${baseUrl}/resources/notice/clientversion.json`);
    const verData   = response.data;
    
    console.log('Version File:', JSON.stringify(verData) );

    // Extract the current version
    currVersion = verData.currentversion;
    currChanges = verData.updates;
    
    // Split the version into its components
    const verComp = currVersion.split('.');
    
    // Calculate the version value
    const verValue =  parseInt(verComp[0]) * 10000 + 
                      parseInt(verComp[1]) * 1000 + 
                      parseInt(verComp[2]);
                         
    console.log('Version value:', verValue);
    glovars.latestclientversion  = verValue;
  
    console.log(`Versions: latest ${verValue} local ${locValue}`);
    if( verValue > locValue){
      needUpdate = 1;
    }
    glovars.needupdate            = needUpdate;
    glovars.currversion           = currVersion;
    glovars.currchanges           = currChanges;

  } catch (error) {

    glovars.latestclientversion  = 0;
    console.error('Error fetching version:', error);
      
  }  

    // Execute the VBScript JMD 01/19/2024

  // (1) Execute the VBScript JMD 01/11/2024
  //const wintoolPath = path.join(__dirname, '../resources/tools/winscripts');
  const wintoolPath = process.cwd() +  '/resources/tools/winscripts';
  //const wincwd = path.join(process.cwd(), '/resources/tools/winscripts');
  const wincwd = process.cwd() + '/resources/tools/winscripts';

  // exec(`cscript.exe //nologo ${wintoolPath}/getDeviceID.vbs`, (error, stdout, stderr) => {
  //   if (error) {
  //     console.error(`Error executing VBScript: ${error.message}`);
  //     return;
  //   }

  //   const deviceID = stdout.trim();
  //   glovars.deviceid = deviceID;

  //   console.log('Device ID:', deviceID);

  //   // Pass the device ID to the renderer process if needed
  //   mainWindow.webContents.send('machine-id', deviceID);

  // });

  // Function to copy file (synchronously)
  function copyFileSync(source:string, destination:string) {
    try {
        // Read the source file
        const data = fs.readFileSync(source);
        // Write to the destination file
        fs.writeFileSync(destination, data);
        console.log(`File ${source} copied to ${destination} successfully.`);
    } catch (err) {
        // Handle error
        console.error('Error copying file:', err);
    };

  };

  // Function to create directory if it doesn't exist
  function createDirectoryIfNotExists(directory:string) {
    if (!fs.existsSync(directory)) {
        try {
            fs.mkdirSync(directory, { recursive: true });
            console.log(`Directory ${directory} created.`);
        } catch (err) {
            console.error('Error creating directory:', err);
        }
    }
  }

  //createDirectoryIfNotExists(wincwd);

  // Copy the file
  let sourceFile      = path.join(wintoolPath, 'getDeviceID.vbs');
  let destinationFile = path.join(wincwd, 'getDeviceID.vbs');

  //copyFileSync(sourceFile, destinationFile);

  let deviceID          = "";
  try {
    const stdout        = execSync(`cscript.exe //nologo ${wincwd}/getDeviceID.vbs`);
    deviceID            = stdout.toString().trim();
    glovars.deviceid    = deviceID;
    console.log('Device ID:', deviceID);
  } catch (error) {
      deviceID = "ERROR";
      console.error(`Error executing VBScript: ${error.message}`);
  }

  // (2) Execute the VBScript:Get drive C:\ Serial number JMD 01/11/2024
  // exec(`cscript.exe //nologo ${wintoolPath}/getDriveSerial.vbs`, (error, stdout, stderr) => {
  //   if (error) {
  //     console.error(`Error executing VBScript: ${error.message}`);
  //     return;
  //   }

  //   const driveCSerial = stdout.trim();
  //   glovars.driveserial = driveCSerial;
  //   console.log('Drive C: serial number', driveCSerial);

  // });

  // Copy the file
  sourceFile      = path.join(wintoolPath, 'getDriveSerial.vbs');
  destinationFile = path.join(wincwd, 'getDriveSerial.vbs');

  //copyFileSync(sourceFile, destinationFile);

  let driveCSerial        = "";
  try {
    const stdout          = execSync(`cscript.exe //nologo ${wincwd}/getDriveSerial.vbs`);
    driveCSerial          = stdout.toString().trim();
    glovars.driveserial   = driveCSerial;
    console.log('Drive C: serial number', driveCSerial);
  } catch (error) {
      driveCSerial = "ERROR";
      console.error(`Error executing VBScript: ${error.message}`);
  }

  // wintoolPath = path.join(__dirname, './tools/winscripts');
  // exec(`cscript.exe //nologo ${wintoolPath}/getMacAddress.vbs`, (error, stdout, stderr) => {
  //   if (error) {
  //     console.error(`Error executing VBScript: ${error.message}`);
  //     return;
  //   }

  //   const macAddress = stdout.trim();
  //   console.log('Mac Address:', macAddress);

  // });

  // Copy the file
  sourceFile      = path.join(wintoolPath, 'getMacAddress.vbs');
  destinationFile = path.join(wincwd, 'getMacAddress.vbs');

  //copyFileSync(sourceFile, destinationFile);

  let macAddress          = "";
  try {
    const stdout          = execSync(`cscript.exe //nologo ${wintoolPath}/getMacAddress.vbs`);
    macAddress            = stdout.toString().trim();
    glovars.macaddress    = macAddress;
    console.log('Mac Address:', macAddress);
  } catch (error) {
      macAddress = "ERROR";
      console.error(`Error executing VBScript: ${error.message}`);
  }

  // Get the server presense JMD 02/13/2024
  async function checkConnectivity() {
    try {

      await axios.get(`${process.env.APP_PROTOCOL}://${process.env.APP_HOST}:${process.env.APP_PORT}/api/v1/security/`);
      return 'OK';

    } catch (error) {

      //throw new Error('No connectivity');
      return 'ERROR';

    }
  }

  // Detect if the Server is running or not.
  let isServerUp = 'YES';
  const enforce_server_up_detection = process.env.ENFORCE_SERVER_UP_DETECTION || "YES";
  if( enforce_server_up_detection == "YES"){

    const constatus = await checkConnectivity();
    if( constatus === 'ERROR'){
      isServerUp = 'NO';
    }

  }

  let macid = "";
  // Get the unique machine ID  JMD 01/11/2024
  machineId.machineId().then( (id:string) => {
    macid = id;
    glovars.macid = macid;
    console.log('Machine ID:', id);
  
    //Send the gathered info
    mainWindow.webContents.send('receive-env-info', { deviceID, driveCSerial, macAddress, macid, needUpdate, currVersion, currChanges, appUpdatePath, isServerUp });
  }).catch( (error:any) => {
    console.error('Error getting machine ID:', error);
  });

}); 

//Added by Jammi Dee 03/26/2024
ipcMain.on('get-ai-tags', async function (event) {

  let chatConfig = { 
    "model": "llama2",
    "messages": "Hello earthlings", 
    "temperature": 0.7, 
    "max_tokens": -1,
    "stream": true
  };
  //Actually chatConfig is not used
  try {
    const response = await ollama.tags(chatConfig);
    
    // Check if response has models
    if (response && response.models && Array.isArray(response.models)) {
      // Loop through each model
      response.models.forEach((model:any) => {

          glovars.models.push( model );
          // Access properties of each model
          console.log('Name:', model.name);
          console.log('Model:', model.model);
          console.log('Modified At:', model.modified_at);
          console.log('Size:', model.size);
          console.log('Digest:', model.digest);
          console.log('Details:', model.details);
          console.log('--------------------------');
      });

      response.models
      mainWindow.webContents.send('resp-get-ai-tags', response.models );

    } else {
        console.error('No models found in the response.');
    };

  } catch (error) {
      console.error('Error occurred while fetching tags:', error);
  };

}); //ipcMain.on('get-ai-tags', async function (event)

//=======================
// Global Token Updates
//=======================

ipcMain.on('global-update-token', function (event, { token, userData }) {

  const jwt = require('jsonwebtoken');

  function decodeJwtAndGetUserData( token:any ) {
    try {
      // Decode the JWT without verifying the signature
      const decoded = jwt.decode(token, { complete: true });
  
      // Extract the payload from the decoded JWT
      const payload = decoded.payload;
  
      // Check if the payload contains the 'username' field
      if (payload && payload.username) {
        // Return the user data as a JSON object
        return payload.username;
      } else {
        // If 'username' field is not present, return null or handle as needed
        return null;
      }
    } catch (error) {
      // Handle decoding errors, such as invalid tokens
      console.error('Error decoding JWT:', error);
      return null;
    }
  }

  const jwtData = decodeJwtAndGetUserData(userData);
  
  glovars.token = token;
  glovars.username    = jwtData.username;
  glovars.entityid    = jwtData.entityid;
  glovars.roleid      = jwtData.roleid;
  glovars.locked      = jwtData.locked;
  glovars.allowlogon  = jwtData.allowlogon;

  //console.log(`The token is: ${token}`);
  //console.log(`The user data is: ${JSON.stringify(decodeJwtAndGetUserData(userData))}`);

});

//==============
// AI Section
//==============

ipcMain.on('req-ai-answer', async (event, params) => {

  let modelResponse = "";

  const { message, expertise, dstyle, dmodel } = params;

  console.log(`The model is ${dmodel}`);
  let persona: any = [];
  let model = 'llama2';

  //Define Model
  if( dmodel === 'auto'){
    model = process.env.AI_MASTER_MODEL;
  } else {
    model = dmodel;
  };

  //Define Expertise
  if (expertise === 'LINGUIST') {
    persona.push({ "role": "system", "content": "You are a linguist expert." });
  }
  
  if (expertise === 'LAWYER') {
    persona.push({ "role": "system", "content": "You are a legendary lawyer and expert in law." });
  }
  
  if (expertise === 'ENGINEER') {
    persona.push({ "role": "system", "content": "You are a celebrated engineer in the field construction, machines and propulsion." });
  }
  
  if (expertise === 'DOCTOR') {
    persona.push({ "role": "system", "content": "You are an expert in the field of medicine." });
  }
  
  if (expertise === 'SCIENTIST') {
    persona.push({ "role": "system", "content": "You are an expert in the field of quantum mechanics." });
  }
  if (expertise === 'AUTO') {
    persona.push({ "role": "system", "content": "Detect the context of the speaker. If he is talking about common sense, be a life coach." });
    persona.push({ "role": "system", "content": "If he is talking about science, be an expert scientist." });
    persona.push({ "role": "system", "content": "If he is talking about engineering, be an expert in that field of engineering." });
    persona.push({ "role": "system", "content": "If he is talking about politics, be an expert lawyer." });
    persona.push({ "role": "system", "content": "If he is talking about health of medicine, be an expert doctor specialising on that field." });
    persona.push({ "role": "system", "content": "If you don't know what his talking about, be a comedian. Be Funny and polite." });
  }

  //Sophia
  persona.push({ "role": "system", "content": "If you are ask about yourself as Sophia. Tell them that you are a multiple personality chatbot. Explain how you automatically change model to meet the user inquiry." });
  persona.push({ "role": "system", "content": "If you are ask about yourself as Sophia. Tell them what is multiple personality if its in human." });
  
  //Define Response style
  if (dstyle === 'POET') {
    persona.push({ "role": "system", "content": "You are a great writer and speaker." });
    persona.push({ "role": "system", "content": "What you say always rhymes." });
    persona.push({ "role": "system", "content": "You reply in a light but deep with sarcasm in it." });
  }
  
  if (dstyle === 'COMEDIAN') {
    persona.push({ "role": "system", "content": "You are the most celebrated comedian." });
    persona.push({ "role": "system", "content": "Everytime you reply there is always a hint of funny joke in it." });
    persona.push({ "role": "system", "content": "You reply in a happy and friendly manner." });
  }
  
  if (dstyle === 'PROFESSIONAL') {
    persona.push({ "role": "system", "content": "You are professional speaker." });
    persona.push({ "role": "system", "content": "You always reply in a corporate tone, polite and with integrity." });
  }

  if (dstyle === 'AUTO') {
    persona.push({ "role": "system", "content": "Detect the tone of the speaker if its serious, comedic, poetic, angry or sad" });
    persona.push({ "role": "system", "content": "If the speaker is serious, be professional, straight forward and polite." });
    persona.push({ "role": "system", "content": "If the speaker is comedic, insert a joke, be funny. Use friedly words." });
    persona.push({ "role": "system", "content": "If the speaker is poetic, reply in rhymes. Use happy and friendly words." });
    persona.push({ "role": "system", "content": "If the speaker is sad or lonely, reply in symphathy. Use uplifting words." });
    persona.push({ "role": "system", "content": "Always treat greetings as happy and excited. Use happy and exciting words." });
  }
  
  persona.push({ "role": "user", "content": message });

  let chatConfig = { 
    "model": model,
    "messages": persona, 
    "temperature": 0.7, 
    "max_tokens": -1,
    "stream": true
  };

  function unescapeHTML(html:string) {
    return html.replace(/&lt;/g, '<').replace(/&gt;/g, '>');
  };

  // function parseCodeBlocks(input: string) {
  //   // Check if the input string contains <code> tags
  //   if (!/<code>.*?<\/code>/.test(input)) {
  //       // If no <code> tags are found, return the input string as is
  //       return input;
  //   };

  //   // Define the regular expression pattern to match text enclosed by <code> tags
  //   const pattern = /<code>(.*?)<\/code>/g;

  //   // Replace matches with <blockquote> tags
  //   const result = input.replace(pattern, (match, codeContent) => {
  //       // Unescape HTML tags inside the code content
  //       const unescapedCodeContent = unescapeHTML(codeContent);
  //       // Return the modified content wrapped in <blockquote> tags
  //       return `<blockquote class="black-box">${unescapedCodeContent}</blockquote>`;
  //   });

  //   return result;

  // };

  const hljs = require('highlight.js');
  function highlightCode(code:string, language = 'auto') {
    // Highlight the code using highlight.js
    const highlightedCode = hljs.highlightAuto(code, [language]).value;
    return highlightedCode;
  }

  const prettier = require('prettier');
  function formatCode(unformattedCode: string): string {
    return prettier.format(unformattedCode, {
      semi: false,
      singleQuote: true,
      tabWidth: 2,
      // Omitting the 'parser' option to enable automatic detection
    });
  }

  function parseCodeBlocks(input: string): string {

    // Check if the input string contains <code> tags
    if (!/<code>.*?<\/code>/.test(input)) {
        // If no <code> tags are found, return the input string as is
        return input;
    };

    // Define the regular expression pattern to match text enclosed by <code> tags
    const pattern = /<code>(.*?)<\/code>/g;

    // Replace matches with <pre> tags containing styled code
    const result = input.replace(pattern, (_, code) => `<pre class="code-block">${unescapeHTML(code)}</pre>`);

    return result;
  };

  async function invokeLLM(props: any) {

    //console.log(`-----`)
    console.log(`${JSON.stringify(props)}`)
    //console.log(`-----`)

    try {

      console.log(`Running prompt...`)

      const response = await ollama.chat(props);
      
      //console.log(`${response}\n`);
      let htmlResp = response.replace(/\n/g, '<br>');
          htmlResp = await marked.parse(htmlResp);
          htmlResp = parseCodeBlocks(htmlResp);

      console.log(`${htmlResp}\n`);

      //event.returnValue = { htmlResp };
      const dataResp = { htmlResp, props }; 
      mainWindow.webContents.send( 'resp-ai-answer', dataResp  );

    }catch(error) {
      
      let htmlResp: string = "";
      htmlResp += `It seems that I got a brain freeze! This is the issue that I encounter: <br> <br> 
                  ${error}`;

      const dataResp = { htmlResp, props }; 
      mainWindow.webContents.send( 'resp-ai-answer', dataResp  );

      console.log(`Query failed!`)
      console.log(error)

    };

  };

  invokeLLM(chatConfig);

});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
