#!/usr/bin/env bash

DIR=$(dirname "$0")
if [[ -z "${TRAVIS_COMMIT}" ]]; then
  COMMIT=$(git rev-parse HEAD) # hopefully we're in the project folder
else
  COMMIT="${TRAVIS_COMMIT}"
fi

sed "s/<COMMIT>/${COMMIT}/g" $DIR/patches/patch-deployment.yaml > $DIR/deployed/deployment.yaml
sed "s/<COMMIT>/${COMMIT}/g" $DIR/patches/patch-configmap.yaml > $DIR/deployed/configmap.yaml
kubectl --namespace=human-connection patch configmap configmap  -p "$(cat $DIR/deployed/configmap.yaml)"
kubectl --namespace=human-connection patch deployment nitro-backend  -p "$(cat $DIR/deployed/deployment.yaml)"
kubectl --namespace=human-connection patch deployment nitro-web  -p "$(cat $DIR/deployed/deployment.yaml)"
