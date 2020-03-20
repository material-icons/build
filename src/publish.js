'use strict';

const config = require('./config');
const exec = require('./exec');

module.exports = branch =>
	new Promise((fulfill, reject) => {
		exec(
			config.outputDir,
			['git push origin ' + branch],
			output => {
				fulfill();
			},
			err => {
				reject(err);
			},
			true
		);
	});
