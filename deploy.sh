#!/bin/bash

set -euxo pipefail

# this is a helper for deploying a npm-based app to a github page.

function main() {
    # check if there're commits to push
    if [[ $(git rev-list @"{u}"..@ --count) = 0 ]]; then
        echo nothing to push
        return
    fi

    local index_is_dirty=false

    # check if there're uncommitted changes
    if [[ $(git status --porcelain) ]]; then
        index_is_dirty=true
    fi

    # stash any uncommitted changes
    git stash --include-untracked
    # build the app
    npm run build
    # stage the built-artifacts just created
    git add docs/.
    # silently add them to the latest commit
    git commit --amend --no-edit
    # push all that to origin
    git push --all

    # output a success message
    echo changes deployed

    # possibly re-apply uncommitted changes
    if [[ "$index_is_dirty" = true ]]; then
        git stash pop stash@"{0}"
    fi
}

main
