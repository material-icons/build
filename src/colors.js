"use strict";

module.exports = {
    reset: '\x1b[0m',
    error: '\x1b[31m', // red
    info: '\x1b[34m', // blue
    notice: '\x1b[35m', // magenta
    success: '\x1b[32m', // green
    replace: content => content.replace(/\x1b\[[0-9]+m/g, '')
};
