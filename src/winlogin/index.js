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
 * File Create Date: 01/06/2024 05:25PM
 * Created by: Jammi Dee
 * Modified by: Jammi Dee
 *
*/

// Load environment variables from .env file
require('dotenv').config();

const { app, BrowserWindow, Menu, ipcMain, ipcRenderer } = require('electron');
const path    = require('path');
const axios   = require('axios');

function createLoginWindow( mainWindow ) {
  const newWindow = new BrowserWindow({
    width: 400,
    height: 400,
    parent: mainWindow, //make modal
    modal: true, //make modal
    icon: path.join(__dirname, '../favicon.ico'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    frame: false,
  });

  newWindow.loadFile(path.join(__dirname, './content.html'));

  //Create an empty menu
  const menu = Menu.buildFromTemplate([]);
  newWindow.setMenu(menu);

  const pagedata = { title: process.env.PAGE_LOGIN_TITLE || 'Login' };
  const basicUser = process.env.BASIC_USER || '' ;
  const basicPass = process.env.BASIC_PASS || '' ;

  newWindow.webContents.on('dom-ready', () => {
    newWindow.webContents.send('data-to-login', pagedata );
    newWindow.webContents.send('basic-to-login', { user: basicUser, password: basicPass } );
  });

  //Close the current window
  ipcMain.on('close-to-login', () => {

    const currentWindow = BrowserWindow.getFocusedWindow();
    if (currentWindow) {
      currentWindow.close();
    } else {
      console.log('No focused window found.');
    }
  });

  newWindow.on('close', (event) => {

    // Perform any cleanup or additional actions before the window is closed
    // You can use `event.preventDefault()` to prevent the window from closing
    console.log('LoginWindow is closing');

    // In this example, we prevent the window from closing
    // You might want to prompt the user or save data before closing
    //event.preventDefault();

  });

  ipcMain.on('login-modal-closed', () => {
    const currentWindow = BrowserWindow.getFocusedWindow();
    if (currentWindow) {
      currentWindow.close();
    } else {
      console.log('No focused window found.');
    }
  });

  //Custom scripts JMD 01/16/2024
  ipcMain.on('login-request', async (event, { username, password }) => {
    try {

      //Check for connectivity
      const constatus = await checkConnectivity();
      if( constatus === 'ERROR'){
        event.sender.send('login-response', { success: false, error: 'Connectvity error!' });
      }
      // Get base URL from environment variables
      const baseUrl = `${process.env.APP_PROTOCOL}://${process.env.APP_HOST}:${process.env.APP_PORT}`;
  
      // Request for token
      const response = await axios.get(`${baseUrl}/api/v1/security/getaccesstoken`, {
        headers: {
          Authorization: `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`,
          'Content-Type': 'application/json',
        },
      });
  
      // Assuming the server responds with a JWT token in the 'token' field
      const token     = response.data.token;
      const userData  = response.data.userData;
  
      //Update global token
      //event.sender.send('global-update-token', {token: token });

      // Send the token back to content.html
      //console.log(`Token: ${token}`);
      event.sender.send('login-response', { success: true, token, userData });

    } catch (error) {

      console.error('Login failed:', error.message);
      // Handle login failure here (e.g., show an error message)
      event.sender.send('login-response', { success: false, error: error.message });

    }
  });

  async function checkConnectivity() {
    try {
      await axios.get(`${process.env.APP_PROTOCOL}://${process.env.APP_HOST}:${process.env.APP_PORT}/api/v1/security/`);
    } catch (error) {
      //throw new Error('No connectivity');
      return 'ERROR';
    }
  }

}

module.exports = { createLoginWindow };
