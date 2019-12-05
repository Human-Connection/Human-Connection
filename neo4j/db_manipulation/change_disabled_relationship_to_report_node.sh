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
  MATCH(user)-[reported:REPORTED]->(resource)
  WITH reported, resource, COLLECT(user) as users
  MERGE(report:Report)-[:BELONGS_TO]->(resource)
  SET report.id = randomUUID(), report.createdAt = toString(datetime()), report.updatedAt = report.createdAt, report.rule = 'latestReviewUpdatedAtRules', report.closed = false
  WITH report, users, reported
  UNWIND users as user
  MERGE (user)-[filed:FILED]->(report)
  SET filed = reported
  DELETE reported;

  MATCH(moderator)-[disabled:DISABLED]->(resource)
  MATCH(report:Report)-[:BELONGS_TO]->(resource)
  WITH disabled, resource, COLLECT(moderator) as moderators, report
  DELETE disabled
  WITH report, moderators, disabled
  UNWIND moderators as moderator
  MERGE (moderator)-[review:REVIEWED {disable: true}]->(report)
  SET review.createdAt = toString(datetime()), review.updatedAt = review.createdAt, review.disable = true;

  MATCH(moderator)-[disabled:DISABLED]->(resource)
  WITH disabled, resource, COLLECT(moderator) as moderators
  MERGE(report:Report)-[:BELONGS_TO]->(resource)
  SET report.id = randomUUID(), report.createdAt = toString(datetime()), report.updatedAt = report.createdAt, report.rule = 'latestReviewUpdatedAtRules', report.closed = false
  DELETE disabled
  WITH report, moderators, disabled
  UNWIND moderators as moderator
  MERGE(moderator)-[filed:FILED]->(report)
  SET filed.createdAt = toString(datetime()), filed.reasonCategory = 'other', filed.reasonDescription = 'Old DISABLED relations didn\'t enforce mandatory reporting !!! Created automatically to ensure database consistency! Creation date is when the database manipulation happened.'
  MERGE (moderator)-[review:REVIEWED {disable: true}]->(report)
  SET review.createdAt = toString(datetime()), review.updatedAt = review.createdAt, review.disable = true;
  :commit
" | cypher-shell