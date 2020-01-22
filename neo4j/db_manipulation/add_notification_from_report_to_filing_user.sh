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
  :begin
  MATCH (submitter:User)-[filed:FILED]->(report:Report)
  WHERE NOT (submitter)<-[:NOTIFIED]-(report)
  CREATE (submitter)<-[notification:NOTIFIED]-(report)
  SET notification.createdAt = filed.createdAt,
    notification.updatedAt = notification.createdAt,
    notification.read = FALSE,
    notification.reason = 'filed_report_on_resource';
  :commit
" | cypher-shell