#!/usr/bin/env bash

# This script can be called multiple times for each `before_deploy` hook
# so let's exit successfully if kubectl is already installed:
command -v kubectl && exit 0

curl -LO https://storage.googleapis.com/kubernetes-release/release/$(curl -s https://storage.googleapis.com/kubernetes-release/release/stable.txt)/bin/linux/amd64/kubectl
chmod +x ./kubectl
sudo mv ./kubectl /usr/local/bin/kubectl

