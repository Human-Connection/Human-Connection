#!/usr/bin/env bash

ENV_FILE=$(dirname "$0")/.env
[[ -f "$ENV_FILE" ]] && source "$ENV_FILE"

if [ -z "$NEO4J_USERNAME" ] || [ -z "$NEO4J_PASSWORD" ]; then
  echo "Please set NEO4J_USERNAME and NEO4J_PASSWORD environment variables."
  echo "Database manipulation is not possible without connecting to the database."
  echo "E.g. you could \`cp .env.template .env\` unless you run the script in a docker container"
fi

until echo 'RETURN "Connection successful" as info;' | cypher-shell
do
  echo "Connecting to neo4j failed, trying again..."
  sleep 1
done

echo "
MATCH (submitter:User)-[:REPORTED]->(report:Report)-[:REPORTED]->(resource)
DETACH DELETE report
CREATE (submitter)-[reported:REPORTED]->(resource)
SET reported.createdAt = toString(datetime())
SET reported.reasonCategory = 'other'
SET reported.reasonDescription = '!!! Created automatically to ensure database consistency! createdAt is when the database manipulation happened.'
RETURN reported;
" | cypher-shell
