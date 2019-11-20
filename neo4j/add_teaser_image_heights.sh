#!/usr/bin/env bash
set -e

echo "images"
shopt -s nullglob
for image in *; do
# [ -e "$image" ] || continue
  echo "$image"
done

# ENV_FILE=$(dirname "$0")/.env
# [[ -f "$ENV_FILE" ]] && source "$ENV_FILE"

# if [ -z "$NEO4J_USERNAME" ] || [ -z "$NEO4J_PASSWORD" ]; then
#   echo "Please set NEO4J_USERNAME and NEO4J_PASSWORD environment variables."
#   echo "Database manipulation is not possible without connecting to the database."
#   echo "E.g. you could \`cp .env.template .env\` unless you run the script in a docker container"
# fi

# until echo 'RETURN "Connection successful" as info;' | cypher-shell
# do
#   echo "Connecting to neo4j failed, trying again..."
#   sleep 1
# done

# echo "
# MATCH (post:Post) where post.teaserImageHeight is not null return post;
# " | cypher-shell