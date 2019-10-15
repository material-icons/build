# Material design icons, updated set

This is a build script for SVG repository.

## Purpose

This repository builds contents of SVG repository: https://github.com/material-icons/material-icons

Build process:
* Get latest meta data from material.io
* Download new icons
* Merge with fixed and custom icons
* Clean up and optimize all icons
* Generate SVG repository


## Branches

This script builds two branches:
* original - contains only official Google icons
* master - contains official and custom icons


## Dependencies

Before running script install dependencies:

```
npm install
```

## Build script

To build all branches run
```
npm run build
```

To build one branch run one of following commands:
```
node index --branch original
```
```
node index --branch master
```

This will only build one of branches, without committing changes. To automatically commit changes, add --commit.

To publish to repository, add --publish.

### Building both branches

Command above will build only one branch. However it is possible to build both branches.

To build both original and master branches, run this:
```
node index --commit
```

Building both branches requires --commit flag to be set because if there are changes in original branch, they must be committed first and merged into master branch before master branch can be built.

Script will do all of that automatically.

To fully automate build process run:
```
node index --commit --publish
```

Make sure you have write access rights to repository before using --publish flag. Change repository in src/config.js


## Clean up

All icons are cleaned up and optimized.

Icons that are not 24x24 are scaled to 24x24, then optimized.


