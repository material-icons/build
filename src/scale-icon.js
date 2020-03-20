'use strict';

const fs = require('fs');
const tools = require('@iconify/tools');
const config = require('./config');
const colors = require('./colors');

module.exports = (key, svg) =>
	new Promise((fulfill, reject) => {
		// Check if scaled icon already exists
		let data;
		try {
			data = fs.readFileSync(config.fixedIconsDir + '/' + key + '.svg', 'utf8');
			if (typeof data === 'string') {
				svg = new tools.SVG(data);
				fulfill(svg);
				return;
			}
		} catch (err) {}

		let scale = 24 / svg.width;

		console.log(
			colors.info +
				'[' +
				key +
				']' +
				colors.reset +
				': Scaling icon from ' +
				svg.width
		);
		tools
			.Scale(svg, scale)
			.then(svg => {
				let html = svg.toString();

				if (html.indexOf('transform') !== -1 || html.indexOf('<g') !== -1) {
					console.log(
						colors.info + '[' + key + ']' + colors.reset + ': ' + html
					);
				}

				fulfill(svg);
			})
			.catch(err => {
				console.log(svg.toString());
				reject(err);
			});
	});
