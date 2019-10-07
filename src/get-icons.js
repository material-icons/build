"use strict";

const fs = require('fs');
const config = require('./config');
const colors = require('./colors');
const download = require('./download');

module.exports = data => {
    let list = {},
        themes = Object.keys(config.themes);

    data.icons.forEach(icon => {
        let name = icon.name,
            version = icon.version,
            categories = icon.categories,
            tags = icon.tags;

        let item = {
            name: name,
            version: version,
            categories: categories,
            tags: tags,
            // TODO: check Google's format
            clones: [], // icon.unsupported_families.length ? icon.unsupported_families.slice(0) : [],
            themes: {}
        };

        themes.forEach(theme => {
            if (icon.unsupported_families.indexOf(theme) !== -1) {
                return;
            }

            item.themes[theme] = {
                cache: 'v' + version + '/' + name + '/' + theme + '-{asset}',
                url: config.themes[theme].url.replace('{icon}', name).replace('{version}', version),
                local: 'v' + version + '/' + name + '/' + theme + '.svg'
            };
        });

        list[name] = item;
    });

    // Add custom icons
    if (!config.isOriginalBranch()) {
        const customData = require(config.customIconsDir + '/custom');
        Object.keys(customData.icons).forEach(name => {
            if (list[name] !== void 0) {
                // Exists in default set
                console.log('Icon ' + name + ' exists in custom and official sets');
                return;
            }

            let icon = customData.icons[name];

            let item = Object.assign({
                name: name
            }, icon, {
                clones: [],
                themes: {},
                custom: true
            });

            themes.forEach(theme => {
                item.themes[theme] = {
                    local: 'v' + icon.version + '/' + name + '/' + theme + '.svg',
                    custom: true
                }
            });

            list[name] = item;
        });
    }

    // Add missing icons
    let missingJSON;
    try {
        missingJSON = fs.readFileSync(config.removedIconsDir + '/data.json', 'utf8');
        missingJSON = JSON.parse(missingJSON);
    } catch (err) {
        missingJSON = {};
    }

    Object.keys(missingJSON).forEach(name => {
        let icon = missingJSON[name];
        if (list[name] !== void 0) {
            // No longer missing
            return;
        }

        let item = {
            name: name,
            version: icon.version,
            categories: icon.categories,
            tags: icon.tags,
            clones: [],
            themes: {},
            missing: true
        };

        themes.forEach(theme => {
            item.themes[theme] = {
                local: 'v' + (icon.version ? icon.version : 0) + '/' + name + '/' + theme + '.svg',
                missing: true
            }
        });

        list[name] = item;
    });

    return list;
};
