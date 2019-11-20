#!/usr/bin/env bash
shopt -s nullglob
TEMP_FILE=/var/lib/neo4j/import/temp.json
for image in public/uploads/*; do
  [ -e "$image" ] || continue
  export IMAGE_METADATA=$( identify -format '%w %h' "$image" )
  JSON_STRING=$( jq -n \
                    --arg imageURL "$image" \
                    --arg imageMetaData "$IMAGE_METADATA" \
                    '{imageURL: $imageURL, imageMetaData: $imageMetaData}' )
  echo "$JSON_STRING," >> "$TEMP_FILE"
done

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
WITH "file:${TEMP_FILE}" 
AS url
CALL apoc.load.json(url) YIELD value as post
MATCH (p:Post {image: post.imageURL}) return p;
" | cypher-shell
