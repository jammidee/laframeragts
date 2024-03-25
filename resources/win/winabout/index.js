/**
 * Copyright (C) 2023 Lalulla, Inc. All rights reserved.
 * Copyright (c) 2024 - Joel M. Damaso - mailto:jammi_dee@yahoo.com Manila/Philippines
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
 * File Create Date: 01/06/2024
 * Created by: Jammi Dee
 * Modified by: Jammi Dee
 *
*/

// Load environment variables from .env file
require('dotenv').config();

const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const path = require('path');

function createAboutWindow( mainWindow, glovars ) {
  const newWindow = new BrowserWindow({
    width: 500,
    height: 430,
    parent: mainWindow, //make modal
    modal: true, //make modal
    resizable: false,
    //icon: path.join(__dirname, '../../favicon.ico'),
    icon: process.cwd() +  '/resources/favicon.ico',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    }
  });

  //newWindow.loadFile(path.join(__dirname, '../../src/win/winabout/content.html'));
  newWindow.loadFile( process.cwd() +  '/resources/win/winabout/content.html' );

  //Create an empty menu
  const menu = Menu.buildFromTemplate([]);
  newWindow.setMenu(menu);

  const pagedata = { title: process.env.PAGE_ABOUT_TITLE || 'About', pvars: glovars };

  newWindow.webContents.on('dom-ready', () => {
    newWindow.webContents.send('data-to-about', pagedata );
  });

  newWindow.webContents.openDevTools();

  //Close the current window
  ipcMain.on('close-to-about', () => {

    const currentWindow = BrowserWindow.getFocusedWindow();
    if (currentWindow) {
      currentWindow.close();
    } else {
      console.log('No focused window found.');
    }

  });

  //Send the version to the window
  newWindow.webContents.on('did-finish-load', () => {

    const appInfo = {
      name: app.getName(),
      version: app.getVersion(),
    };
    newWindow.webContents.send('version-to-about', appInfo);

  });

  newWindow.on('close', (event) => {

    // Perform any cleanup or additional actions before the window is closed
    // You can use `event.preventDefault()` to prevent the window from closing
    console.log('About Window is closing');

    // In this example, we prevent the window from closing
    // You might want to prompt the user or save data before closing
    //event.preventDefault();

  });

}

module.exports = { createAboutWindow };
