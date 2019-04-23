# Legacy data migration

This setup is **completely optional** and only required if you have data on a
server which is running our legacy code and you want to import that data. It
will import the uploads folder and migrate a dump of the legacy Mongo database
into our new Neo4J graph database.

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

