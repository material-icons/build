"use strict";

const fs = require('fs');
const config = require('./config');
const files = require('./files');
const colors = require('./colors');
const setBranch = require('./branch');
const getData = require('./get-data');
const getIcons = require('./get-icons');
const parseIcons = require('./parse-icons');
const saveIcons = require('./save-icons');
const testChanges = require('./test-changes');

module.exports = branch => new Promise((fulfill, reject) => {

    let icons;

    console.log('Parsing branch:', branch);

    // Change branch
    setBranch(branch).then(result => {

        return getData();

    }).then(result => {

        console.log('Got meta data (' + result.icons.length + ' icons)');
        console.log('Categories: ' + config.categories.map(item => item.length < 3 ? item.toUpperCase() : item.slice(0, 1).toUpperCase() + item.slice(1)).join(', '));

        // Clean up output directory
        files.cleanup(config.outputDir + '/svg');

        // Get all icons
        icons = getIcons(result);

        // Parse all icons
        return parseIcons(icons);

    }).then(() => {

        // Save data.json
        let savedData = {
            root: 'https://material-icons.github.io/material-icons/svg/',
            asset_url_pattern: '{family}/{icon}.svg',
            icons: []
        };

        Object.keys(icons).sort((a, b) => a.localeCompare(b)).forEach(name => {
            let icon = icons[name],
                item = {
                    name: name,
                    version: icon.version,
                    unsupported_families: icon.clones,
                    categories: icon.categories,
                    tags: icon.tags
                };

            // Clean up attributes
            if (!item.version) {
                delete item.version;
            }

            ['categories', 'tags', 'unsupported_families'].forEach(attr => {
                if (!item[attr] || !item[attr].length) {
                    delete item[attr];
                }
            });

            savedData.icons.push(item);
        });

        // Save icons
        fs.writeFileSync(config.outputDir + '/data.json', JSON.stringify(savedData, null, 4));
        saveIcons(icons);

        // Check for changes
        return testChanges();

    }).then(changed => {

        fulfill(changed);

    }).catch(err => {

        reject(err);

    });
});
