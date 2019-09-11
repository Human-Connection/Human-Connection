#!/usr/bin/env bash

TAG=$1

DOCKER_CLI_EXPERIMENTAL=true

IMAGES=(neo4j nitro-backend nitro-webapp maintenance maintenance-worker)

for IMAGE in ${IMAGES[*]}
do
  TARGET="humanconnection/${IMAGE}:${TAG}"
  docker manifest inspect $TARGET >/dev/null
  if [ $? -eq 0 ]
  then
    echo "${TARGET} present"
  else
    echo "${TARGET} missing"
  fi
done
