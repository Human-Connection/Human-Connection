# Change Reclaim Policy

We recommend to change the `ReclaimPolicy`, so if you delete the persistent
volume claims, the associated volumes will be released, not deleted.

This procedure is optional and an additional security measure. It might prevent
you from loosing data if you accidently delete the namespace and the persistent
volumes along with it.

```sh
$ kubectl --namespace=human-connection get pv

NAME                                       CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS   CLAIM                               STORAGECLASS       REASON   AGE
pvc-bd02a715-66d0-11e9-be52-ba9c337f4551   1Gi        RWO            Delete           Bound    human-connection/neo4j-data-claim   do-block-storage            4m24s
pvc-bd208086-66d0-11e9-be52-ba9c337f4551   2Gi        RWO            Delete           Bound    human-connection/uploads-claim      do-block-storage            4m12s
```

Get the volume id from above, then change `ReclaimPolicy` with:
```sh
kubectl patch pv <VOLUME-ID> -p '{"spec":{"persistentVolumeReclaimPolicy":"Retain"}}'

# in the above example
kubectl patch pv pvc-bd02a715-66d0-11e9-be52-ba9c337f4551 -p '{"spec":{"persistentVolumeReclaimPolicy":"Retain"}}'
kubectl patch pv pvc-bd208086-66d0-11e9-be52-ba9c337f4551 -p '{"spec":{"persistentVolumeReclaimPolicy":"Retain"}}'
```

Given that you changed the reclaim policy as described above, you should be able
to create a persistent volume claim based on a volume snapshot content. See
the general kubernetes documentation [here](https://kubernetes.io/blog/2018/10/09/introducing-volume-snapshot-alpha-for-kubernetes/)
and our specific documentation for snapshots [here](../snapshot/README.md).
