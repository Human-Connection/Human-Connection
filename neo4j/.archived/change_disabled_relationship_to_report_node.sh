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
// convert old DISABLED to new REVIEWED-Report-BELONGS_TO structure
MATCH (moderator:User)-[disabled:DISABLED]->(disabledResource)
WHERE disabledResource:User OR disabledResource:Comment OR disabledResource:Post
DELETE disabled
CREATE (moderator)-[review:REVIEWED]->(report:Report)-[:BELONGS_TO]->(disabledResource)
SET review.createdAt = toString(datetime()), review.updatedAt = review.createdAt, review.disable = true
SET report.id = randomUUID(), report.createdAt = toString(datetime()), report.updatedAt = report.createdAt, report.rule = 'latestReviewUpdatedAtRules', report.closed = false
// if disabledResource has no filed report, then create a moderators default filed report
WITH moderator, disabledResource, report
OPTIONAL MATCH (disabledResourceReporter:User)-[existingFiledReport:FILED]->(disabledResource)
FOREACH(disabledResource IN CASE WHEN existingFiledReport IS NULL THEN [1] ELSE [] END | 
  CREATE (moderator)-[addModeratorReport:FILED]->(report)
  SET addModeratorReport.createdAt = toString(datetime()), addModeratorReport.reasonCategory = 'other', addModeratorReport.reasonDescription = 'Old DISABLED relations didn't enforce mandatory reporting !!! Created automatically to ensure database consistency! Creation date is when the database manipulation happened.'
)
FOREACH(disabledResource IN CASE WHEN existingFiledReport IS NOT NULL THEN [1] ELSE [] END | 
  CREATE (disabledResourceReporter)-[moveModeratorReport:FILED]->(report)
  SET moveModeratorReport = existingFiledReport
  DELETE existingFiledReport
)
RETURN disabledResource {.id};
" | cypher-shell

echo "
// for FILED resources without DISABLED relation which are handled above, create new FILED-Report-BELONGS_TO structure
MATCH (reporter:User)-[oldReport:REPORTED]->(notDisabledResource)
WHERE notDisabledResource:User OR notDisabledResource:Comment OR notDisabledResource:Post
MERGE (report:Report)-[:BELONGS_TO]->(notDisabledResource)
ON CREATE SET report.id = randomUUID(), report.createdAt = toString(datetime()), report.updatedAt = report.createdAt, report.rule = 'latestReviewUpdatedAtRules', report.closed = false
CREATE (reporter)-[filed:FILED]->(report)
SET report = oldReport
DELETE oldReport
RETURN notDisabledResource {.id};
" | cypher-shell
