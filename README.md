# Human-Connection Nitro | Deployment Configuration

Todos:
- [x] check labels and selectors if they all are correct
- [x] configure NGINX from yml
- [x] configure Let's Encrypt cert-manager from yml
- [x] configure ingress from yml
- [x] configure persistent & shared storage between nodes
- [x] reproduce setup locally

## Minikube
There are many Kubernetes distributions, but if you're just getting started,
Minikube is a tool that you can use to get your feet wet.

[Install Minikube](https://kubernetes.io/docs/tasks/tools/install-minikube/)

Open minikube dashboard:
```
$ minikube dashboard
```
This will give you an overview.
Some of the steps below need some timing to make ressources available to other
dependent deployments. Keeping an eye on the dashboard is a great way to check
that.

Follow the [installation instruction](#installation-with-kubernetes) below.
If all the pods and services have settled and everything looks green in your
minikube dashboard, expose the `nitro-web` service on your host system with:

```shell
$ minikube service nitro-web --namespace=human-connection
```

## Digital Ocean

First, install kubernetes dashboard:
```sh
$ kubectl apply -f dashboard/
$ kubectl apply -f https://raw.githubusercontent.com/kubernetes/dashboard/master/aio/deploy/recommended/kubernetes-dashboard.yaml

```
Proxy localhost to the remote kubernetes dashboard:
```sh
$ kubectl proxy
```
Get your token on the command line:
```sh
$ kubectl -n kube-system describe secret $(kubectl -n kube-system get secret | grep admin-user | awk '{print $1}')
```
It should print something like:
```
Name:         admin-user-token-6gl6l
Namespace:    kube-system
Labels:       <none>
Annotations:  kubernetes.io/service-account.name=admin-user
              kubernetes.io/service-account.uid=b16afba9-dfec-11e7-bbb9-901b0e532516

Type:  kubernetes.io/service-account-token

Data
====
ca.crt:     1025 bytes
namespace:  11 bytes
token:      eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJrdWJlcm5ldGVzL3NlcnZpY2VhY2NvdW50Iiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9uYW1lc3BhY2UiOiJrdWJlLXN5c3RlbSIsImt1YmVybmV0ZXMuaW8vc2VydmljZWFjY291bnQvc2VjcmV0Lm5hbWUiOiJhZG1pbi11c2VyLXRva2VuLTZnbDZsIiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9zZXJ2aWNlLWFjY291bnQubmFtZSI6ImFkbWluLXVzZXIiLCJrdWJlcm5ldGVzLmlvL3NlcnZpY2VhY2NvdW50L3NlcnZpY2UtYWNjb3VudC51aWQiOiJiMTZhZmJhOS1kZmVjLTExZTctYmJiOS05MDFiMGU1MzI1MTYiLCJzdWIiOiJzeXN0ZW06c2VydmljZWFjY291bnQ6a3ViZS1zeXN0ZW06YWRtaW4tdXNlciJ9.M70CU3lbu3PP4OjhFms8PVL5pQKj-jj4RNSLA4YmQfTXpPUuxqXjiTf094_Rzr0fgN_IVX6gC4fiNUL5ynx9KU-lkPfk0HnX8scxfJNzypL039mpGt0bbe1IXKSIRaq_9VW59Xz-yBUhycYcKPO9RM2Qa1Ax29nqNVko4vLn1_1wPqJ6XSq3GYI8anTzV8Fku4jasUwjrws6Cn6_sPEGmL54sq5R4Z5afUtv-mItTmqZZdxnkRqcJLlg2Y8WbCPogErbsaCDJoABQ7ppaqHetwfM_0yMun6ABOQbIwwl8pspJhpplKwyo700OSpvTT9zlBsu-b35lzXGBRHzv5g_RA

```
Grab the token and paste it into the login screen at [http://localhost:8001/api/v1/namespaces/kube-system/services/https:kubernetes-dashboard:/proxy/](http://localhost:8001/api/v1/namespaces/kube-system/services/https:kubernetes-dashboard:/proxy/)


## Installation with kubernetes

You have to do some prerequisites e.g. change some secrets according to your
own setup.

### Edit secrets

```sh
$ cp secrets.template.yaml human-connection/secrets.yaml
```
Change all secrets as needed.

If you want to edit secrets, you have to `base64` encode them. See [kubernetes
documentation](https://kubernetes.io/docs/concepts/configuration/secret/#creating-a-secret-manually).
```shell
# example how to base64 a string:
$ echo -n 'admin' | base64
YWRtaW4=
```
Those secrets get `base64` decoded in a kubernetes pod.

### Create a namespace
```shell
$ kubectl create -f namespace-human-connection.yaml
```
Switch to the namespace `human-connection` in your kubernetes dashboard.


### Run the configuration
```shell
$ kubectl apply -f human-connection/
```

This can take a while because kubernetes will download the docker images.
Sit back and relax and have a look into your kubernetes dashboard.
Wait until all pods turn green and they don't show a warning
`Waiting: ContainerCreating` anymore.

### Setup Loadbalancer and Ingress

Basically follow [this tutorial](https://www.digitalocean.com/community/tutorials/how-to-set-up-an-nginx-ingress-with-cert-manager-on-digitalocean-kubernetes).

tl;dr:
```sh
$ kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/master/deploy/mandatory.yaml
$ kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/master/deploy/provider/cloud-generic.yaml
```
And create an ingress service in namespace `human-connection`:
```sh
# you should change the domain name according to your needs
$ kubectl apply -f human-connection/ingress.yaml
```

#### Setup SSL

Follow [this quick start guide](https://docs.cert-manager.io/en/latest/tutorials/acme/quick-start/index.html)
and install certmanager via helm and tiller:
```
$ kubectl create serviceaccount tiller --namespace=kube-system
$ kubectl create clusterrolebinding tiller-admin --serviceaccount=kube-system:tiller --clusterrole=cluster-admin
$ helm init --service-account=tiller
$ helm repo update
$ helm install stable/nginx-ingress --name quickstart
$ kubectl apply -f https://raw.githubusercontent.com/jetstack/cert-manager/release-0.6/deploy/manifests/00-crds.yaml
$ helm install --name cert-manager --namespace cert-manager stable/cert-manager
```

We provided some configuration in a folder `human-connection/certmanager`. To 
avoid letsencrypt very strict rate limits, the default issuer is
`letsencrypt-staging`. If certmanager is working properly, change it to
`letsencrypt-prod`. Please updated the email address in the configuration, too.

```sh
$ kubectl apply -f human-connection/certmanager/
```

#### Legacy data migration

This setup is completely optional and only required if you have data on a server
which is running our legacy code and you want to import that data. It will
import the uploads folder and migrate a dump of mongodb into neo4j.

##### Prepare migration of Human Connection legacy server
Create a configmap with the specific connection data of your legacy server:
```sh
$ kubectl create configmap db-migration-worker          \
  --namespace=human-connection                          \
  --from-literal=SSH_USERNAME=someuser                  \
  --from-literal=SSH_HOST=yourhost                      \
  --from-literal=MONGODB_USERNAME=hc-api                \
  --from-literal=MONGODB_PASSWORD=secretpassword        \
  --from-literal=MONGODB_AUTH_DB=hc_api                 \
  --from-literal=MONGODB_DATABASE=hc_api                \
  --from-literal=UPLOADS_DIRECTORY=/var/www/api/uploads \
  --from-literal=NEO4J_URI=bolt://neo4j:7687

```
Create a secret with your public and private ssh keys:
```sh
$ kubectl create secret generic ssh-keys          \
  --namespace=human-connection                    \
  --from-file=id_rsa=/path/to/.ssh/id_rsa         \
  --from-file=id_rsa.pub=/path/to/.ssh/id_rsa.pub \
  --from-file=known_hosts=/path/to/.ssh/known_hosts
```
As the [kubernetes documentation](https://kubernetes.io/docs/concepts/configuration/secret/#use-case-pod-with-ssh-keys)
points out, you should be careful with your ssh keys. Anyone with access to your
cluster will have access to your ssh keys. Better create a new pair with
`ssh-keygen` and copy the public key to your legacy server with `ssh-copy-id`.

##### Migrate legacy database
Patch the existing deployments to use a multi-container setup:
```bash
cd legacy-migration
kubectl apply -f volume-claim-mongo-export.yaml
kubectl patch --namespace=human-connection deployment nitro-backend --patch "$(cat deployment-backend.yaml)"
kubectl patch --namespace=human-connection deployment nitro-neo4j   --patch "$(cat deployment-neo4j.yaml)"
cd ..
```

Run the migration:
```shell
$ kubectl --namespace=human-connection get pods
# change <POD_IDs> below
$ kubectl --namespace=human-connection exec -it nitro-neo4j-65bbdb597c-nc2lv migrate
$ kubectl --namespace=human-connection exec -it nitro-backend-c6cc5ff69-8h96z sync_uploads
```
