#!/usr/bin/env bash
set -e
echo "CALL dbms.security.changePassword('${NEO4J_PASSWORD}');" | cypher-shell --username neo4j --password neo4j
echo 'CALL db.index.fulltext.createNodeIndex("full_text_search",["Post"],["title", "content"]);' | cypher-shell --username neo4j --password $NEO4J_PASSWORD
