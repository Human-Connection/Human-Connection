# Human-Connection Nitro \| Deployment Configuration

[![Build Status](https://travis-ci.com/Human-Connection/Nitro-Deployment.svg?branch=master)](https://travis-ci.com/Human-Connection/Nitro-Deployment)

Todos:

* [x] check labels and selectors if they all are correct
* [x] configure NGINX from yml
* [x] configure Let's Encrypt cert-manager from yml
* [x] configure ingress from yml
* [x] configure persistent & shared storage between nodes
* [x] reproduce setup locally

## Minikube

There are many Kubernetes distributions, but if you're just getting started, Minikube is a tool that you can use to get your feet wet.

[Install Minikube](https://kubernetes.io/docs/tasks/tools/install-minikube/)

Open minikube dashboard:

```text
$ minikube dashboard
```

This will give you an overview. Some of the steps below need some timing to make ressources available to other dependent deployments. Keeping an eye on the dashboard is a great way to check that.

Follow the [installation instruction](deployment.md#installation-with-kubernetes) below. If all the pods and services have settled and everything looks green in your minikube dashboard, expose the `nitro-web` service on your host system with:

```text
$ minikube service nitro-web --namespace=human-connection
```

## Digital Ocean

1. At first, create a cluster on Digital Ocean.
2. Download the config.yaml if the process has finished.
3. Put the config file where you can find it later \(preferable in your home directory under `~/.kube/`\)
4. In the open terminal you can set the current config for the active session: `export KUBECONFIG=~/.kube/THE-NAME-OF-YOUR-CLUSTER-kubeconfig.yaml`. You could make this change permanent by adding the line to your `.bashrc` or `~/.config/fish/config.fish` depending on your shell.

   Otherwise you would have to always add `--kubeconfig ~/.kube/THE-NAME-OF-YOUR-CLUSTER-kubeconfig.yaml` on every `kubectl` command that you are running.

5. Now check if you can connect to the cluster and if its your newly created one by running: `kubectl get nodes`

If you got the steps right above and see your nodes you can continue.

First, install kubernetes dashboard:

```bash
$ kubectl apply -f dashboard/
$ kubectl apply -f https://raw.githubusercontent.com/kubernetes/dashboard/master/aio/deploy/recommended/kubernetes-dashboard.yaml
```

Get your token on the command line:

```bash
$ kubectl -n kube-system describe secret $(kubectl -n kube-system get secret | grep admin-user | awk '{print $1}')
```

It should print something like:

```text
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

Proxy localhost to the remote kubernetes dashboard:

```bash
$ kubectl proxy
```

Grab the token from above and paste it into the login screen at [http://localhost:8001/api/v1/namespaces/kube-system/services/https:kubernetes-dashboard:/proxy/](http://localhost:8001/api/v1/namespaces/kube-system/services/https:kubernetes-dashboard:/proxy/)

## Installation with kubernetes

You have to do some prerequisites e.g. change some secrets according to your own setup.

### Edit secrets

```bash
$ cp secrets.template.yaml human-connection/secrets.yaml
```

Change all secrets as needed.

If you want to edit secrets, you have to `base64` encode them. See [kubernetes documentation](https://kubernetes.io/docs/concepts/configuration/secret/#creating-a-secret-manually).

```text
# example how to base64 a string:
$ echo -n 'admin' | base64
YWRtaW4=
```

Those secrets get `base64` decoded in a kubernetes pod.

### Create a namespace

```text
$ kubectl apply -f namespace-human-connection.yaml
```

Switch to the namespace `human-connection` in your kubernetes dashboard.

### Run the configuration

```text
$ kubectl apply -f human-connection/
```

This can take a while because kubernetes will download the docker images. Sit back and relax and have a look into your kubernetes dashboard. Wait until all pods turn green and they don't show a warning `Waiting: ContainerCreating` anymore.

#### Setup Ingress and HTTPS

Follow [this quick start guide](https://docs.cert-manager.io/en/latest/tutorials/acme/quick-start/index.html) and install certmanager via helm and tiller:

```text
$ kubectl create serviceaccount tiller --namespace=kube-system
$ kubectl create clusterrolebinding tiller-admin --serviceaccount=kube-system:tiller --clusterrole=cluster-admin
$ helm init --service-account=tiller
$ helm repo update
$ helm install stable/nginx-ingress
$ kubectl apply -f https://raw.githubusercontent.com/jetstack/cert-manager/release-0.6/deploy/manifests/00-crds.yaml
$ helm install --name cert-manager --namespace cert-manager stable/cert-manager
```

Create letsencrypt issuers. _Change the email address_ in these files before running this command.

```bash
$ kubectl apply -f human-connection/https/
```

Create an ingress service in namespace `human-connection`. _Change the domain name_ according to your needs:

```bash
$ kubectl apply -f human-connection/ingress/
```

Check the ingress server is working correctly:

```bash
$ curl -kivL -H 'Host: <DOMAIN_NAME>' 'https://<IP_ADDRESS>'
```

If the response looks good, configure your domain registrar for the new IP address and the domain.

Now let's get a valid HTTPS certificate. According to the tutorial above, check your tls certificate for staging:

```bash
$ kubectl describe --namespace=human-connection certificate tls
$ kubectl describe --namespace=human-connection secret tls
```

If everything looks good, update the issuer of your ingress. Change the annotation `certmanager.k8s.io/issuer` from `letsencrypt-staging` to `letsencrypt-prod` in your ingress configuration in `human-connection/ingress/ingress.yaml`.

```bash
$ kubectl apply -f human-connection/ingress/ingress.yaml
```

Delete the former secret to force a refresh:

```text
$ kubectl  --namespace=human-connection delete secret tls
```

Now, HTTPS should be configured on your domain. Congrats.

#### Legacy data migration

This setup is completely optional and only required if you have data on a server which is running our legacy code and you want to import that data. It will import the uploads folder and migrate a dump of mongodb into neo4j.

**Prepare migration of Human Connection legacy server**

Create a configmap with the specific connection data of your legacy server:

```bash
$ kubectl create configmap db-migration-worker          \
  --namespace=human-connection                          \
  --from-literal=SSH_USERNAME=someuser                  \
  --from-literal=SSH_HOST=yourhost                      \
  --from-literal=MONGODB_USERNAME=hc-api                \
  --from-literal=MONGODB_PASSWORD=secretpassword        \
  --from-literal=MONGODB_AUTH_DB=hc_api                 \
  --from-literal=MONGODB_DATABASE=hc_api                \
  --from-literal=UPLOADS_DIRECTORY=/var/www/api/uploads \
  --from-literal=NEO4J_URI=bolt://localhost:7687
```

Create a secret with your public and private ssh keys. As the [kubernetes documentation](https://kubernetes.io/docs/concepts/configuration/secret/#use-case-pod-with-ssh-keys) points out, you should be careful with your ssh keys. Anyone with access to your cluster will have access to your ssh keys. Better create a new pair with `ssh-keygen` and copy the public key to your legacy server with `ssh-copy-id`:

```bash
$ kubectl create secret generic ssh-keys          \
  --namespace=human-connection                    \
  --from-file=id_rsa=/path/to/.ssh/id_rsa         \
  --from-file=id_rsa.pub=/path/to/.ssh/id_rsa.pub \
  --from-file=known_hosts=/path/to/.ssh/known_hosts
```

**Migrate legacy database**

Patch the existing deployments to use a multi-container setup:

```bash
cd legacy-migration
kubectl apply -f volume-claim-mongo-export.yaml
kubectl patch --namespace=human-connection deployment nitro-backend --patch "$(cat deployment-backend.yaml)"
kubectl patch --namespace=human-connection deployment nitro-neo4j   --patch "$(cat deployment-neo4j.yaml)"
cd ..
```

Run the migration:

```text
$ kubectl --namespace=human-connection get pods
# change <POD_IDs> below
$ kubectl --namespace=human-connection exec -it nitro-neo4j-65bbdb597c-nc2lv migrate
$ kubectl --namespace=human-connection exec -it nitro-backend-c6cc5ff69-8h96z sync_uploads
```

