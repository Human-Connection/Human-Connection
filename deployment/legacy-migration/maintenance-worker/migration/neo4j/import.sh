#!/usr/bin/env bash
set -e

SECONDS=0
SCRIPT_DIRECTORY="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

echo "MATCH (n) DETACH DELETE n;" | cypher-shell

for collection in "badges" "categories" "users" "follows" "contributions" "shouts" "comments"
do
  for chunk in /tmp/mongo-export/splits/$collection/*
  do
    mv $chunk /tmp/mongo-export/splits/current-chunk.json
    echo "Import ${chunk}" && cypher-shell < $SCRIPT_DIRECTORY/$collection.cql
  done
done
echo "Time elapsed: $SECONDS seconds"
