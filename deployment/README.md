# Human-Connection Nitro \| Deployment Configuration

There are a couple different ways we have tested to deploy an instance of Human Connection, with [kubernetes](https://kubernetes.io/) and via [Helm](https://helm.sh/docs/). In order to manage your own
network, you have to [install kubectl](https://kubernetes.io/docs/tasks/tools/install-kubectl/), [install Helm](https://helm.sh/docs/intro/install/) (optional, but the preferred way),
and set up a kubernetes cluster. Since there are many different options to host your cluster, we won't go into specifics here.

We have tested two different kubernetes providers: [Minikube](./minikube/README.md)
and [Digital Ocean](./digital-ocean/README.md).

Check out the specific documentation for your provider. After that, choose whether you want to go with the recommended deploy option [Helm](./helm/README.md), or use kubernetes to apply the configuration for [Human Connection](./human-connection/README.md).
