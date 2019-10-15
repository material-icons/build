"use strict";

const child_process = require('child_process');
const colors = require('./colors');

const execList = (baseDir, commands, done, reject, logOutput) => {
    let output = [];

    function next() {
        let cmd = commands.shift();
        if (cmd === void 0) {
            done(output);
            return;
        }
        if (cmd === '' || cmd === null) {
            next();
            return;
        }
        console.log(colors.info + '[exec]' + colors.reset + ':', cmd);

        child_process.exec(cmd, {
            cwd: baseDir,
            env: process.env,
            uid: process.getuid()
        }, (error, stdout, stderr) => {
            if (error) {
                reject('Error executing: ' + cmd + ': ' + error);
            } else {
                if (logOutput && stdout.length) {
                    console.log(stdout);
                }
                output.push(stdout);
                next();
            }
        });
    }
    next();
};

module.exports = execList;
