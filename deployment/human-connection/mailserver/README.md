# Development Mail Server

You can deploy a fake smtp server which captures all send mails and displays
them in a web interface. The [sample configuration](../templates/configmap.template.yml)
is assuming such a dummy server in the `SMTP_HOST` configuration and points to
a cluster-internal SMTP server.

To deploy the SMTP server just uncomment the relevant code in the
[ingress server configuration](../../https/templates/ingress.template.yaml) and
run the following:

```bash
# in folder deployment/human-connection
kubectl apply -f mailserver/
```

You might need to refresh the TLS secret to enable HTTPS on the publicly
available web interface.
