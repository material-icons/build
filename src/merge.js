"use strict";

const config = require('./config');
const exec = require('./exec');

module.exports = () => new Promise((fulfill, reject) => {
    // Commit changes
    exec(config.outputDir, [
        'git merge original -m "Merge branch \'original\'"'
    ], output => {
        fulfill();
    }, err => {
        reject(err);
    }, true);
});
