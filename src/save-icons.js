'use strict';

const fs = require('fs');
const config = require('./config');
const colors = require('./colors');
const files = require('./files');

module.exports = icons => {
	let dirs = {},
		count = 0;

	Object.keys(icons).forEach(key => {
		let icon = icons[key];

		Object.keys(icon.themes).forEach(theme => {
			let dir = config.outputDir + '/svg/' + icon.name;
			if (dirs[dir] === void 0) {
				files.mkdir(dir);
				dirs[dir] = true;
			}
			let filename = theme + '.svg';

			fs.writeFileSync(dir + '/' + filename, icon.themes[theme].code, 'utf8');
			count++;
		});
	});

	console.log(
		colors.info + '[save-icons]' + colors.reset + ': Saved ' + count + ' icons.'
	);
};
