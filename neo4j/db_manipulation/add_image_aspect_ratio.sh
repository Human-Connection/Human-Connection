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

echo "
  CALL apoc.periodic.iterate('
  CALL apoc.load.csv("out.csv") yield map as row return row
  ','
  MATCH (post:Post) where post.image = row.image
  set post.imageAspectRatio = row.aspectRatio
  ', {batchSize:10000, iterateList:true, parallel:true});
" | cypher-shell
