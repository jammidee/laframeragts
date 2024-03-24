const { spawn } = require('child_process');
const fs = require('fs-extra');
const path = require('path');

// Read the current version from package.json
const packageJsonPath = path.join(__dirname, 'package.json');
const packageJson = require(packageJsonPath);
let [major, minor, patch] = packageJson.version.split('.').map(Number);

// Logic to increment version parts
if (patch < 1000) {
    patch += 1;
} else if (minor < 100) {
    minor += 1;
    patch = 0;
} else {
    major += 1;
    minor = 0;
    patch = 0;
}

// Update the version in package.json
packageJson.version = `${major}.${minor}.${patch}`;
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

// Increment the version (e.g., by appending a build number)
const buildNumber = new Date().getTime();
const version = `${major}.${minor}.${patch}.${buildNumber}`;

// Run npm start
// exec('npm start', (error, stdout, stderr) => {
//   if (error) {
//     console.error(`Error starting npm start: ${error.message}`);
//     return;
//   }
//   console.log(`npm start output: ${stdout}`);
//   console.error(`npm start errors: ${stderr}`);
// });

// const electronForgePath = path.resolve(__dirname, 'node_modules', '.bin', 'electron-forge');
// // Spawn electron-forge start without waiting for it to complete
// const electronForgeStartProcess = spawn(electronForgePath, ['start'], { detached: true, stdio: 'ignore' });
// electronForgeStartProcess.unref();
