'use strict';

const fs = require('fs');
const config = require('./config');
const colors = require('./colors');
const download = require('./download');
const tools = require('@iconify/tools');

const allSuffixes = ['24px.svg', '48px.svg', '20px.svg', '18px.svg'];

module.exports = (name, theme, icon) =>
	new Promise((fulfill, reject) => {
		let key = name + '-' + theme;

		let cleanup = data => {
			let svg = new tools.SVG(data);
			tools
				.SVGO(svg, {
					'id-prefix': 'ic-',
					'mergePaths': true,
				})
				.then(svg => {
					return tools.SVGO(svg, {
						'id-prefix': 'ic-',
						'mergePaths': true,
					});
				})
				.then(svg => {
					fulfill(svg.toString());
				})
				.catch(err => {
					reject(err);
				});
		};

		let customFile;

		// Check for missing icon
		if (icon.missing) {
			customFile = config.removedIconsDir + '/' + icon.local;
			let data = fs.readFileSync(customFile, 'utf8');
			if (typeof data !== 'string') {
				reject('Missing file: ' + customFile);
			} else {
				cleanup(data);
			}
			return;
		}

		// Check for fixed icon
		customFile = config.fixedIconsDir + '/' + icon.local;
		try {
			let data = fs.readFileSync(customFile, 'utf8');
			if (typeof data === 'string') {
				console.log('Using fixed icon for ' + key);
				cleanup(data);
				return;
			}
		} catch (err) {}

		// Check for custom icon
		if (icon.custom) {
			customFile = config.customIconsDir + '/' + icon.local;
			try {
				let data = fs.readFileSync(customFile, 'utf8');
				if (typeof data === 'string') {
					cleanup(data);
					return;
				}
			} catch (err) {}

			// Check for 'baseline-'
			if (theme !== 'baseline') {
				customFile =
					config.customIconsDir +
					'/' +
					icon.local.replace(theme + '.svg', 'baseline.svg');
				try {
					let data = fs.readFileSync(customFile, 'utf8');
					if (typeof data === 'string') {
						cleanup(data);
						return;
					}
				} catch (err) {}
			}

			reject('Missing custom icon: ' + icon.local);
			return;
		}

		// Download icon
		let suffixes = allSuffixes.slice(0),
			nextSuffix = () => {
				let suffix = suffixes.shift();
				if (suffix === void 0) {
					console.log(
						colors.error +
							'[error]' +
							colors.reset +
							' failed all suffixes for ' +
							key
					);
					reject('Error downloading icon ' + key);
					return;
				}

				let url = icon.url.replace('{asset}', suffix);

				download({
					remote: url,
					local: config.cacheDir + '/' + icon.cache.replace('{asset}', suffix),
					keepCache: true,
				})
					.then(data => {
						data = data
							.replace('<?xml version="1.0" encoding="utf-8"?>', '')
							.trim();
						if (data.slice(0, 14) === '<!-- Generator') {
							// console.log('Illustrator code in ' + icon.cache.replace('{asset}', suffix));
							let pos = data.indexOf('-->');
							data = data.slice(pos + 4).trim();
						}

						if (data.slice(0, 4) !== '<svg') {
							console.log(data);
							reject('Invalid SVG content for icon: ' + key);
							return;
						}

						cleanup(data);
					})
					.catch(err => {
						if (typeof err === 'object' && err.statusCode === 404) {
							console.log(colors.error + '[404]' + colors.reset + ':', url);
							nextSuffix();
							return;
						}
						reject(err);
					});
			};

		nextSuffix();
	});
