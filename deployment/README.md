# Human-Connection Nitro \| Deployment Configuration

We deploy with [kubernetes](https://kubernetes.io/). In order to deploy your own
network you have to [install kubectl](https://kubernetes.io/docs/tasks/tools/install-kubectl/)
and get a kubernetes cluster.

We have tested two different kubernetes providers: [Minikube](./minikube/README.md)
and [Digital Ocean](./digital-ocean/README.md).


## Installation with kubernetes

You have to do some prerequisites e.g. change some secrets according to your own setup.

### Edit secrets

```bash
$ cp secrets.template.yaml human-connection/secrets.yaml
```

Change all secrets as needed.

If you want to edit secrets, you have to `base64` encode them. See [kubernetes documentation](https://kubernetes.io/docs/concepts/configuration/secret/#creating-a-secret-manually).

```text
# example how to base64 a string:
$ echo -n 'admin' | base64
YWRtaW4=
```

Those secrets get `base64` decoded in a kubernetes pod.

### Create a namespace

```text
$ kubectl apply -f namespace-human-connection.yaml
```

Switch to the namespace `human-connection` in your kubernetes dashboard.

### Run the configuration

```text
$ kubectl apply -f human-connection/
```

This can take a while because kubernetes will download the docker images. Sit back and relax and have a look into your kubernetes dashboard. Wait until all pods turn green and they don't show a warning `Waiting: ContainerCreating` anymore.
