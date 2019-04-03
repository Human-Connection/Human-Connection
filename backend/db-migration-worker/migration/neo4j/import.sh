#!/usr/bin/env bash
set -e

SCRIPT_DIRECTORY="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
echo "MATCH (n) OPTIONAL MATCH (n)-[r]-() DELETE n,r;" | cypher-shell -a $NEO4J_URI
for collection in "badges" "categories" "users" "follows" "contributions" "shouts" "comments"
do
  echo "Import ${collection}..." && cypher-shell -a $NEO4J_URI < $SCRIPT_DIRECTORY/$collection.cql
done
