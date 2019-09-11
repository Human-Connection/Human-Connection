#!/usr/bin/env bash
ROOT_DIR=$(dirname "$0")
DOCKER_CLI_EXPERIMENTAL=enabled
# BUILD_COMMIT=${TRAVIS_COMMIT:-$(git rev-parse HEAD)}

IFS='.' read -r major minor patch < $ROOT_DIR/../VERSION
apps=(nitro-web nitro-backend neo4j maintenance-worker maintenance)
tags=(latest $major $major.$minor $major.$minor.$patch)

# These three docker images have already been built by now:
# docker build --build-arg BUILD_COMMIT=$BUILD_COMMIT --target production -t humanconnection/nitro-backend:latest $ROOT_DIR/backend
# docker build --build-arg BUILD_COMMIT=$BUILD_COMMIT --target production -t humanconnection/nitro-web:latest $ROOT_DIR/webapp
# docker build --build-arg BUILD_COMMIT=$BUILD_COMMIT -t humanconnection/neo4j:latest $ROOT_DIR/neo4j
docker build -t humanconnection/maintenance-worker:latest $ROOT_DIR/deployment/legacy-migration/maintenance-worker
docker build -t humanconnection/maintenance:latest $ROOT_DIR/webapp/ -f $ROOT_DIR/webapp/Dockerfile.maintenance

echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin

for app in "${apps[@]}"
do
  for tag in "${tags[@]}"
  do
    SOURCE="humanconnection/${app}:latest"
    TARGET="humanconnection/${app}:${tag}"
    if docker manifest inspect $TARGET &> /dev/null; then
      echo "Docker image ${TARGET} already present, skipping ..."
    else
      docker tag $SOURCE $TARGET
      docker push tag
    fi
  done
done
