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
 * File Create Date: 01/19/2024 12:11PM
 * Created by: Jammi Dee
 * Modified by: Jammi Dee
 *
*/

const axios = require('axios');
const { ipcMain } = require('electron');
const Swal = require('sweetalert2');

// Function to check for updates
function checkForUpdates(appVersion, updateUrl) {
  axios.get(updateUrl)
    .then(response => {
      const remoteVersion = response.data.trim();

      if (compareVersions(appVersion, remoteVersion) === -1) {
        // Newer version available, notify the renderer process
        sendUpdateNotification();
      }
    })
    .catch(error => {
      console.error('Error checking for updates:', error.message);
    });
}

// Function to compare version numbers (assuming semantic versioning)
function compareVersions(versionA, versionB) {
  const partsA = versionA.split('.').map(Number);
  const partsB = versionB.split('.').map(Number);

  for (let i = 0; i < 3; i++) {
    if (partsA[i] < partsB[i]) return -1;
    if (partsA[i] > partsB[i]) return 1;
  }

  return 0;
}

// Function to send update notification to the renderer process
function sendUpdateNotification() {
  ipcMain.emit('update-available');
}

module.exports = {
  checkForUpdates,
};
