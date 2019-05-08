# Velero

We use [velero](https://github.com/heptio/velero) for on premise backups, we
tested on version `v0.11.0`, you can find their
documentation [here](https://heptio.github.io/velero/v0.11.0/).

Our kubernets configurations adds some annotations to pods. The annotations
define the important persistent volumes that need to be backed up. Velero will
pick them up and store the volumes in the same cluster but in another namespace
`velero`.

## Prequisites

You have to install the binary `velero` on your computer and get a tarball of
the latest release. We use `v0.11.0` so visit the
[release](https://github.com/heptio/velero/releases/tag/v0.11.0) page and
download and extract e.g. [velero-v0.11.0-linux-arm64.tar.gz](https://github.com/heptio/velero/releases/download/v0.11.0/velero-v0.11.0-linux-amd64.tar.gz).


## Setup Velero Namespace

Follow their [getting started](https://heptio.github.io/velero/v0.11.0/get-started)
instructions to setup the Velero namespace:

```sh
$ kubectl apply -f config/common/00-prereqs.yaml
$ kubectl apply -f config/minio/
```

Once completed, you should see the namespace in your kubernetes dashboard.

We use [Minio](https://docs.min.io/docs/deploy-minio-on-kubernetes) and
[restic](https://github.com/restic/restic), so check out Velero's instructions
how to setup [restic](https://heptio.github.io/velero/v0.11.0/restic):

```sh
$ kubectl apply -f config/minio/30-restic-daemonset.yaml
```

## Manually Create an On-Premise Backup

When you create your deployments for Human Connection the required annotations
should already be in place. So when you create a backup of namespace
`human-connection`:


```sh
$ velero backup create hc-backup --include-namespaces=human-connection
```

That should backup your persistent volumes, too. When you enter:

```
$ velero backup describe hc-backup --details
```

You should see the persistent volumes at the end of the log:

```
....

Restic Backups:
  Completed:
    human-connection/nitro-neo4j-7f5cf458db-n92pg: neo4j-data
```

## Simulate a Disaster

Feel free to try out if you loose any data when you simulate a disaster and try
to restore the namespace from the backup:

```sh
$ kubectl delete namespace human-connection
```

Wait until the wrongdoing has completed, then:
```sh
$ velero restore create --from-backup hc-backup
```

Now, I keep my fingers crossed that everything comes back again. If not, I feel
very sorry for you.

