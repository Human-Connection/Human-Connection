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


## Apply the config map to staging namespace
```shell
cd ./staging
kubectl apply -f configmap-neo4j.yaml -f configmap-backend.yaml -f configmap-web.yaml
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
kubectl apply -f deployment-neo4j.yaml -f deployment-backend.yaml -f deployment-web.yaml
```
