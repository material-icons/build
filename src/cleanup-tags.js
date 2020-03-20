'use strict';

const tools = require('@iconify/tools');
const cheerio = require('cheerio');

module.exports = (key, code) => {
	let svg = new tools.SVG(code),
		$root = svg.$svg(':root');

	function removeGroups($parent) {
		let $groups = [];

		$parent.children().each((index, child) => {
			let $child = cheerio(child);

			switch (child.tagName) {
				case 'g':
					$groups.push($child);
			}
		});

		if (!$groups.length) {
			return;
		}

		// console.log('\nRemoving groups!\nOriginal: ' + svg.toString());

		$groups.forEach($group => {
			let group = $group.get(0),
				groupProps = {};

			// Find all attributes to pass to child nodes
			Object.keys(group.attribs ? group.attribs : {}).forEach(prop => {
				let value = group.attribs[prop];

				switch (prop) {
					case 'fill':
						if (
							value === '#000' ||
							value === '#000000' ||
							value === 'black' ||
							value === '#010101'
						) {
							break;
						}
						if (value !== 'none') {
							console.log(svg.toString());
							throw new Error('Invalid fill in ' + key + ': ' + value);
						}
						groupProps[prop] = value;
						break;

					case 'fill-rule':
					case 'clip-rule':
						if (value !== 'nonzero') {
							groupProps[prop] = value;
						}
						break;

					case 'opacity':
						groupProps[prop] = value;
						break;

					default:
						console.log(svg.toString());
						throw new Error(
							'Weird group attribute: ' + prop + '="' + value + '"'
						);
				}
			});

			// Move child nodes
			$group.children().each((index, child) => {
				let $child = cheerio(child),
					childProps = child.attribs;

				Object.keys(groupProps).forEach(prop => {
					if (childProps && childProps[prop] === void 0) {
						$child.attr(prop, groupProps[prop]);
					}
				});

				$parent.append($child);
			});
			let html = $group.html();
			$group.remove();
			$parent.append(html);
		});

		// console.log('Final: ' + svg.toString() + '\n');
	}

	function checkNodes($parent) {
		let count = 0;

		$parent.children().each((index, child) => {
			let $child = cheerio(child),
				props = child.attribs;
			count++;

			switch (child.tagName) {
				case 'circle':
				case 'polygon':
				case 'path':
					if (props) {
						if (props.fill !== void 0) {
							switch (props.fill) {
								case 'none':
									$child.remove();
									count--;
									break;

								case '#000':
								case '#000000':
								case 'black':
								case '#010101':
									$child.removeAttr('fill');
									break;

								default:
									console.log(svg.toString());
									throw new Error(
										'Invalid fill for path: ' + props.fill + ' in ' + key
									);
							}
							break;
						}

						['opacity', 'fill-opacity'].forEach(attr => {
							if (props[attr] === void 0) {
								return;
							}

							let value = parseFloat(props[attr]);
							if (isNaN(value)) {
								throw new Error('Invalid ' + attr + ' for path in ' + key);
							}
							if (value > 0.85) {
								console.log(
									'Changing ' + attr + ' in ' + key + ' from ' + value + ' to 1'
								);
								$child.removeAttr(attr);
								return;
							}
							if (value !== 0.3) {
								console.log(
									'Changing ' +
										attr +
										' in ' +
										key +
										' from ' +
										value +
										' to 0.3'
								);
								props[attr] = '.3';
							}
						});
					}

					break;

				case 'defs':
				case 'clipPath':
					checkNodes($child);
					break;

				case 'use':
					break;

				default:
					console.log(svg.toString());
					throw new Error('Invalid tag: ' + child.tagName + ' in ' + key);
			}
		});

		if (!count) {
			console.log(code);
			throw new Error('Empty icon: ' + key);
		}
	}

	removeGroups($root);
	checkNodes($root);

	return svg.toString();
};
