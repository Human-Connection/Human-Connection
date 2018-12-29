#!/usr/bin/env bash
echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin
docker push humanconnection/nitro-web:latest
