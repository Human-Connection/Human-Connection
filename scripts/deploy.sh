#!/usr/bin/env bash
sed -i "s/<COMMIT>/${TRAVIS_COMMIT}/g" patch-deployment.yaml
kubectl --namespace=human-connection patch deployment nitro-backend  -p "$(cat $TRAVIS_BUILD_DIR/scripts/patch-deployment.yaml)"
kubectl --namespace=human-connection patch deployment nitro-web  -p "$(cat $TRAVIS_BUILD_DIR/scripts/patch-deployment.yaml)"
