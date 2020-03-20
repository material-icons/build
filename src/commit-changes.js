'use strict';

const config = require('./config');
const exec = require('./exec');

module.exports = (branch, added, updated, publish) =>
	new Promise((fulfill, reject) => {
		// Commit message
		let message = '';
		if (added) {
			message += 'Add ' + added + ' icon' + (added > 1 ? 's' : '');
		}
		if (updated) {
			message +=
				(added ? ', update ' : 'Update ') +
				updated +
				' icon' +
				(updated > 1 ? 's' : '');
		}

		// Commands list
		let commands = [];
		if (added || updated) {
			commands.push('git add -A');
			commands.push('git commit -m "' + message + '"');
		}
		if (publish) {
			commands.push('git push origin ' + branch);
		}

		// Commit changes
		exec(
			config.outputDir,
			commands,
			output => {
				fulfill();
			},
			err => {
				reject(err);
			},
			true
		);
	});
