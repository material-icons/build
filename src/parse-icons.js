'use strict';

const tools = require('@iconify/tools');
const config = require('./config');
const colors = require('./colors');
const downloadIcon = require('./download-icon');
const scaleIcon = require('./scale-icon');
const cleanupTags = require('./cleanup-tags');

module.exports = icons =>
	new Promise((fulfill, reject) => {
		let keys = Object.keys(icons),
			themes = [];

		let currentKey, currentTheme, currentIcon;

		// Update code
		let update = (key, theme, code) => {
			code = cleanupTags(key + '-' + theme, code);

			currentIcon.themes[theme].code = code;

			if (
				theme !== 'baseline' &&
				code === currentIcon.themes.baseline.code &&
				currentIcon.clones.indexOf(theme) === -1
			) {
				// Mark as baseline clone
				currentIcon.clones.push(theme);
			}

			next();
		};

		// Skip icon
		let skip = key => {
			delete icons[key];
			next();
		};

		// Parse next icon
		let next = () => {
			currentTheme = themes.shift();

			if (currentTheme === void 0) {
				// Next item
				currentKey = keys.shift();
				if (currentKey === void 0) {
					fulfill();
					return;
				}

				currentIcon = icons[currentKey];
				themes = Object.keys(currentIcon.themes);
				return next();
			}

			let key = currentKey + '-' + currentTheme;

			downloadIcon(currentKey, currentTheme, currentIcon.themes[currentTheme])
				.then(html => {
					if (html === null) {
						skip(key);
						return;
					}

					let svg = new tools.SVG(html);

					if (svg.width !== 24 || svg.height !== 24) {
						if (!svg.width || svg.width !== svg.height) {
							reject(
								'Icon has wrong dimensions: ' +
									svg.width +
									' x ' +
									svg.height +
									': ' +
									currentIcon.themes[currentTheme].local
							);
							return;
						}

						scaleIcon(key, svg)
							.then(svg => {
								if (svg.width !== 24 || svg.height !== 24) {
									console.log(svg.toString());
									reject(
										'Icon has wrong dimensions after scaling: ' +
											svg.width +
											' x ' +
											svg.height +
											': ' +
											currentIcon.themes[currentTheme].local
									);
									return;
								}
								update(currentKey, currentTheme, svg.toString());
							})
							.catch(err => {
								reject(err);
							});
					} else {
						update(currentKey, currentTheme, html);
					}
				})
				.catch(err => {
					reject(err);
				});
		};

		next();
	});
