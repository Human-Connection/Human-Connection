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
// convert old DISABLED to new REVIEWED-Case-FLAGGED structure
MATCH (moderator:User)-[disabled:DISABLED]->(disabledResource)
WHERE disabledResource:User OR disabledResource:Comment OR disabledResource:Post
DELETE disabled
CREATE (moderator)-[review:REVIEWED]->(case:Case)-[:FLAGGED]->(disabledResource)
SET review.createdAt = toString(datetime()), review.updatedAt = review.createdAt, review.disable = true
SET case.id = randomUUID(), case.createdAt = toString(datetime()), case.updatedAt = case.createdAt, case.disable = true, case.closed = false

// if disabledResource has no report, then create a moderators default report
WITH moderator, disabledResource, case
OPTIONAL MATCH (disabledResourceReporter:User)-[existingReport:REPORTED]->(disabledResource)
FOREACH(disabledResource IN CASE WHEN existingReport IS NULL THEN [1] ELSE [] END | 
  CREATE (moderator)-[addModeratorReport:REPORTED]->(case)
  SET addModeratorReport.createdAt = toString(datetime()), addModeratorReport.reasonCategory = 'other', addModeratorReport.reasonDescription = 'Old DISABLED relation had no now mandatory report !!! Created automatically to ensure database consistency! Creation date is when the database manipulation happened.'
)
FOREACH(disabledResource IN CASE WHEN existingReport IS NOT NULL THEN [1] ELSE [] END | 
  CREATE (disabledResourceReporter)-[moveModeratorReport:REPORTED]->(case)
  SET moveModeratorReport = existingReport
  DELETE existingReport
)

RETURN disabledResource;
" | cypher-shell

echo "
// for REPORTED resources without DISABLED relation which are handled above, create new REPORTED-Case-FLAGGED structure
MATCH (reporter:User)-[oldReport:REPORTED]->(notDisabledResource)
WHERE notDisabledResource:User OR notDisabledResource:Comment OR notDisabledResource:Post
CREATE (reporter)-[report:REPORTED]->(case:Case)
MERGE (case)-[:FLAGGED]->(notDisabledResource)
ON CREATE SET case.id = randomUUID(), case.createdAt = toString(datetime()), case.updatedAt = case.createdAt, case.disable = false, case.closed = false
SET report = oldReport
DELETE oldReport

RETURN notDisabledResource;
" | cypher-shell

