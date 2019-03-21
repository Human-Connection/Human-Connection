#!/usr/bin/env bash
sed -i "s/<COMMIT>/${TRAVIS_COMMIT}/g" patch-deployment.yaml
kubectl --namespace=human-connection patch deployment nitro-backend  -p "$(cat patch-deployment.yaml)"
kubectl --namespace=human-connection patch deployment nitro-web  -p "$(cat patch-deployment.yaml)"
