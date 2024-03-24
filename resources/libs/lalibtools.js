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

const os = require('os');

// Function to get the MAC address
function getMacAddress() {
  const networkInterfaces = os.networkInterfaces();

  // Loop through each network interface
  for (const key in networkInterfaces) {
    const interfaceDetails = networkInterfaces[key];

    // Check if the interface has a MAC address
    if (interfaceDetails && interfaceDetails.length > 0 && interfaceDetails[0].mac) {
      // Return the MAC address of the first interface found
      return interfaceDetails[0].mac.toUpperCase();
    }
  }

  // Return null if no MAC address is found
  return null;
}

module.exports = {
  getMacAddress,
};
