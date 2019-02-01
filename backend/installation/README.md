# Backend Installation


The Backend repository can be found on GitHub.
[https://github.com/Human-Connection/Nitro-Backend](https://github.com/Human-Connection/Nitro-Backend)

{% hint style="info" %} TODO: Create documentation section for How to Start and Beginners. {% endhint %}

Here are some general informations about our [GitHub Standard Fork & Pull Request Workflow](https://gist.github.com/Chaser324/ce0505fbed06b947d962).

### Fork the Repository

Click on the fork button.

![Fork screenshot](../../.gitbook/assets/screenshot-forking-nitro-backend.png)

### Clone your new Repository

Set the current working folder to the path in which the backend repository should be cloned (copied).

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
git remote add upstream https://github.com/Human-Connection/Nitro-Backend.git
```
{% endtab %}
{% tab title="SSH" %}
```bash
git remote add upstream git@github.com:Human-Connection/Nitro-Backend.git
```
{% endtab %}
{% endtabs %}

### Copy Environment Variables

```bash
$ cp .env.template .env
```

Configure the file `.env` according to your needs and your local setup.


## Installation and Usage with Docker

{% hint style="info" %}
TODO: How to install Docker for Human Connection …
(Also maybe there should be a main docker installation guide for the whole system at once!?)
{% endhint %}

For further informations see also our [Docker documentation](docker.md).


## Local Installation

Make sure that you have a recent version of [yarn](https://yarnpkg.com/en/) or [npm](https://www.npmjs.com) installed before you proceed. E.g. we have the following versions:

```sh
$ yarn --version
1.12.3
$ npm --version
6.4.1
```

If the `yarn` or `npm` command is unknown you may use the [docker installation](#installation-and-usage-with-docker) (see above) or contact the developer team at [Discord](https://discord.gg/6ub73U3) if you have any questions:

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
