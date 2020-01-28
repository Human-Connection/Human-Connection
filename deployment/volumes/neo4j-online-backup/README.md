# Backup (online)

## Online backups are only avaible with a Neo4j Enterprise and a license, see https://neo4j.com/licensing/ for the different licenses available

This tutorial explains how to carry out an online backup of your Neo4J
database in a kubernetes cluster.

One of the benefits of doing an online backup is that the Neo4j database does not need to be stopped, so there is no downtime. Read [the docs](https://neo4j.com/docs/operations-manual/current/backup/performing/)

To use Neo4j Enterprise you must add this line to your configmap, if using, or your deployment `nitro-neo4j` env.

```
NEO4J_ACCEPT_LICENSE_AGREEMENT: "yes"
```
## Create a Backup in Kubernetes

```sh
# Backup the database with one command, this will get the nitro-neo4j pod, ssh into it, and run the backup command
kubectl -n=human-connection exec -it $(kubectl -n=human-connection get pods | grep nitro-neo4j | awk '{ print $1 }') -- neo4j-admin backup --backup-dir=/var/lib/neo4j --name=neo4j-backup
# Download the file from the pod to your computer.
kubectl cp human-connection/$(kubectl -n=human-connection get pods | grep nitro-neo4j | awk '{ print $1 }'):/var/lib/neo4j/neo4j-backup ./neo4j-backup/
```

You should now have a backup of the database locally. If you want, you can simulate disaster recovery by sshing into the nitro-neo4j pod, deleting all data and restoring from backup

## Disaster where database data is gone somehow

```sh
kubectl -n=human-connection exec -it $(kubectl -n=human-connection get pods | grep nitro-neo4j |awk '{ print $1 }') bash
# Enter cypher-shell
cypher-shell
# Delete all data
> MATCH (n) DETACH DELETE (n);

exit
```

## Restore a backup in Kubernetes 

Restoration must be done while the database is not running, see [our docs](https://docs.human-connection.org/human-connection/deployment/volumes/neo4j-offline-backup#stop-and-restart-neo-4-j-database-in-kubernetes) for how to stop the database, but keep the container running

After, you have stopped the database, and have the pod running, you can restore the database by running these commands:

```sh
kubectl --namespace=human-connection get pods
# Copy the ID of the pod running Neo4J.
# Then upload your local backup to the pod. Note that once the pod gets deleted
# e.g. if you change the deployment, the backup file is gone with it.
kubectl cp ./neo4j-backup/ human-connection/<POD-ID>:/root/
kubectl --namespace=human-connection exec -it <POD-ID> bash
# Once you're in the pod restore the backup and overwrite the default database
# called `graph.db` with `--force`.
# This will delete all existing data in database `graph.db`!
neo4j-admin restore --from=/root/neo4j-backup --force
exit
```
Revert your changes to deployment `nitro-neo4j` which will restart the database.