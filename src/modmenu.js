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

const { Menu, nativeImage, ipcRenderer } = require('electron');
const path = require('path');
const Swal = require('sweetalert2');

//====================
// Declare forms here
//====================
const { createAboutWindow }   = require('./win/winabout/index');
// const { createConfigWindow }  = require('./win/winconfig/index');
// const { createFormWindow }    = require('./win/winform/index');
// const { createVideoWindow }   = require('./win/winvideo/index');
// const { createSerialWindow }  = require('./win/winserial/index');
// const { createQrcodeWindow }  = require('./win/winqrcode/index');
// const { createMdbWindow }     = require('./win/winmdb/index');
// const { createApiWindow }     = require('./win/winapi/index');
// const { createReportWindow }  = require('./win/winreport/index');
// const { createLteWindow }     = require('./win/winlte/index');
// const { createPdfWindow }     = require('./win/winpdf/index');
// const { createAuditWindow }   = require('./win/winaudit/index');

const iconSize = { width: 16, height: 16 };

function createMainMenu(app, mainWindow, gvars, gshow ) {

    // Create an empty menu
    const emptyMenu = Menu.buildFromTemplate([]);

    const mainMenu = Menu.buildFromTemplate([
        {
          label: 'File',
          submenu: [
            {
              label: 'Open',
              accelerator: 'CmdOrCtrl+O',
              click: async () => {

                  // Add your "Open" functionality here
                  //mainWindow.webContents.executeJavaScript('alert("File/Open Clicked!!!");');
                //   mainWindow.webContents.executeJavaScript(`
                //   Swal.fire({
                //     title: 'Div Clicked!',
                //     text: 'File/Open Clicked!!!',
                //     icon: 'success',
                //   });
                // `);
                  mainWindow.webContents.executeJavaScript(`
                    ipcRenderer.send('main-open-file-dialog', 'OK')
                  `);

              },
              icon: nativeImage
              .createFromPath(path.join(__dirname, '../../icons/std/mdpi/4_collections_collection.png')).resize({ width: 24, height: 24 })

            },
            {
              label: 'New Data Entry',
              accelerator: 'CmdOrCtrl+N',
              click: async () => {

                createFormWindow( mainWindow, gvars );

              },
              icon: nativeImage
              .createFromPath(path.join(__dirname, '../../icons/std/mdpi/5_content_new.png')).resize({ width: 24, height: 24 })
            },
            {
              label: 'Capture Video',
              accelerator: 'CmdOrCtrl+V',
              click: async () => {

                createVideoWindow( mainWindow, gvars );

              },
              icon: nativeImage
              .createFromPath(path.join(__dirname, '../../icons/std/mdpi/10_device_access_camera.png')).resize({ width: 24, height: 24 })
            },
            {
              label: 'Capture Serial',
              accelerator: 'CmdOrCtrl+S',
              click: async () => {

                createSerialWindow( mainWindow, gvars );

              },
              icon: nativeImage
              .createFromPath(path.join(__dirname, '../../icons/std/mdpi/10_device_access_usb.png')).resize({ width: 24, height: 24 })
            },
            {
              label: 'QR Code Reader',
              accelerator: 'CmdOrCtrl+R',
              click: async () => {

                createQrcodeWindow( mainWindow, gvars );

              },
              icon: nativeImage
              .createFromPath(path.join(__dirname, '../../icons/std/mdpi/4_collections_go_to_today.png')).resize({ width: 24, height: 24 })
            },
            {
              label: 'Mdb Reader',
              accelerator: 'CmdOrCtrl+M',
              click: async () => {

                createMdbWindow( mainWindow, gvars );

              },
              icon: nativeImage
              .createFromPath(path.join(__dirname, '../../icons/std/mdpi/10_device_access_sd_storage.png')).resize({ width: 24, height: 24 })
            },
            {
              label: 'API Call',
              accelerator: 'CmdOrCtrl+A',
              click: async () => {

                createApiWindow( mainWindow, gvars );

              },
              icon: nativeImage
              .createFromPath(path.join(__dirname, '../../icons/std/mdpi/9_av_shuffle.png')).resize({ width: 24, height: 24 })
            },
            {
              label: 'Report',
              accelerator: 'CmdOrCtrl+R',
              click: async () => {

                createReportWindow( mainWindow, gvars );

              },
              icon: nativeImage
              .createFromPath(path.join(__dirname, '../../icons/std/mdpi/5_content_paste.png')).resize({ width: 24, height: 24 })
            },
            {
              label: 'PDF Report',
              accelerator: 'CmdOrCtrl+P',
              click: async () => {

                createPdfWindow( mainWindow, gvars );

              },
              icon: nativeImage
              .createFromPath(path.join(__dirname, '../../icons/std/mdpi/4_collections_view_as_list.png')).resize({ width: 24, height: 24 })
            },
            {
              label: 'AdminLTE',
              accelerator: 'CmdOrCtrl+L',
              click: async () => {

                createLteWindow( mainWindow, gvars );

              },
              icon: nativeImage
              .createFromPath(path.join(__dirname, '../../icons/std/mdpi/5_content_paste.png')).resize({ width: 24, height: 24 })
            },
            {
              label: 'Open Audit',
              //accelerator: 'CmdOrAtl+O',
              click: async () => {

                createAuditWindow( mainWindow, gvars );

              },
              icon: nativeImage
              .createFromPath(path.join(__dirname, '../../icons/std/mdpi/10_device_access_sd_storage.png')).resize({ width: 24, height: 24 })
            },
            {
              label: 'Configure',
              accelerator: 'CmdOrCtrl+C',
              click: async () => {

                createConfigWindow( mainWindow, gvars );

              },
              icon: nativeImage
              .createFromPath(path.join(__dirname, '../../icons/std/mdpi/2_action_settings.png')).resize({ width: 24, height: 24 })
            },
            {
              type: 'separator',
            },
            {
              label: 'Exit',
              accelerator: 'CmdOrCtrl+Q',
              click: () => {

                mainWindow.webContents.executeJavaScript(`
                  Swal.fire({
                    title: 'Are you sure?',
                    text: 'Do you really want to quit?',
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Yes, quit!'
                  }).then((result) => {
                    if (result.isConfirmed) {
                      // If the user clicks "Yes, quit!" in the dialog, quit the app
                      //app.quit();
                      ipcRenderer.send('quit-to-index', 'OK')
                    }
                  });
                `);
              },
              icon: nativeImage
              .createFromPath(path.join(__dirname, '../../icons/std/mdpi/1_navigation_cancel.png')).resize({ width: 24, height: 24 })
            },
          ],
        },
        // {
        //   label: 'Edit',
        //   submenu: [
        //     {
        //       label: 'Cut',
        //       role: 'cut',
        //     },
        //     {
        //       label: 'Copy',
        //       role: 'copy',
        //     },
        //     {
        //       label: 'Paste',
        //       role: 'paste',
        //     },
        //   ],
        // },
        {
          label: 'View',
          submenu: [
            {
              label: 'Reload',
              accelerator: 'CmdOrCtrl+R',
              click: () => {
                mainWindow.reload();
              },
            },
            {
              label: 'Toggle Developer Tools',
              accelerator: 'CmdOrCtrl+Shift+I',
              click: () => {
                mainWindow.webContents.toggleDevTools();
              },
            },
          ],
        },
        {
          label: 'About',
          accelerator: 'CmdOrCtrl+A',
          click: () => {
            createAboutWindow( mainWindow );
          },
          icon: nativeImage
          .createFromPath(path.join(__dirname, '../../icons/std/mdpi/1_navigation_cancel.png')).resize({ width: 24, height: 24 })
        },
      ]);

    if( gshow == "ON" ){
      Menu.setApplicationMenu( mainMenu );
    } else {
      Menu.setApplicationMenu( emptyMenu );
    }
    
}

module.exports = createMainMenu;

