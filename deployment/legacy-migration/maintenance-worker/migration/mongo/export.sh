#!/usr/bin/env bash
set -e

# import .env config
set -o allexport
source $(dirname "$0")/.env
set +o allexport

# Export collection function defintion
function export_collection () {
  "${EXPORT_MONGOEXPORT_BIN}" --db ${MONGODB_DATABASE} --host localhost -d ${MONGODB_DATABASE} --port 27018 --username ${MONGODB_USERNAME} --password ${MONGODB_PASSWORD} --authenticationDatabase ${MONGODB_AUTH_DB} --collection $1  --collection $1 --out "${EXPORT_PATH}$1.json"
  mkdir -p ${EXPORT_PATH}splits/$1/
  split -l 100 -a 3 ${EXPORT_PATH}$1.json ${EXPORT_PATH}splits/$1/
}

# Delete old export & ensure directory
rm -rf ${EXPORT_PATH}*
mkdir -p ${EXPORT_PATH}

# Open SSH Tunnel
ssh -4 -M -S my-ctrl-socket -fnNT -L 27018:localhost:27017 -l ${SSH_USERNAME} ${SSH_HOST}

# Export all Data from the Alpha to json and split them up
export_collection "badges"
export_collection "categories"
export_collection "comments"
export_collection "contributions"
export_collection "emotions"
export_collection "follows"
export_collection "invites"
export_collection "notifications"
export_collection "organizations"
export_collection "pages"
export_collection "projects"
export_collection "settings"
export_collection "shouts"
export_collection "status"
export_collection "systemnotifications"
export_collection "users"
export_collection "userscandos"
export_collection "usersettings"

# Close SSH Tunnel
ssh -S my-ctrl-socket -O check -l ${SSH_USERNAME} ${SSH_HOST}
ssh -S my-ctrl-socket -O exit  -l ${SSH_USERNAME} ${SSH_HOST}
