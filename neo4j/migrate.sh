#!/usr/bin/env bash

# If the user has the password `neo4j` this is a strong indicator, that we are
# the initial default user. Before we can create constraints, we have to change
# the default password. This is a security feature of neo4j.
if echo ":exit" | cypher-shell  --password neo4j 2> /dev/null ; then
  neo4j-admin set-initial-password $NEO4J_PASSWORD
fi

set -e

echo '
CALL db.index.fulltext.createNodeIndex("full_text_search",["Post"],["title", "content"]);
CREATE CONSTRAINT ON (p:Post)          ASSERT p.id IS UNIQUE;
CREATE CONSTRAINT ON (c:Comment)       ASSERT c.id IS UNIQUE;
CREATE CONSTRAINT ON (c:Category)      ASSERT c.id IS UNIQUE;
CREATE CONSTRAINT ON (u:User)          ASSERT u.id IS UNIQUE;
CREATE CONSTRAINT ON (o:Organization)  ASSERT o.id IS UNIQUE;
CREATE CONSTRAINT ON (t:Tag)           ASSERT t.id IS UNIQUE;
CREATE CONSTRAINT ON (c:Category)      ASSERT c.id IS UNIQUE;


CREATE CONSTRAINT ON (p:Post)          ASSERT p.slug IS UNIQUE;
CREATE CONSTRAINT ON (c:Category)      ASSERT c.slug IS UNIQUE;
CREATE CONSTRAINT ON (u:User)          ASSERT u.slug IS UNIQUE;
CREATE CONSTRAINT ON (o:Organization)  ASSERT o.slug IS UNIQUE;
'  | cypher-shell
