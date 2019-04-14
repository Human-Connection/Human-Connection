# Installation

## General Install Instructions

The repository can be found on GitHub. [https://github.com/Human-Connection/Human-Connection](https://github.com/Human-Connection/Human-Connection)

{% hint style="info" %}
TODO: Create documentation section for How to Start and Beginners.
{% endhint %}

We give write permissions to every developer who asks for it. Just text us on
[Discord](https://discord.gg/6ub73U3).

#### Clone the Repository

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

### Installation with Docker

Run the following command to install Nitro as a Docker container. This installation includes Neo4j.

The installation takes a bit longer on the first pass or on rebuild ...

```bash
$ docker-compose up

# rebuild the containers for a cleanup
$ docker-compose up --build
```

#### Seed Database

To seed the Neo4j database with default data, that GraphQL requests or playing with our GraphQL Playground returns anything else than an empty response, run the command.

Run the following command to seed the Neo4j database with default data requested by Nitro-Web through GraphQL or when you play with our GraphQL playground.

```bash
# open another terminal

# create indices etc.
$ docker-compose exec neo4j migrate

# seed database
$ docker-compose exec backend yarn run db:seed
```

**Wipe out Neo4j database in Docker**

To wipe out your neo4j database and delete the volumes send command:

```bash
# open another terminal and run
$ docker-compose down -v
```

**Video Tutorial**

{% hint style="info" %}
TODO: Link to video
{% endhint %}

## Local Installation

#### Install the dependencies

```bash
$ yarn install
$ cd backend && yarn install
$ cd ../webapp && yarn install
$ cd ..
```

#### Copy Environment Variables

```bash
$ cp cypress.env.template.json cypress.env.json
$ cp backend/.env.template backend/.env
$ cp webapp/.env.template webapp/.env
```

Configure the new files according to your needs and your local setup.

