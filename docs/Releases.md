# Releases

Releases are automatically build and published as [`hybridilusmu`](https://github.com/funidata/hybridilusmu/pkgs/container/hybridilusmu) to GitHub Container Registry.

## Stable Release

A stable release is tagged with `npm version` and after merging to `main`, the stable release workflow is triggered by publishing a [GitHub release](https://github.com/funidata/hybridilusmu/releases/new).

An example workflow:

1. Make sure your local branch is clean.
2. Run `npm version <major|minor|patch>` in repo root. This bumps the version in all NPM projects, commits the changes, creates a new tag and pushes tags to GitHub. Only the tags are pushed automatically and it does not matter whether or not your actual branch has been pushed to `origin`. You will need to push the actual commits as usual.
3. Have the branch reviewed and merged into `main`.
4. [Create a new release](https://github.com/funidata/hybridilusmu/releases/new) on GitHub, choosing your new tag as the source. You can use the tag's name as release title or come up with something better.
5. Upon clicking Publish Release, the stable release workflow is triggered. It builds the image from the chosen tag, requires all tests to pass, and published the image to GHCR upon success.

## Unstable Release

The head of `main` branch is published on every push with the `next` tag.
