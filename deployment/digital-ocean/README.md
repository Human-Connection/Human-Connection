# Digital Ocean

As a start, read the [introduction into kubernetes](https://www.digitalocean.com/community/tutorials/an-introduction-to-kubernetes) by the folks at Digital Ocean. The following section should enable you to deploy Human Connection to your kubernetes cluster.

## Connect to your local cluster

1. Create a cluster at [Digital Ocean](https://www.digitalocean.com/).
2. Download the `***-kubeconfig.yaml` from the Web UI.
3. Move the file to the default location where kubectl expects it to be: `mv ***-kubeconfig.yaml ~/.kube/config`. Alternatively you can set the config on every command: `--kubeconfig ***-kubeconfig.yaml`
4. Now check if you can connect to the cluster and if its your newly created one by running: `kubectl get nodes`

The output should look about like this:
```
$ kubectl get nodes
NAME                  STATUS   ROLES    AGE   VERSION
nifty-driscoll-uu1w   Ready    <none>   69d   v1.13.2
nifty-driscoll-uuiw   Ready    <none>   69d   v1.13.2
nifty-driscoll-uusn   Ready    <none>   69d   v1.13.2
```

If you got the steps right above and see your nodes you can continue.

Digital Ocean kubernetes clusters don't have a graphical interface, so I suggest
to setup the [kubernetes dashboard](./dashboard/README.md) as a next step.
Configuring [HTTPS](./https/README.md) is bit tricky and therefore I suggest to
do this as a last step.

## Spaces

We are storing our images in the s3-compatible [DigitalOcean Spaces](https://www.digitalocean.com/docs/spaces/). 

We still want to take backups of our images in case something happens to the images in the cloud. See these [instructions](https://www.digitalocean.com/docs/spaces/resources/s3cmd-usage/) about getting set up with `s3cmd` to take a copy of all images in a `Spaces` namespace, ie `human-connection-uploads`.

After configuring `s3cmd` with your credentials, etc. you should be able to make a backup with this command.

```sh
s3cmg get --recursive s3://human-connection-uploads --skip-existing
```