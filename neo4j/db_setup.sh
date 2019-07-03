#!/usr/bin/env bash

ENV_FILE=$(dirname "$0")/.env
[[ -f "$ENV_FILE" ]] && source "$ENV_FILE"

if [ -z "$NEO4J_USERNAME" ] || [ -z "$NEO4J_PASSWORD" ]; then
  echo "Please set NEO4J_USERNAME and NEO4J_PASSWORD environment variables."
  echo "Setting up database constraints and indexes will probably fail because of authentication errors."
  echo "E.g. you could \`cp .env.template .env\` unless you run the script in a docker container"
fi

until echo 'RETURN "Connection successful" as info;' | cypher-shell
do
  echo "Connecting to neo4j failed, trying again..."
  sleep 1
done

echo '
RETURN "Here is a list of indexes and constraints BEFORE THE SETUP:" as info;
CALL db.indexes();
' | cypher-shell

echo '
CALL db.index.fulltext.createNodeIndex("full_text_search",["Post"],["title", "content"]);
CREATE CONSTRAINT ON (p:Post)          ASSERT p.id IS UNIQUE;
CREATE CONSTRAINT ON (c:Comment)       ASSERT c.id IS UNIQUE;
CREATE CONSTRAINT ON (c:Category)      ASSERT c.id IS UNIQUE;
CREATE CONSTRAINT ON (u:User)          ASSERT u.id IS UNIQUE;
CREATE CONSTRAINT ON (o:Organization)  ASSERT o.id IS UNIQUE;
CREATE CONSTRAINT ON (t:Tag)           ASSERT t.id IS UNIQUE;


CREATE CONSTRAINT ON (p:Post)          ASSERT p.slug IS UNIQUE;
CREATE CONSTRAINT ON (c:Category)      ASSERT c.slug IS UNIQUE;
CREATE CONSTRAINT ON (u:User)          ASSERT u.slug IS UNIQUE;
CREATE CONSTRAINT ON (o:Organization)  ASSERT o.slug IS UNIQUE;
' | cypher-shell

echo '
RETURN "Setting up all the indexes and constraints seems to have been successful. Here is a list AFTER THE SETUP:" as info;
CALL db.indexes();
' | cypher-shell
