# Minikube

There are many Kubernetes providers, but if you're just getting started, Minikube is a tool that you can use to get your feet wet.

After you [installed Minikube](https://kubernetes.io/docs/tasks/tools/install-minikube/)
open your minikube dashboard:

```text
$ minikube dashboard
```

This will give you an overview. Some of the steps below need some timing to make ressources available to other dependent deployments. Keeping an eye on the dashboard is a great way to check that.

Follow the installation instruction for [Human Connection](../human-connection/README.md).
If all the pods and services have settled and everything looks green in your
minikube dashboard, expose the services you want on your host system.

For example:

```text
$ minikube service nitro-web --namespace=human-connection
# optionally
$ minikube service nitro-backend --namespace=human-connection
```

