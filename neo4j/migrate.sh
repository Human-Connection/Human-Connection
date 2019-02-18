#!/usr/bin/env bash
set -e
if [[ -z "${NEO4J_PASSWORD}" ]]; then
  echo 'CALL db.index.fulltext.createNodeIndex("full_text_search",["Post"],["title", "content"]);' | cypher-shell
else
  echo "CALL dbms.security.changePassword('${NEO4J_PASSWORD}');" | cypher-shell --username neo4j --password neo4j
  echo "CREATE CONSTRAINT ON (p:Post)          ASSERT p.slug IS UNIQUE;"  | cypher-shell
  echo "CREATE CONSTRAINT ON (c:Category)      ASSERT c.slug IS UNIQUE;"  | cypher-shell
  echo "CREATE CONSTRAINT ON (u:User)          ASSERT u.slug IS UNIQUE;"  | cypher-shell
  echo "CREATE CONSTRAINT ON (o:Organization)  ASSERT o.slug IS UNIQUE;"  | cypher-shell
fi
