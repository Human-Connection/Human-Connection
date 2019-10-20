#!/usr/bin/env bash
ROOT_DIR=$(dirname "$0")/..
RELEASE_DIR="${ROOT_DIR}/release"

VERSION=$(<$ROOT_DIR/VERSION)

# mkdir -p $RELEASE_DIR

# The following command part produces 854M on my machine
# apps=(nitro-web nitro-backend neo4j maintenance-worker maintenance)
# for app in "${apps[@]}"
# do
#   docker image save "humanconnection/${app}:latest" | gzip > "${RELEASE_DIR}/${app}.${VERSION}.tar.gz"
# done

ghr -soft "${VERSION}"
