'use strict';

const path = require('path');
const config = require('./config');
const fsHelper = require('./files');
const exec = require('./exec');

let cloned = false;

const clone = () =>
	new Promise((fulfill, reject) => {
		if (cloned || config.clone === false) {
			fulfill();
			return;
		}

		// Clean up old directory
		fsHelper.cleanup(config.outputDir);

		// Create empty directory
		fsHelper.mkdir(config.outputDir);

		// Clone repository
		exec(
			config.outputDir,
			[
				'git clone "' +
					config.repo +
					'" --branch master "' +
					config.outputDir +
					'"',
				'git fetch origin original:original',
			],
			() => {
				cloned = true;
				fulfill();
			},
			err => {
				reject(err);
			}
		);
	});

module.exports = branch =>
	new Promise((fulfill, reject) => {
		clone()
			.then(() => {
				// Check branch
				exec(
					config.outputDir,
					['git branch'],
					output => {
						let result = output
							.shift()
							.toString('utf8')
							.split('\n')
							.filter(item => item.indexOf('*') !== -1);
						if (result.length !== 1) {
							reject('Cannot detect branch in output');
							return;
						}
						let currentBranch = result[0].replace('*', '').trim();

						if (typeof branch !== 'string' || currentBranch === branch) {
							config.setBranch(currentBranch);
							fulfill(config.isOriginalBranch());
							return;
						}

						// Change branch
						exec(
							config.outputDir,
							['git checkout ' + branch],
							output => {
								config.setBranch(branch);
								fulfill(config.isOriginalBranch());
							},
							err => {
								reject(err);
							}
						);
					},
					err => {
						reject(err);
					}
				);
			})
			.catch(err => {
				reject(err);
			});
	});
