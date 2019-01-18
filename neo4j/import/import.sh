#!/usr/bin/env bash
SCRIPT_DIRECTORY="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
echo "MATCH (n) OPTIONAL MATCH (n)-[r]-() DELETE n,r;" | cypher-shell
cat $SCRIPT_DIRECTORY/*.cql                            | cypher-shell
