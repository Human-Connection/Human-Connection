# Docker Installation

Docker is a software development container tool that combines software and its dependencies into one standardized unit that contains everything needed to run it. This helps us to avoid problems with dependencies and makes installation easier.

## General Installation of Docker

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

## Install with Docker

Run the following command to install everything through docker.

The installation takes a bit longer on the first pass or on rebuild ...

```bash
# in Human-Connection folder

$ docker-compose up

# rebuild the containers for a cleanup
$ docker-compose up --build

# remove volumes – containers (wipe out Neo4j database) – for a clean rebuild 
$ docker-compose down -v
```

To setup the Backend and play with the Neo4j database or open the Webapp in the browser, see the next sections.

