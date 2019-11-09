# GitHub Action - Android Emulator Runner

Refer to the [recommendeations for versioning and releasing actions](https://github.com/actions/toolkit/blob/master/docs/action-versioning.md#recommendations).

## New major release

- From `master` branch, run `npm run build && npm test --clean && npm run lint` to make sure `lib/*.js` are up-to-date.
- Create a new branch e.g. `release/v1`, comment out `node_modules/` in `.gitignore`, commit the change (do not commit yet `node_modules`).
- Run `npm prune --production`.
- Now commit the changes (the pruned `node_modules`).
- Push to remote.
- Test the new release: `- uses: org/repo@release/v1`.
- To release, create and push a new tag `v1` pointing to the latest commit in the release branch.
- Also create a new GitHub release with `1.0.0` pointing to the head of the release branch which allows users to go back to an older version if there are issues with the latest `v1`.
- To use the latest major version: `- uses: org/repo@v1`.

## New minor / patch release

- From `master` branch, run `npm run build && npm test --clean && npm run lint` to make sure `lib/*.js` are up-to-date.
- Merge from `master` into the release branch e.g. `release/v1`.
- Run `npm prune --production`.
- Commit merged changes (and the pruned `node_modules`).
- Push to remote.
- Test the new release: `- uses: org/repo@release/v1`.
- To release, **move** the existing tag `v1`to the head of the release branch and push.
- Also create a new GitHub release with `1.1.0` (for new minor release) pointing to the head of the release branch which allows users to go back to an older version if there are issues with the latest `v1`.
- To use the latest major version: `- uses: org/repo@v1`.
