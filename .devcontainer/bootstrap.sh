#!/bin/bash

function bootstrap_backend() {
    _PWD="$(pwd)"
    cd "${GIT_ROOT}/backend"
    cp .env.template .env
    yarn install --production=false --frozen-lockfile --non-interactive
    NODE_ENV=production yarn run build
    /usr/bin/nohup yarn run dev > backend.out.log 2> backend.err.log < /dev/null &
    cd "${_PWD}"
}

function bootstrap_webapp() {
    _PWD="$(pwd)"
    cd "${GIT_ROOT}/webapp"
    cp .env.template .env
    yarn install --production=false --frozen-lockfile --non-interactive
    NODE_ENV=production yarn run build
    /usr/bin/nohup yarn run dev > webapp.out.log 2> webapp.err.log < /dev/null &
    cd "${_PWD}"
}

function profile_alias() {
    if grep profile_devcontainer_alias.sh "${HOME}/.profile" > /dev/null 2<&1; then
      echo ".profile is setup"
    else
      echo "setting up ${HOME}/.profile"
      echo "source \"${GIT_ROOT}/.devcontainer/profile_devcontainer_alias.sh\"">> "${HOME}/.profile"
    fi
}
#
# starup local services for dev
# export SCRIPT_DIR="$(cd $(dirname $0) && pwd)"
# export GIT_ROOT="$(cd "${SCRIPT_DIR}" && git rev-parse --show-toplevel)"
export GIT_ROOT="${1:-/workspace/Human-Connection}"
echo "Starting app bootstrap -  ${GIT_ROOT}"
profile_alias
bootstrap_backend
bootstrap_webapp

# we don't want the app to exit
echo 'Done building - wait forever'
sleep infinity