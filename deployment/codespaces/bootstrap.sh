#!/bin/bash

#
# Lets bootstrap Human-Connection to stratup on codespaces so we can do dev work

echo "Bootstrapping Human-Connection on codespaces"

export SCRIPT_DIR="$(cd $(dirname $0) && pwd)"
export GIT_ROOT="$(cd "${SCRIPT_DIR}" && git rev-parse --show-toplevel)"


