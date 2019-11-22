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
// convert old DISABLED to new REVIEWED-CaseFolder-FLAGGED structure
MATCH (moderator:User)-[disabled:DISABLED]->(disabledResource)
WHERE disabledResource:User OR disabledResource:Comment OR disabledResource:Post
DELETE disabled
CREATE (moderator)-[review:REVIEWED]->(caseFolder:CaseFolder)-[:FLAGGED]->(disabledResource)
SET review.createdAt = toString(datetime()), review.updatedAt = review.createdAt, review.disable = true
SET caseFolder.id = randomUUID(), caseFolder.createdAt = toString(datetime()), caseFolder.updatedAt = caseFolder.createdAt, caseFolder.rule = 'latestReviewUpdatedAtRules', caseFolder.disable = true, caseFolder.closed = false

// if disabledResource has no report, then create a moderators default report
WITH moderator, disabledResource, caseFolder
OPTIONAL MATCH (disabledResourceReporter:User)-[existingReport:REPORTED]->(disabledResource)
FOREACH(disabledResource IN CASE WHEN existingReport IS NULL THEN [1] ELSE [] END | 
  CREATE (moderator)-[addModeratorReport:REPORTED]->(caseFolder)
  SET addModeratorReport.createdAt = toString(datetime()), addModeratorReport.reasonCategory = 'other', addModeratorReport.reasonDescription = 'Old DISABLED relation had no now mandatory report !!! Created automatically to ensure database consistency! Creation date is when the database manipulation happened.'
)
FOREACH(disabledResource IN CASE WHEN existingReport IS NOT NULL THEN [1] ELSE [] END | 
  CREATE (disabledResourceReporter)-[moveModeratorReport:REPORTED]->(caseFolder)
  SET moveModeratorReport = existingReport
  DELETE existingReport
)

RETURN disabledResource {.id};
" | cypher-shell

echo "
// for REPORTED resources without DISABLED relation which are handled above, create new REPORTED-CaseFolder-FLAGGED structure
MATCH (reporter:User)-[oldReport:REPORTED]->(notDisabledResource)
WHERE notDisabledResource:User OR notDisabledResource:Comment OR notDisabledResource:Post
MERGE (caseFolder:CaseFolder)-[:FLAGGED]->(notDisabledResource)
ON CREATE SET caseFolder.id = randomUUID(), caseFolder.createdAt = toString(datetime()), caseFolder.updatedAt = caseFolder.createdAt, caseFolder.rule = 'latestReviewUpdatedAtRules', caseFolder.disable = false, caseFolder.closed = false
CREATE (reporter)-[report:REPORTED]->(caseFolder)
SET report = oldReport
DELETE oldReport

RETURN notDisabledResource {.id};
" | cypher-shell

