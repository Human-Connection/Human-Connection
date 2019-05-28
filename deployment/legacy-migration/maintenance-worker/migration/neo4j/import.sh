#!/usr/bin/env bash
set -e

# import .env config
set -o allexport
source $(dirname "$0")/.env
set +o allexport

# Import collection function defintion
function import_collection () {
  for chunk in ${IMPORT_PATH}splits/$1/*
  do
    mv $chunk ${IMPORT_CHUNK_PATH}
    NEO4J_COMMAND="$(envsubst '${IMPORT_CHUNK_PATH_CQL}' < $(dirname "$0")/$1.cql)"
    echo "Import ${chunk}"
    echo "${NEO4J_COMMAND}" | "${IMPORT_CYPHERSHELL_BIN}" -u ${NEO4J_USERNAME} -p ${NEO4J_PASSWORD}
  done
}

# Time variable
SECONDS=0

# Delete all Neo4J Database content
echo "Deleting Database Contents"
echo "MATCH (n) DETACH DELETE n;" | "${IMPORT_CYPHERSHELL_BIN}" -u ${NEO4J_USERNAME} -p ${NEO4J_PASSWORD}

# Import Data
echo "Start Importing Data"
import_collection "badges"
#import_collection "categories"
#import_collection "comments"
#import_collection "contributions"
#import_collection "emotions"
#import_collection "follows"
#import_collection "invites"
#import_collection "notifications"
#import_collection "organizations"
#import_collection "pages"
#import_collection "projects"
#import_collection "settings"
#import_collection "shouts"
#import_collection "status"
#import_collection "systemnotifications"
#import_collection "users"
#import_collection "userscandos"
#import_collection "usersettings"

echo "Time elapsed: $SECONDS seconds"
