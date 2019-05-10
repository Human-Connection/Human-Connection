# Persistent Volumes

At the moment, the application needs two persistent volumes:

* The `/data/` folder where `neo4j` stores its database and
* the folder `/nitro-backend/public/uploads` where the backend stores uploads.

As a matter of precaution, the persistent volume claims that setup these volumes
live in a separate folder. You don't want to accidently loose all your data in
your database by running `kubectl delete -f human-connection/`, do you?

## Create Persistent Volume Claims

Run the following:
```sh
# in folder deployments/
$ kubectl apply -f volumes
persistentvolumeclaim/neo4j-data-claim created
persistentvolumeclaim/uploads-claim created 
```

## Change Reclaim Policy

We recommend to change the `ReclaimPolicy`, so if you delete the persistent
volume claims, the associated volumes will be released, not deleted:

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
