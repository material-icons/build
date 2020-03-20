'use strict';

const path = require('path');

let isOriginal = null;

let config = {
	cacheDir: path.dirname(__dirname) + '/cache',
	ignoreCache: false,

	debugRequests: true,
	dataURL: 'https://fonts.google.com/metadata/icons',

	// Repository
	repo: 'git@github.com:material-icons/material-icons.git',

	// Directories
	outputDir: path.dirname(__dirname) + '/material-icons',
	fixedIconsDir: path.dirname(__dirname) + '/fixed',
	customIconsDir: path.dirname(__dirname) + '/custom',
	removedIconsDir: path.dirname(__dirname) + '/removed',

	// Function to check if current actions are done on "original" or "master" branch
	// Original branch contains only Google icons
	// Master branch contains custom icons
	isOriginalBranch: () => {
		if (isOriginal === null) {
			throw new Error('Branch has not been retrieved yet.');
		}
		return isOriginal;
	},
	setBranch: branch => {
		isOriginal = branch === 'original';
	},
};

module.exports = config;
