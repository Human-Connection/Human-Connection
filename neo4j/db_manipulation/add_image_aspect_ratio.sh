#!/usr/bin/env bash

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

shopt -s nullglob
for image in uploads/*; do
  [ -e "$image" ] || continue
  IMAGE_WIDTH=$( identify -format '%w' "$image" )
  IMAGE_HEIGHT=$( identify -format '%h' "$image" )
  IMAGE_ASPECT_RATIO=$(echo | awk "{ print ${IMAGE_WIDTH}/${IMAGE_HEIGHT}}")
  
 
  echo "$image"
  echo "$IMAGE_ASPECT_RATIO"
  echo "
    match (post:Post {image: '/"${image}"'})
    set post.imageAspectRatio = "${IMAGE_ASPECT_RATIO}"
    return post;
  " | cypher-shell
done
