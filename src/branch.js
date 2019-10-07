"use strict";

const child_process = require('child_process');
const config = require('./config');

module.exports = branch => new Promise((fulfill, reject) => {
    // Detect current branch
    child_process.exec('git branch', {
        cwd: config.outputDir
    }, (error, stdout, stderr) => {
        if (error) {
            reject(error);
            return;
        }

        let result = stdout.toString('utf8').split('\n').filter(item => item.indexOf('*') !== -1);
        if (result.length !== 1) {
            reject('Cannot detect branch in output');
            return;
        }
        let currentBranch = result[0].replace('*', '').trim();

        if (typeof branch !== 'string' || currentBranch === branch) {
            config.setBranch(currentBranch);
            fulfill(config.isOriginalBranch());
            return;
        }

        // Change branch
        child_process.exec('git checkout ' + branch, {
            cwd: config.outputDir
        }, (error, stdout, stderr) => {
            if (error) {
                reject(error);
                return;
            }

            // Change branch
            config.setBranch(branch);
            fulfill(config.isOriginalBranch());
        });
    });

});