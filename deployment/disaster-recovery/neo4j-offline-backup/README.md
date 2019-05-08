# Backup (offline)

This tutorial explains how to carry out an offline backup of your Neo4J
database in a kubernetes cluster.

An offline backup requires the Neo4J database to be stopped. Read
[the docs](https://neo4j.com/docs/operations-manual/current/tools/dump-load/).
Neo4J also offers online backups but this is available in enterprise edition
only.

The tricky part is to stop the Neo4J database *without* stopping the container.
Neo4J's docker container image starts `neo4j` by default, so we have to override
this command with sth. that keeps the container spinning but does not terminate
it.

## Stop and Restart Neo4J Database in Kubernetes

[This tutorial](http://bigdatums.net/2017/11/07/how-to-keep-docker-containers-running/)
explains how to keep a docker container running. For kubernetes, the way to
override the docker image `CMD` is explained [here](https://kubernetes.io/docs/tasks/inject-data-application/define-command-argument-container/#define-a-command-and-arguments-when-you-create-a-pod).

So, all we have to do is edit the kubernetes deployment of our Neo4J database
and set a custom `command` every time we have to carry out tasks like backup,
restore, seed etc.

{% hint style="info" %} TODO: implement maintenance mode {% endhint %}
First bring the application into maintenance mode to ensure there are no
database connections left and nobody can access the application.

Run the following:

```sh
kubectl --namespace=human-connection edit deployment nitro-neo4j
```

Add the following to `spec.template.spec.containers`:
```
["tail", "-f", "/dev/null"]
```
and write the file which will update the deployment.

The command `tail -f /dev/null` is the equivalent of *sleep forever*. It is a
hack to keep the container busy and to prevent its shutdown. It will also
override the default `neo4j` command and the kubernetes pod will not start the
database.

Now perform your tasks!

When you're done, edit the deployment again and remove the `command`. Write the
file and trigger an update of the deployment.

## Create a Backup in Kubernetes

First stop your Neo4J database, see above. Then:
```sh
kubectl --namespace=human-connection get pods
# Copy the ID of the pod running Neo4J.
kubectl --namespace=human-connection exec -it <POD-ID> bash
# Once you're in the pod, dump the db to a file e.g. `/root/neo4j-backup`.
neo4j-admin dump --to=/root/neo4j-backup
exit
# Download the file from the pod to your computer.
 kubectl cp human-connection/<POD-ID>:/root/neo4j-backup ./neo4j-backup
```
Revert your changes to deployment `nitro-neo4j` which will restart the database.

## Restore a Backup in Kubernetes

First stop your Neo4J database. Then:
```sh
kubectl --namespace=human-connection get pods
# Copy the ID of the pod running Neo4J.
# Then upload your local backup to the pod. Note that once the pod gets deleted
# e.g. if you change the deployment, the backup file is gone with it.
kubectl cp ./neo4j-backup human-connection/<POD-ID>:/root/
kubectl --namespace=human-connection exec -it <POD-ID> bash
# Once you're in the pod restore the backup and overwrite the default database
# called `graph.db` with `--force`.
# This will delete all existing data in database `graph.db`!
neo4j-admin load --from=/root/neo4j-backup --force
exit
```
Revert your changes to deployment `nitro-neo4j` which will restart the database.
