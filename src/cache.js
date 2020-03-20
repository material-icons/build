'use strict';

const fs = require('fs');
const crypto = require('crypto');
const config = require('./config');
const files = require('./files');

const functions = {
	/**
	 * Generate hash from link
	 *
	 * @param link
	 * @return {string}
	 */
	hash: link =>
		crypto
			.createHash('md5')
			.update(link)
			.digest('hex'),

	/**
	 * Get full cache filename
	 *
	 * @param {string} name
	 * @returns {string}
	 */
	filename: name => config.cacheDir + '/' + name,

	/**
	 * Check if cache exists and hasn't expired
	 *
	 * @param {string} filename
	 * @param {string} [ext] File extension
	 * @returns {boolean}
	 */
	valid: (filename, ext) => {
		return files.exists(filename, true);
	},

	/**
	 * Get file contents
	 *
	 * @param {string} filename
	 * @returns {string|null}
	 */
	get: filename => {
		let html;
		try {
			html = fs.readFileSync(filename, 'utf8');
		} catch (err) {
			return null;
		}
		return html;
	},

	/**
	 * Save cache
	 *
	 * @param {string} filename
	 * @param {string} data
	 * @returns {boolean}
	 */
	save: (filename, data) => {
		let dirs = filename.split('/');

		dirs.pop();
		files.mkdir(dirs);

		try {
			fs.writeFileSync(
				filename,
				data,
				typeof data === 'string' ? 'utf8' : null
			);
		} catch (err) {
			return false;
		}
		return true;
	},
};

module.exports = functions;
