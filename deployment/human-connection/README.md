# Kubernetes Configuration for Human Connection

Deploying Human Connection with kubernetes is straight forward. All you have to
do is to change certain parameters, like domain names and API keys, then you
just apply our provided configuration files to your cluster.

## Configuration

Copy our provided templates:

```bash
$ cp secrets.template.yaml human-connection/secrets.yaml
$ cp configmap.template.yaml human-connection/configmap.yaml
```

Change the `configmap.yaml` as needed, all variables will be available as
environment variables in your deployed kubernetes pods.

If you want to edit secrets, you have to `base64` encode them. See [kubernetes documentation](https://kubernetes.io/docs/concepts/configuration/secret/#creating-a-secret-manually).

```text
# example how to base64 a string:
$ echo -n 'admin' | base64 --wrap 0
YWRtaW4=
```

Those secrets get `base64` decoded and are available as environment variables in
your deployed kubernetes pods.

## Create a namespace

```text
$ kubectl apply -f namespace-human-connection.yaml
```

If you have a [kubernets dashboard](../digital-ocean/dashboard/README.md)
deployed you should switch to namespace `human-connection` in order to
monitor the state of your deployments.

## Apply the configuration

```text
# in folder deployment/ 
$ kubectl apply -f human-connection/
```

This can take a while because kubernetes will download the docker images. Sit
back and relax and have a look into your kubernetes dashboard. Wait until all
pods turn green and they don't show a warning `Waiting: ContainerCreating`
anymore.
