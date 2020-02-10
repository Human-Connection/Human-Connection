# Helm installation of Human Connection

Deploying Human Connection with Helm is very straight forward. All you have to
do is to change certain parameters, like domain names and API keys, then you
just install our provided Helm chart to your cluster.

## Configuration

You can customize the network with your configuration by changing the `values.yaml`, all variables will be available as
environment variables in your deployed kubernetes pods.

Probably you want to change this environment variable to your actual domain:

```bash
# in folder /deployment/helm
CLIENT_URI: "https://develop.human-connection.org"
```

If you want to edit secrets, you have to `base64` encode them. See [kubernetes documentation](https://kubernetes.io/docs/concepts/configuration/secret/#creating-a-secret-manually). You can also use `helm-secrets`, but we have yet to test it.

```bash
# example how to base64 a string:
$ echo -n 'admin' | base64
YWRtaW4=
```
Those secrets get `base64` decoded and are available as environment variables in
your deployed kubernetes pods.

# https
If you start with setting up the `https`, when you install the app, it will automatically take care of the certificates for you.

First check that you are using `Helm v3`, this is important since it removes the need for `Tiller`. See, [FAQ](https://helm.sh/docs/faq/#removal-of-tiller)

```bash
$ helm version
# output should look similar to this:
#version.BuildInfo{Version:"v3.0.2", GitCommit:"19e47ee3283ae98139d98460de796c1be1e3975f", GitTreeState:"clean", GoVersion:"go1.13.5"}
```

Apply cert-manager CRDs before installing (or it will fail)

```bash
$ kubectl apply --validate=false -f https://raw.githubusercontent.com/jetstack/cert-manager/release-0.13.0/deploy/manifests/00-crds.yaml
```

Next, create the `cert-manager` namespace
```bash
$ kubectl create namespace cert-manager
```
Add the `jetstack` repo and update

```bash
$ helm repo add jetstack https://charts.jetstack.io
$ helm repo update
```

Install cert-manager
```bash
$ helm install cert-manager --namespace cert-manager --version v0.13.0 jetstack/cert-manager
```

# Deploy

Once you are satisfied with the configuration, you can install the app.

```bash
# in folder /deployment/helm/human-connection
$ helm install develop ./ --namespace human-connection
```
Where `develop` is the release name, in this case develop for our develop server and `human-connection` is the namespace, again customize for your needs. The release name can be anything you want. Just keep in mind that it is used in the templates to prepend the `CLIENT_URI` and other places.

This will set up everything you need for the network, including `deployments`, and their `pods`, `services`, `ingress`, `volumes`(PersitentVolumes), `PersistentVolumeClaims`, and even `ClusterIssuers` for https certificates.
