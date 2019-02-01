# Human-Connection Nitro | Deployment Configuration

> Currently the deployment is not primetime ready as you still have to do some manual work. That we need to change, the following list gives some glimpse of the missing steps.

## Todo`s
- [ ] check labels and selectors if they all are correct
- [ ] configure NGINX from yml
- [ ] configure Let's Encrypt cert-manager from yml
- [ ] configure ingress form yml
- [ ] configure persistent & shared storage between nodes
- [ ] reproduce setup locally

> The dummy directory has some lb configurations that did not work properly on Digital Ocean but could be used as a starting point for getting it right

## Install Minikube, kubectl
There are many Kubernetes distributions, but if you're just getting started, Minikube is a tool that you can use to get your feet wet.

[Install Minikube](https://kubernetes.io/docs/tasks/tools/install-minikube/)

# Open minikube dashboard
```
$ minikube dashboard
```
This will give you an overview.
Some of the steps below need some timing to make ressources available to other
dependent deployments. Keeping an eye on the dashboard is a great way to check
that.

## Create a namespace locally
```shell
$ kubectl create -f namespace-staging.yml
```
Switch to the namespace `staging` in your kubernetes dashboard.

## Setup config maps
```shell
$ cp db-migration-worker.template.yml config/db-migration-worker.yml
# edit all variables according to the setup of the remote legacy server

$ kubectl apply -f config/
```

## Setup secrets and deploy themn
If you want to edit secrets, you have to `base64` encode them. See [kubernetes
documentation](https://kubernetes.io/docs/concepts/configuration/secret/#creating-a-secret-manually).
```shell
# example how to base64 a string:
$ echo -n 'admin' | base64
YWRtaW4=

$ cp secrets.yml.template secrets.yml
# change all variables as needed and deploy them
$ kubectl apply -f secrets.yml
```

## Create volumes 
```shell
$ kubectl apply -f volumes/
```

## Expose the services

```shell
$ kubectl apply -f services/
```
Wait until persistent volumes and services become available.

## Create deployments
```shell
$ kubectl apply -f deployments/
```
This can take a while because kubernetes will download the docker images.
Sit back and relax and have a look into your kubernetes dashboard.
Wait until all pods turn green and they don't show a warning
`Waiting: ContainerCreating` anymore.


## Access the services

```shell
$ minikube service nitro-web --namespace=staging
```


## Provision db-migration-worker
Copy your private ssh key and the `.known-hosts` file of your remote legacy server.
```shell

# check the corresponding db-migration-worker pod
$ kubectl --namespace=staging get pods
# change <POD_ID> below
$ kubectl cp path/to/your/ssh/keys/.ssh staging/nitro-db-migration-worker-<POD_ID>:/root/
```

Run the migration:
```shell
# change <POD_IDs> below
$ kubectl --namespace=staging exec -it nitro-db-migration-worker-<POD_ID> ./import.sh
$ kubectl --namespace=staging exec -it nitro-neo4j-<POD_ID>               ./import/import.sh
```
