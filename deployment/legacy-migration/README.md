# Legacy data migration

This setup is **completely optional** and only required if you have data on a
server which is running our legacy code and you want to import that data. It
will import the uploads folder and migrate a dump of the legacy Mongo database
into our new Neo4J graph database.

## Configure Maintenance-Worker Pod

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
  --from-literal=UPLOADS_DIRECTORY=/var/www/api/uploads
```

Create a secret with your public and private ssh keys. As the [kubernetes documentation](https://kubernetes.io/docs/concepts/configuration/secret/#use-case-pod-with-ssh-keys) points out, you should be careful with your ssh keys. Anyone with access to your cluster will have access to your ssh keys. Better create a new pair with `ssh-keygen` and copy the public key to your legacy server with `ssh-copy-id`:

```bash
$ kubectl create secret generic ssh-keys          \
  --namespace=human-connection                    \
  --from-file=id_rsa=/path/to/.ssh/id_rsa         \
  --from-file=id_rsa.pub=/path/to/.ssh/id_rsa.pub \
  --from-file=known_hosts=/path/to/.ssh/known_hosts
```

## Deploy a Temporary Maintenance-Worker Pod

Bring the application into maintenance mode.

{% hint style="info" %} TODO: implement maintenance mode {% endhint %}


Then temporarily delete backend and database deployments

```bash
$ kubectl --namespace=human-connection get deployments
NAME            READY   UP-TO-DATE   AVAILABLE   AGE
nitro-backend   1/1     1            1           3d11h
nitro-neo4j     1/1     1            1           3d11h
nitro-web       2/2     2            2           73d
$ kubectl --namespace=human-connection delete deployment nitro-neo4j
deployment.extensions "nitro-neo4j" deleted
$ kubectl --namespace=human-connection delete deployment nitro-backend
deployment.extensions "nitro-backend" deleted
```

Deploy one-time maintenance-worker pod:

```bash
# in deployment/legacy-migration/
$ kubectl apply -f maintenance-worker.yaml
pod/nitro-maintenance-worker created
```

Import legacy database and uploads:

```bash
$ kubectl --namespace=human-connection exec -it nitro-maintenance-worker bash
$ import_legacy_db
$ import_uploads
$ exit
```

Delete the pod when you're done:

```bash
$ kubectl --namespace=human-connection delete pod nitro-maintenance-worker
```

Oh, and of course you have to get those deleted deployments back. One way of
doing it would be:

```bash
# in folder deployment/
$ kubectl apply -f human-connection/deployment-backend.yaml -f human-connection/deployment-neo4j.yaml
```

