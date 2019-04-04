#!/usr/bin/env bash

# This script can be called multiple times for each `before_deploy` hook
# so let's exit successfully if kubectl is already installed:
command -v kubectl && exit 0

curl -LO https://storage.googleapis.com/kubernetes-release/release/$(curl -s https://storage.googleapis.com/kubernetes-release/release/stable.txt)/bin/linux/amd64/kubectl
chmod +x ./kubectl
sudo mv ./kubectl /usr/local/bin/kubectl

curl -LO https://github.com/digitalocean/doctl/releases/download/v1.14.0/doctl-1.14.0-linux-amd64.tar.gz
tar xf doctl-1.14.0-linux-amd64.tar.gz
chmod +x ./doctl
sudo mv ./doctl /usr/local/bin/doctl

doctl auth init --access-token $DOCTL_ACCESS_TOKEN
mkdir -p ~/.kube/
doctl kubernetes cluster kubeconfig show nitro-staging > ~/.kube/config.yaml
