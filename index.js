"use strict";

const config = require('./src/config');
const colors = require('./src/colors');
const build = require('./src/build');
const setBranch = require('./src/branch');
const commitChanges = require('./src/commit-changes');
const mergeOriginal = require('./src/merge');

let branch = null,
    commit = false,
    publish = false;

// Get arguments. Complex function because of possibility to add more options
if (process.argv.length > 2) {
    let args = process.argv.slice(2),
        skipNextArg = false,
        ignoreNext = false,
        branchNext = false;

    args.forEach((cmd, index) => {
        if (skipNextArg) {
            skipNextArg = false;
            return;
        }

        if (cmd.slice(0, 1) === '-') {
            // noinspection FallThroughInSwitchStatementJS
            branchNext = false;

            switch (cmd) {
                case '--branch':
                    branchNext = true;
                    break;

                case '--commit':
                    commit = true;
                    break;

                case '--publish':
                    commit = true;
                    publish = true;
                    break;

                case '--no-clone':
                    config.clone = false;
                    break;

                default:
                    throw new Error('Unknown command: ' + cmd);
            }
            return;
        }
        if (branchNext) {
            branch = cmd;
        }
    });
}

// Do stuff
if (branch === null) {

    let merged = false,
        changed;

    // Parse all branches
    if (!commit) {
        console.error(colors.error + '[error]' + colors.reset + ': Cannot parse all branches without committing changes. Add --publish or --commit');
        return;
    }

    // Parse original branch
    build('original').then(res => {

        changed = res;
        if (changed.changed) {
            if (changed.changed) {
                console.log('Updated:', changed.updated, '\nAdded:', changed.added);
            }
            return commitChanges('original', changed.added, changed.updated, publish);
        }

    }).then(() => {

        // Change branch
        return setBranch('master');

    }).then(() => {

        // Merge changes
        if (changed.changed) {
            merged = true;
            return mergeOriginal();
        }

    }).then(() => {

        // Build master branch
        return build('master');

    }).then(res => {

        changed = res;
        if (changed.changed) {
            console.log('Updated:', changed.updated, '\nAdded:', changed.added);
        }
        if (changed.changed || merged) {
            return commitChanges('master', changed.added, changed.updated, publish);
        }

    }).catch(err => {
        console.error(colors.error + '[error]' + colors.reset + ':', err);
    });

} else {

    let changed;

    // Parse one branch
    build(branch).then(res => {
        changed = res;
        if (changed.changed) {
            console.log('Updated:', changed.updated, '\nAdded:', changed.added);
            if (commit) {
                // Commit changes
                return commitChanges(branch, changed.added, changed.updated, publish);
            }
        }
    }).then(() => {

        // Done

    }).catch(err => {
        console.error(colors.error + '[error]' + colors.reset + ':', err);
    });

}