# Backend Installation

The Backend repository can be found on GitHub. [https://github.com/Human-Connection/Nitro-Backend](https://github.com/Human-Connection/Nitro-Backend)

{% hint style="info" %}
TODO: Create documentation section for How to Start and Beginners.
{% endhint %}

Here are some general informations about our [GitHub Standard Fork & Pull Request Workflow](https://gist.github.com/Chaser324/ce0505fbed06b947d962).

### Fork the Repository

Click on the fork button.

![Fork screenshot](../../.gitbook/assets/screenshot-forking-nitro-backend.png)

### Clone your new Repository

Set the current working folder to the path in which the backend repository should be cloned \(copied\).

```bash
$ cd PATH-FOR-NITRO-BACKEND
```

For cloning your new repository to your local machine modify the following command to add your GitHub user name.

{% tabs %}
{% tab title="HTTPS" %}
```bash
$ git clone https://github.com/YOUR-GITHUB-USERNAME/Nitro-Backend.git
```
{% endtab %}

{% tab title="SSH" %}
```bash
$ git clone git@github.com:YOUR-GITHUB-USERNAME/Nitro-Backend.git
```
{% endtab %}
{% endtabs %}

Change into the new folder.

```bash
$ cd Nitro-Backend
```

Add the original Human Connection repository as `upstream`. This prepares you to synchronize your local clone with a simple pull command in the future.

{% tabs %}
{% tab title="HTTPS" %}
```bash
$ git remote add upstream https://github.com/Human-Connection/Nitro-Backend.git
```
{% endtab %}

{% tab title="SSH" %}
```bash
$ git remote add upstream git@github.com:Human-Connection/Nitro-Backend.git
```
{% endtab %}
{% endtabs %}

### Copy Environment Variables

```bash
$ cp .env.template .env
```

Configure the file `.env` according to your needs and your local setup.

## Installation and Usage with Docker

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

{% endtab %}
{% endtabs %}

Check the correct Docker installation by checking the version before proceeding. E.g. we have the following versions:

```bash
$ docker --version
Docker version 18.09.2
$ docker-compose --version
docker-compose version 1.23.2
```

### Install Nitro-BackEnd with Docker

Run the following command to install Nitro-Backend as a Docker container. This installation includes Neo4j.

The installation takes a bit longer on the first pass or on rebuild ...

```bash
$ docker-compose up

# rebuild the containers for a cleanup
$ docker-compose up --build
```

#### Seed Neo4j in Docker

To seed the Neo4j database with default data, that GraphQL requests or playing with our GraphQL Playground returns anything else than an empty response, run the command.

Run the following command to seed the Neo4j database with default data requested by Nitro-Web through GraphQL or when you play with our GraphQL playground.

```bash
# open another terminal

# create indices etc.
$ docker-compose exec neo4j migrate

# seed database
$ docker-compose exec backend yarn run db:seed
```

#### Wipe out Neo4j database in Docker

To wipe out your neo4j database and delete the volumes send command:

```bash
# open another terminal and run
$ docker-compose down -v
```

#### Video Tutorial

{% hint style="info" %}
TODO: Link to video
{% endhint %}

### Development with Kubernetes

For further informations see also our [Kubernetes documentation](kubernetes.md).

## Local Installation

Make sure that you have a recent version of [yarn](https://yarnpkg.com/en/) or [npm](https://www.npmjs.com) installed before you proceed. E.g. we have the following versions:

```bash
$ yarn --version
1.12.3
$ npm --version
6.4.1
```

If the `yarn` or `npm` command is unknown you may use the [docker installation](./#installation-and-usage-with-docker) \(see above\) or contact the developer team at [Discord](https://discord.gg/6ub73U3) if you have any questions:

### Install Dependencies

{% tabs %}
{% tab title="Yarn" %}
```bash
$ yarn install
```
{% endtab %}

{% tab title="NPM" %}
```bash
$ npm install
```
{% endtab %}
{% endtabs %}

### Start the Server

{% tabs %}
{% tab title="Yarn" %}
#### Development

```bash
$ yarn run dev
```

#### Production

```bash
# you will need to build the app first (done while building the docker image)
$ yarn run build
# run after build (dist folder must exist)
$ yarn run start
```
{% endtab %}

{% tab title="NPM" %}
#### Development

```bash
$ npm run dev
```

#### Production

```bash
# you will need to build the app first (done while building the docker image)
$ npm run build
# run after build (dist folder must exist)
$ npm run start
```
{% endtab %}
{% endtabs %}

This will start the GraphQL service \(by default on [http://localhost:4000](http://localhost:4000)\) where you can issue GraphQL requests or access GraphQL Playground in the browser.

{% hint style="warning" %}
But before you can issue GraphQL requests or access GraphQL Playground you have to install, start and seed your Neo4j database. See next step …
{% endhint %}

