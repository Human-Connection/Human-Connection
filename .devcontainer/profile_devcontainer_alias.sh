#!/bin/bash

export SCRIPT_DIR="$(cd $(dirname $0) && pwd)"
export GIT_ROOT="$(cd "${SCRIPT_DIR}" && git rev-parse --show-toplevel)"
#
# source this file for some environment alias
alias dc='docker-compose --file ${GIT_ROOT}/.devcontainer/docker-compose.yml --project-name vsonline-compose'
alias start_neo4j='dc up -d neo4j'

function get_admin() {
    graphql "{User(role:admin){name}}" | jq -r '.data.User[0].name' 2>/dev/null
}

# use graphql 
# another example query: {User(role:user){slug _id role categories{name}}}
function graphql() {
  query="${1:-"{User(role:admin){name}}"}"
  query="$(echo $query|tr -d '\n')"
  curl -X POST \
    -s -H "Content-Type: application/json" \
    --data "{ \"query\": \"${query}\"}" \
    http://devcontainer:4000/graphql
}


# graphql schema
function graphql_schema() {
    graphql " { __schema { types { name } } }" |jq -r
}

# graphql object
# TODO: broken, not working
function graphql_object() {
    object="${1:-User}"
    graphql "{ __type(name\: \"${object}\") { name } }"|jq -r
}

# TODO: Implement getting fields
# "{ __type(name: \"${object}\") { name fields { name type { name kind } } } }"

# Auth
function ngrok_warn_auth() {
  echo
  echo "WARNING: You need to auth to start more than 2> conections"
  echo "         go here - https://dashboard.ngrok.com/auth/your-authtoken"
  echo 
}

# start ngrok
function ngrok_start() {
    services="webapp backend"
    if [ ! -f "${HOME}/.ngrok2/ngrok.yml" ]; then
      ngrok_warn_auth
      services="webapp"
    fi

    if [ -f "${GIT_ROOT}/.devcontainer/ngrok.pid" ]; then
       echo "Killing previous ngrok - $(cat "${GIT_ROOT}/.devcontainer/ngrok.pid")"
       pkill ngrok
    #    kill -INT $(cat "${GIT_ROOT}/.devcontainer/ngrok.pid")
       sleep 2
    fi

    eval /usr/bin/nohup ngrok start \
    -log=stdout \
    -config "${HOME}/.ngrok2/ngrok.yml" \
    -config "${GIT_ROOT}/.devcontainer/ngrok.yml" \
      ${services} \
        > "${GIT_ROOT}/.devcontainer/ngrok.out.log" \
       2> "${GIT_ROOT}/.devcontainer/ngrok.err.log" < /dev/null &
    PID=$!
    echo $PID > "${GIT_ROOT}/.devcontainer/ngrok.pid"
    sleep 2
    grep "url" "${GIT_ROOT}/.devcontainer/ngrok.out.log"|awk -F'url=' '{print $2}'|grep 'https'
}