'use strict';

const fs = require('fs');
const config = require('./config');
const exec = require('./exec');

module.exports = (branch, added, updated, publish) =>
	new Promise((fulfill, reject) => {
		let npmPublish = publish && branch === 'master';

		// Bump version
		if (npmPublish) {
			const filename = config.outputDir + '/package.json';
			let data = fs.readFileSync(filename, 'utf8');
			data = JSON.parse(data);

			let version = data.version.split('.');
			let patch = version.pop();
			if (!patch.match(/^[0-9]+$/)) {
				console.error(
					'Cannot bump version in package.json - invalid version number.'
				);
				npmPublish = false;
			} else {
				patch = parseInt(patch) + 1;
				version.push(patch);
				data.version = version.join('.');
				data = JSON.stringify(data, null, 2) + '\n';
				console.log('Bumped package version to', data.version);
				fs.writeFileSync(filename, data, 'utf8');
			}
		}

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
			if (npmPublish) {
				commands.push('npm publish');
			}
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
