# Human-Connection Nitro \| Deployment Configuration

We deploy with [kubernetes](https://kubernetes.io/). In order to deploy your own
network you have to [install kubectl](https://kubernetes.io/docs/tasks/tools/install-kubectl/)
and get a kubernetes cluster.

We have tested two different kubernetes providers: [Minikube](./minikube/README.md)
and [Digital Ocean](./digital-ocean/README.md).


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
$ kubectl create configmap maintenance-worker          \
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

