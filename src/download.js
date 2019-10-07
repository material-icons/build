"use strict";

const fs = require('fs');
const request = require('request-promise-native');
const cache = require('./cache');
const fsHelper = require('./files');
const config = require('./config');
const colors = require('./colors');

module.exports = options => new Promise((fulfill, reject) => {
    if (typeof options.remote !== 'string') {
        reject('Missing remote link');
        return;
    }

    let link = options.remote,
        ext = link.split('?').shift().split('.').pop(),
        cacheFile = options.local ? options.local : config.cacheDir + '/' + cache.hash(link) + '.' + (ext.match(/^[a-z]+$/) ? ext : 'html'),
        metaFile = cacheFile + '.meta',
        checkCache = true,
        expires = 0;

    // Check for cache meta data
    if (options.expiration) {
        expires = Date.now() + options.expiration;

        if (!fsHelper.exists(metaFile)) {
            checkCache = false;
        } else {
            let metaData = fs.readFileSync(metaFile, 'utf8');

            metaData = JSON.parse(metaData);
            checkCache = metaData.expires && metaData.expires < Date.now();
        }
    }

    // Check cache
    if (checkCache && cacheFile && !config.ignoreCache && (
        (options.keepCache && fsHelper.exists(cacheFile)) ||
        cache.valid(cacheFile)
    )) {
        // keepCache
        let result = cache.get(cacheFile);
        if (typeof result === 'string') {
            fulfill(options.returnMeta ? {
                html: result,
                cached: true
            } : result);
            return;
        }
    }

    // Create params
    let params = {
        uri: options.remote,
        headers: options.headers ? options.headers : {}
    };

    // Send HTTP(S) request
    if (config.debugRequests || options.debug) {
        console.log(colors.info + '[download]' + colors.reset + ':', params.uri);
    }
    request(params).then(html => {
        // Save cache
        if (options.keepCache || options.saveCache) {
            cache.save(cacheFile, html);
        }

        // Save meta data
        if (expires) {
            fs.writeFileSync(metaFile, JSON.stringify({
                expires: expires,
                time: Date.now()
            }, null, 4), 'utf8');
        }

        // Done
        fulfill(options.returnMeta ? {
            html: html,
            cached: false
        } : html);
    }).catch(err => {
        reject(err);
    });
});
