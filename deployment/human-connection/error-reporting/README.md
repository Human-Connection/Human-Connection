# Error reporting

We use [Sentry](https://github.com/getsentry/sentry) for error reporting in both
our backend and web frontend. You can either use a hosted or a self-hosted
instance. Just set the two `DSN` in your
[configmap](../templates/configmap.template.yaml) and update the `COMMIT`
during a deployment with your commit or the version of your release.

## Self-hosted Sentry

For data privacy it is recommended to set up your own instance of sentry. 
If you are lucky enough to have a kubernetes cluster with the required hardware
support, try this [helm chart](https://github.com/helm/charts/tree/master/stable/sentry).

On our kubernetes cluster we get "mult-attach" errors for persistent volumes.
Apparently Digital Ocean's kubernetes clusters do not fulfill the requirements.
