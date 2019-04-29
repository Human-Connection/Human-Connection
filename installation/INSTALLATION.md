# Installation

The repository can be found on GitHub. [https://github.com/Human-Connection/Human-Connection](https://github.com/Human-Connection/Human-Connection)

We give write permissions to every developer who asks for it. Just text us on [Discord](https://discord.gg/6ub73U3).

## Clone the Repository

Clone the repository, this will create a new folder called `Human-Connection`:

{% tabs %}
{% tab title="HTTPS" %}
```bash
$ git clone https://github.com/Human-Connection/Human-Connection.git
```
{% endtab %}

{% tab title="SSH" %}
```bash
$ git clone git@github.com:Human-Connection/Human-Connection.git
```
{% endtab %}
{% endtabs %}

Change into the new folder.

```bash
$ cd Human-Connection
```

## Directory Layout

There are four important directories:

* [Backend](../backend/) runs on the server and is a middleware between database and frontend
* [Frontend](../webapp/) is a server-side-rendered and client-side-rendered web frontend
* [Deployment](../deployment.md) configuration for kubernetes
* [Cypress](../testing/cypress.md) contains end-to-end tests and executable feature specifications

In order to setup the application and start to develop features you have to setup the **Webapp** \(frontend\) and **Backend**.

There are two approaches:

1. Local installation, which means you have to take care of dependencies yourself
2. **Or** Install everything through docker which takes care of dependencies for you

