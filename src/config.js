"use strict";

const fs = require('fs');
const path = require('path');
const child_process = require('child_process');

let isOriginal = null;

let config = {
    cacheDir: path.dirname(__dirname) + '/cache',
    ignoreCache: false,

    debugRequests: true,
    dataURL: 'https://fonts.google.com/metadata/icons',

    // Directories
    outputDir: path.dirname(path.dirname(__dirname)) + '/material-icons',
    fixedIconsDir: path.dirname(__dirname) + '/fixed',
    customIconsDir: path.dirname(__dirname) + '/custom',
    removedIconsDir: path.dirname(__dirname) + '/removed',

    // Function to check if current actions are done on "original" or "master" branch
    // Original branch contains only Google icons
    // Master branch contains custom icons
    isOriginalBranch: () => {
        if (isOriginal === null) {
            throw new Error('Branch has not been retrieved yet.');
        }
        return isOriginal;
    },
    setBranch: branch => {
        isOriginal = branch === 'original';
    },
};

try {
    let data = fs.readFileSync('.config.json', 'utf8');
    data = JSON.parse(data);
    config = Object.assign(config, data);
} catch(err) {
}

// Detect current branch
let result = child_process.execSync('git branch', {
    cwd: config.outputDir
});
result = result.toString('utf8').split('\n').filter(item => item.indexOf('*') !== -1);
if (result.length !== 1) {
    throw new Error('Cannot detect branch in output');
}
let branch = result[0].replace('*', '').trim();

switch (branch) {
    case 'original':
    case 'master':
        config.branch = branch;
        break;

    default:
        throw new Error('Unknown branch: "' + branch + '"');
}

module.exports = config;
