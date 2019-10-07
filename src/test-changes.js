"use strict";

const child_process = require('child_process');
const config = require('./config');

module.exports = () => new Promise((fulfill, reject) => {
    // Detect current branch
    child_process.exec('git status', {
        cwd: config.outputDir
    }, (error, stdout, stderr) => {
        if (error) {
            reject(error);
            return;
        }

        console.log(stdout);
        fulfill(stdout.indexOf('nothing to commit, working tree clean') === -1);
    });

});