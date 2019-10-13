"use strict";

const fs = require('fs');
const config = require('./config');
const cache = require('./cache');
const download = require('./download');

module.exports = () => new Promise((fulfill, reject) => {
    download({
        remote: config.dataURL,
        keepCache: true,
        debug: true,
        expiration: 1000 * 86400, // Change cache every 24 hours
        returnMeta: true
    }).then(meta => {
        if (!config.isOriginalBranch() && !meta.cached) {
            reject('Must check original branch before checking master branch.');
            return;
        }

        let html = meta.html;
        let start = html.indexOf('{');
        if (!start) {
            console.log(html);
            reject('Invalid JSON data');
            return;
        }

        let data = JSON.parse(html.slice(start));

        if (
            typeof data !== 'object' ||
            data.host === void 0 || data.asset_url_pattern === void 0 ||
            data.icons === void 0 || !(data.icons instanceof Array) ||
            data.families === void 0
        ) {
            console.log(html);
            reject('Invalid JSON data');
            return;
        }

        // Base URL
        let baseURL = 'https://' + data.host + data.asset_url_pattern;

        // Verify families
        // Change themes below if this test fails
        let expectedFamilies = [
            "Material Icons",
            "Material Icons Outlined",
            "Material Icons Round",
            "Material Icons Sharp",
            "Material Icons Two Tone"
        ];
        if (
            data.families.length !== expectedFamilies.length ||
            (function() {
                let error = false;
                data.families.forEach((item, index) => {
                    if (expectedFamilies[index] !== item) {
                        error = true;
                    }
                });
                return error;
            })()
        ) {
            console.log(data.families);
            reject('Invalid font families');
            return;
        }

        // Set themes
        let baseFamily = 'materialicons';
        config.themes = {
            baseline: {
                title: 'Baseline',
                url: baseURL.replace('{family}', baseFamily)
            },
            sharp: {
                title: 'Sharp',
                url: baseURL.replace('{family}', baseFamily + 'sharp')
            },
            outline: {
                title: 'Outline',
                url: baseURL.replace('{family}', baseFamily + 'outlined')
            },
            round: {
                title: 'Round',
                url: baseURL.replace('{family}', baseFamily + 'round')
            },
            twotone: {
                title: 'Two Tone',
                url: baseURL.replace('{family}', baseFamily + 'twotone')
            }
        };

        // Check for unsupported_families and get categories
        let errors = [],
            categories = Object.create(null),
            names = Object.create(null);

        data.icons.forEach(icon => {
            if (icon.unsupported_families.length) {
                // See "TODO" note in get-icons
                errors.push('unsupported_families for icon ' + icon.name + ': ' + icon.unsupported_families.join(', '));
            }
            icon.categories.forEach(category => categories[category] = true);
            names[icon.name] = true;
        });
        if (errors.length) {
            console.log(errors);
            reject('Found unsupported_families');
            return;
        }
        config.categories = Object.keys(categories);

        // Check for missing icons
        if (config.isOriginalBranch()) {
            // Get missing icons list
            let missingJSON;
            try {
                missingJSON = fs.readFileSync(config.removedIconsDir + '/data.json', 'utf8');
                missingJSON = JSON.parse(missingJSON);
            } catch (err) {
                missingJSON = {};
            }

            // Check for other missing icons
            let oldData;
            try {
                oldData = fs.readFileSync(config.outputDir + '/data.json', 'utf8');
                oldData = JSON.parse(oldData);
            } catch (err) {
                reject('Cannot get old data to compare');
            }

            if (oldData.categories !== void 0) {
                // Old format
                let missing = Object.create(null);

                Object.keys(oldData.categories).forEach(category => {
                    oldData.categories[category].forEach(icon => {
                        if (names[icon] === void 0) {
                            missing[icon] = category;
                        }
                    });
                });

                let keys = Object.keys(missing);
                if (keys.length) {
                    console.log('Saving backup for missing icons: ', keys.join(', '));

                    // Copy all missing icons
                    keys.forEach(name => {
                        let category = missing[name];
                        if (config.categories.indexOf(category) === -1) {
                            // TODO: add ability to rename old categories
                            throw new Error('Missing category: ' + category);
                        }

                        if (missingJSON[name] !== void 0) {
                            // Already copied
                            return;
                        }

                        Object.keys(config.themes).forEach(theme => {
                            let source = config.outputDir + '/svg/' + category + '/' + theme + '-' + name + '.svg',
                                target = config.removedIconsDir + '/v0/' + name + '/' + theme + '.svg';

                            let content = fs.readFileSync(source, 'utf8');
                            if (typeof content !== 'string') {
                                throw new Error('Missing file: ' + source);
                            }
                            cache.save(target, content);
                        });

                        // Add icon
                        missingJSON[name] = {
                            name: name,
                            categories: [category]
                        };
                        names[name] = true;
                    });

                    // Save JSON
                    fs.writeFileSync(config.removedIconsDir + '/data.json', JSON.stringify(missingJSON, null, '\t'), 'utf8');
                }
            } else if (oldData.icons instanceof Array) {
                // New format
                let missing = [];

                oldData.icons.forEach(icon => {
                    if (names[icon.name] !== void 0 || missingJSON[icon.name] !== void 0) {
                        return;
                    }

                    let name = icon.name,
                        version = icon.version ? icon.version : 0;

                    // Test for categories
                    (icon.categories ? icon.categories : []).forEach(category => {
                        if (config.categories.indexOf(category) === -1) {
                            // TODO: add ability to rename old categories
                            throw new Error('Missing category: ' + category);
                        }
                    });

                    // Copy icon
                    Object.keys(config.themes).forEach(theme => {
                        let source = config.outputDir + '/svg/' + name + '/' + theme + '.svg',
                            target = config.removedIconsDir + '/v' + version + '/' + name + '/' + theme + '.svg';

                        let content = fs.readFileSync(source, 'utf8');
                        if (typeof content !== 'string') {
                            throw new Error('Missing file: ' + source);
                        }
                        cache.save(target, content);

                    });

                    // Add icon
                    missingJSON[name] = icon;
                    missing.push(name);
                    names[name] = true;
                });

                if (missing.length) {
                    console.log('Saved backup for missing icons: ', missing.join(', '));

                    // Save JSON
                    fs.writeFileSync(config.removedIconsDir + '/data.json', JSON.stringify(missingJSON, null, '\t'), 'utf8');
                }
            }
        }

        fulfill(data);
    }).catch(err => {
        reject(err);
    })
});
