#!/usr/bin/env bash
SCRIPT_DIRECTORY="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
echo "MATCH (n) OPTIONAL MATCH (n)-[r]-() DELETE n,r;" | cypher-shell
for collection in "badges" "categories" "users" "follows" "contributions" "shouts" "comments"
do
  echo "Import ${collection}..." && cypher-shell < $SCRIPT_DIRECTORY/$collection.cql
done
