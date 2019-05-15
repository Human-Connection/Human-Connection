# Kubernetes Configuration for Human Connection

Deploying Human Connection with kubernetes is straight forward. All you have to
do is to change certain parameters, like domain names and API keys, then you
just apply our provided configuration files to your cluster.

## Configuration

Copy our provided templates:

```bash
# in folder deployment/human-connection/
$ cp templates/secrets.template.yaml ./secrets.yaml
$ cp templates/configmap.template.yaml ./configmap.yaml
```

Change the `configmap.yaml` as needed, all variables will be available as
environment variables in your deployed kubernetes pods.

Probably you want to change this environment variable to your actual domain:

```
# in configmap.yaml
CLIENT_URI: "https://nitro-staging.human-connection.org"
```

If you want to edit secrets, you have to `base64` encode them. See [kubernetes documentation](https://kubernetes.io/docs/concepts/configuration/secret/#creating-a-secret-manually).

```bash
# example how to base64 a string:
$ echo -n 'admin' | base64 --wrap 0
YWRtaW4=
```

Those secrets get `base64` decoded and are available as environment variables in
your deployed kubernetes pods.

## Create a namespace

```bash
# in folder deployment/human-connection/
$ kubectl apply -f namespace.yaml
```

If you have a [kubernets dashboard](../digital-ocean/dashboard/README.md)
deployed you should switch to namespace `human-connection` in order to
monitor the state of your deployments.

## Create persistent volumes

While the deployments and services can easily be restored, simply by deleting
and applying the kubernetes configurations again, certain data is not that
easily recovered. Therefore we separated persistent volumes from deployments
and services. There is a [dedicated section](../volumes/README.md). Create those
persistent volumes once before you apply the configuration.

## Apply the configuration

```bash
# in folder deployment/
$ kubectl apply -f human-connection/
```

This can take a while because kubernetes will download the docker images. Sit
back and relax and have a look into your kubernetes dashboard. Wait until all
pods turn green and they don't show a warning `Waiting: ContainerCreating`
anymore.
