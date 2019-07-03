# Persistent Volumes

At the moment, the application needs two persistent volumes:

* The `/data/` folder where `neo4j` stores its database and
* the folder `/nitro-backend/public/uploads` where the backend stores uploads.

As a matter of precaution, the persistent volume claims that setup these volumes
live in a separate folder. You don't want to accidently loose all your data in
your database by running

```sh
kubectl delete -f human-connection/
```

or do you?

## Create Persistent Volume Claims

Run the following:
```sh
# in folder deployments/
$ kubectl apply -f volumes
persistentvolumeclaim/neo4j-data-claim created
persistentvolumeclaim/uploads-claim created 
```

## Backup and Restore

We tested a couple of options how to do disaster recovery in kubernetes. First,
there is the [offline backup strategy](./neo4j-offline-backup/README.md) of the
community edition of Neo4J, which you can also run on a local installation.
Kubernetes also offers so-called [volume snapshots](./volume-snapshots/README.md).
Changing the [reclaim policy](./reclaim-policy/README.md) of your persistent
volumes might be an additional safety measure. Finally, there is also a
kubernetes specific disaster recovery tool called [Velero](./velero/README.md).
