# Human-Connection Nitro | Deployment Configuration

> Currently the deployment is not primetime ready as you still have to do some manual work. That we need to change, the following list gives some glimpse of the missing steps.

## Todo`s
- [ ] check labels and selectors if they all are correct
- [ ] configure NGINX from yaml
- [ ] configure Let's Encrypt cert-manager from yaml
- [ ] configure ingress form yaml
- [ ] configure persistent & shared storage between nodes
- [ ] reproduce setup locally

> The dummy directory has some lb configurations that did not work properly on Digital Ocean but could be used as a starting point for getting it right

## Install Minikube, kubectl
There are many Kubernetes distributions, but if you're just getting started, Minikube is a tool that you can use to get your feet wet.

[Install Minikube](https://kubernetes.io/docs/tasks/tools/install-minikube/)

## Create a namespace locally
```shell
kubectl create -f namespace-staging.json
```

## Apply the config map to staging namespace
```shell
cd ./staging
kubectl apply -f neo4j-configmap.yaml -f backend-configmap.yaml -f web-configmap.yaml
```

## Setup secrets and deploy themn
```shell
cd ./staging
cp secrets.yaml.template secrets.yaml
# change all vars as needed and deploy it afterwards
kubectl apply -f secrets.yaml
```

## Deploy the app
```shell
cd ./staging
kubectl apply -f neo4j-deployment.yaml -f backend-deployment.yaml -f web-deployment.yaml
```
 