#!/bin/bash

#
# Lets bootstrap Human-Connection to stratup on codespaces so we can do dev work

echo "Bootstrapping Human-Connection on codespaces"

export SCRIPT_DIR="$(cd $(dirname $0) && pwd)"
export GIT_ROOT="$(cd "${SCRIPT_DIR}" && git rev-parse --show-toplevel)"


#
# startup neo4j db
# cd "${GIT_ROOT}"
# docker-compose --file ./docker-compose.yml up -d neo4j

#
# setup the backend
# cd "./backend"
# cp .env.template .env
# yarn install
# cd "${GIT_ROOT}"

#
# setup the frontend
# cd "./webapp"
# cp .env.template .env
# yarn install
# cd "${GIT_ROOT}"

# (cd "${GIT_ROOT}/backend" && /sbin/tini -g -- yarn run dev &)
# (cd "${GIT_ROOT}/frontend" && /sbin/tini -g -- yarn run dev &)
