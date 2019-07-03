# Installation

The repository can be found on GitHub. [https://github.com/Human-Connection/Human-Connection](https://github.com/Human-Connection/Human-Connection)

We give write permissions to every developer who asks for it. Just text us on
[Discord](https://discord.gg/6ub73U3).

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
* [Backend](./backend) runs on the server and is a middleware between database and frontend
* [Frontend](./webapp) is a server-side-rendered and client-side-rendered web frontend
* [Deployment](./deployment) configuration for kubernetes
* [Cypress](./cypress) contains end-to-end tests and executable feature specifications

In order to setup the application and start to develop features you have to
setup **frontend** and **backend**.

There are two approaches:

1. Local installation, which means you have to take care of dependencies yourself
2. **Or** Install everything through docker which takes care of dependencies for you

## Docker Installation

Docker is a software development container tool that combines software and its dependencies into one standardized unit that contains everything needed to run it. This helps us to avoid problems with dependencies and makes installation easier.

### General Installation of Docker

There are [sevaral ways to install Docker CE](https://docs.docker.com/install/) on your computer or server.

{% tabs %}
{% tab title="Docker Desktop macOS" %}
Follow these instructions to [install Docker Desktop on macOS](https://docs.docker.com/docker-for-mac/install/).
{% endtab %}

{% tab title="Docker Desktop Windows" %}
Follow these instructions to [install Docker Desktop on Windows](https://docs.docker.com/docker-for-windows/install/).
{% endtab %}

{% tab title="Docker CE" %}
Follow these instructions to [install Docker CE](https://docs.docker.com/install/).

This is a great option for Linux users.
{% endtab %}
{% endtabs %}

Check the correct Docker installation by checking the version before proceeding. E.g. we have the following versions:

```bash
$ docker --version
Docker version 18.09.2
$ docker-compose --version
docker-compose version 1.23.2
```


