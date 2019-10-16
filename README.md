# Material design icons, updated set

This is a build script for SVG repository.

## Purpose

This repository builds contents of SVG repository: https://github.com/material-icons/material-icons

Build process:
* Clone latest version of SVG repository (unless --no-clone flag is set)
* Get latest meta data from material.io
* Download new icons
* Merge with fixed and custom icons
* Clean up and optimize all icons
* Generate SVG repository
* Commit changes (if --commit flag is set)
* Publish repository (if --publish flag is set)

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

Icons that are not 24x24 are scaled to 24x24, then optimized using SVGO.

After SVGO optimization, arcs in paths are de-optimized because some software still does not support compressed arc flags.

Resulting icons are as small as possible and compatible with all software that supports SVG.


# Requesting custom icons

To request custom icons please open an issue on this repository.

Custom icons must fit in one of existing categories. If icon does not fit in one of existing category, you can request new category. However to add new category there must be at least few icons that belong in that category. It wouldn't make sense to add new category just for one icon. So request multiple icons that fit into that category.


# Submitting custom icons

If you are able to design custom icons, you can submit your custom icons.

First you need to design custom icon. It must match following requirements:
* Design must match Material Icons guidelines.
* You must include all 5 variations of icon. If some variations are identical to baseline, you can skip them.
* Icons should be 24x24.
* Icons should only use fill. If there are shapes that use stroke, convert them to outlines before exporting.
* Two tone icons must use 30% opacity on transparent part, 100% on opaque part. Transparent and opaque parts should not overlap.


## Category / tag

Custom icons must fit in one of existing categories.

If icon does not fit in one of existing category, you can request new category. However to add new category there must be at least few icons that belong in that category. It wouldn't make sense to add new category just for one icon. So create multiple icons that fit into that category.


## Files

Clone this repository, add your custom icons in directory custom/v1/{name}.

Then add entries to custom/custom.js. If your icon belongs in one of existing categories, add it under "custom icons", otherwise create entries for custom category similar to "math" or "shopping".


## Pull request

After creating new icons and adding entries to custom.js, create a pull request for this repository.


## License

By submitting your custom icons you agree to share your icons under Apache 2.0 license.
