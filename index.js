"use strict";

const fs = require('fs');
const config = require('./src/config');
const files = require('./src/files');
const colors = require('./src/colors');
const setBranch = require('./src/branch');
const getData = require('./src/get-data');
const getIcons = require('./src/get-icons');
const parseIcons = require('./src/parse-icons');
const saveIcons = require('./src/save-icons');
const testChanges = require('./src/test-changes');

let icons;

// to update icons list:
// rm -rf cache/*.json cache/*.html

let options = {
    branch: null
};

// Get arguments. Complex function because of possibility to add more options
if (process.argv.length > 2) {
    let args = process.argv.slice(2),
        skipNextArg = false,
        ignoreNext = false,
        branchNext = false;

    args.forEach((cmd, index) => {
        if (skipNextArg) {
            skipNextArg = false;
            return;
        }

        if (cmd.slice(0, 1) === '-') {
            // noinspection FallThroughInSwitchStatementJS
            branchNext = false;

            switch (cmd) {
                case '--branch':
                    branchNext = true;
                    break;

                default:
                    throw new Error('Unknown command: ' + cmd);
            }
            return;
        }
        if (branchNext) {
            options.branch = cmd;
        }
    });
}

if (options.branch === null) {
    console.error('Missing branch. Use node index --branch branch\nwhere branch is one of following: master, original');
    return;
}

setBranch(options.branch).then(result => {

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
        root: 'https://cyberalien.github.io/google-material-design-icons-updated/svg/',
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

}).catch(err => {

    console.error(colors.error + '[error]' + colors.reset + ':', err);

});