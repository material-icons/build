'use strict';

const config = require('./config');
const exec = require('./exec');

module.exports = () =>
	new Promise((fulfill, reject) => {
		// Check for changes
		exec(
			config.outputDir,
			['git status --porcelain=v1'],
			output => {
				let lines = output[0].trim().split('\n'),
					added = 0,
					updated = 0,
					data = false;

				lines.forEach(line => {
					line = line.trim();
					if (!line.length) {
						return;
					}

					let parts = line.split(' ');
					if (parts.length !== 2) {
						throw new Error('Unknown line in status output: ' + line);
					}

					let filename = parts.pop();
					if (filename === 'data.json') {
						data = true;
						return;
					}

					switch (parts.shift()) {
						case 'M':
							updated++;
							break;

						case '??':
							added++;
							break;

						default:
							throw new Error('Unknown line in status output: ' + line);
					}
				});

				fulfill({
					changed: data || added > 0 || updated > 0,
					added: added,
					updated: updated,
					data: data,
				});
			},
			err => {
				reject(err);
			}
		);
	});
