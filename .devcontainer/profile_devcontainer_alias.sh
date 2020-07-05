#!/bin/bash

export SCRIPT_DIR="$(cd $(dirname $0) && pwd)"
export GIT_ROOT="$(cd "${SCRIPT_DIR}" && git rev-parse --show-toplevel)"
#
# source this file for some environment alias
alias dc='docker-compose --file ${GIT_ROOT}/docker-compose.yml --file ${GIT_ROOT}/.devcontainer/docker-compose.yml --project-name vsonline-compose'
