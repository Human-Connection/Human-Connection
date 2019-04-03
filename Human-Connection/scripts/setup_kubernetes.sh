#!/usr/bin/env bash

# This script can be called multiple times for each `before_deploy` hook
# so let's exit successfully if kubectl is already installed:
command -v kubectl && exit 0


openssl aes-256-cbc -K $encrypted_44f54ef0bc46_key -iv $encrypted_44f54ef0bc46_iv -in kubeconfig.yaml.enc -out kubeconfig.yaml -d
mkdir ${HOME}/.kube
cp kubeconfig.yaml ${HOME}/.kube/config

curl -LO https://storage.googleapis.com/kubernetes-release/release/$(curl -s https://storage.googleapis.com/kubernetes-release/release/stable.txt)/bin/linux/amd64/kubectl
chmod +x ./kubectl
sudo mv ./kubectl /usr/local/bin/kubectl

