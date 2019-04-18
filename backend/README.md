# Backend

## Installation
{% tabs %}
{% tab title="Docker" %}

Run the following command to install everything through docker.

The installation takes a bit longer on the first pass or on rebuild ...

```bash
$ docker-compose up

# rebuild the containers for a cleanup
$ docker-compose up --build
```
Open another terminal and create unique indices with:

```bash
$ docker-compose exec neo4j migrate
```

{% endtab %}

{% tab title="Without Docker" %}

For the local installation you need a recent version of [node](https://nodejs.org/en/)
(&gt;= `v10.12.0`) and [Neo4J](https://neo4j.com/) along with
[Apoc](https://github.com/neo4j-contrib/neo4j-apoc-procedures) plugin installed
on your system.

Download [Neo4j Community Edition](https://neo4j.com/download-center/#releases) and unpack the files.

Download [Neo4j Apoc](https://github.com/neo4j-contrib/neo4j-apoc-procedures/releases) and drop the file into the `plugins` folder of the just extracted Neo4j-Server
Note that grand-stack-starter does not currently bundle a distribution of Neo4j. You can download [Neo4j Desktop](https://neo4j.com/download/) and run locally for development, spin up a [hosted Neo4j Sandbox instance](https://neo4j.com/download/), run Neo4j in one of the [many cloud options](https://neo4j.com/developer/guide-cloud-deployment/), [spin up Neo4j in a Docker container](https://neo4j.com/developer/docker/) or on Debian-based systems install [Neo4j from the Debian Repository](http://debian.neo4j.org/). Just be sure to update the Neo4j connection string and credentials accordingly in `.env`.
Start Neo4J and confirm the database is running at [http://localhost:7474](http://localhost:7474).

Now install node dependencies with [yarn](https://yarnpkg.com/en/):
```bash
$ cd backend
$ yarn install
```

Copy Environment Variables:
```bash
# in backend/
$ cp .env.template .env
```

Configure the new files according to your needs and your local setup.

Create unique indices with:

```bash
$ ./neo4j/migrate.sh
```

Start the backend for development with:
```bash
$ yarn run dev
```

or start the backend in production environment with:
```bash
yarn run start
```

{% endtab %}
{% endtabs %}

Your backend is up and running at [http://localhost:4000/](http://localhost:4000/)
This will start the GraphQL service \(by default on localhost:4000\) where you can issue GraphQL requests or access GraphQL Playground in the browser. 

![GraphQL Playground](../.gitbook/assets/graphql-playground.png)

You can access Neo4J through [http://localhost:7474/](http://localhost:7474/)
for an interactive `cypher` shell and a visualization of the graph.


#### Seed Database

If you want your backend to return anything else than an empty response, you
need to seed your database:

{% tabs %}
{% tab title="Docker" %}

In another terminal run:
```bash
$ docker-compose exec backend yarn run db:seed
```

To reset the database run:
```bash
$ docker-compose exec backend yarn run db:reset
# you could also wipe out your neo4j database and delete all volumes with:
$ docker-compose down -v
```
{% endtab %}

{% tab title="Without Docker" %}
Run:
```bash
$ yarn run db:seed
```

To reset the database run:
```bash
$ yarn run db:reset
```
{% endtab %}
{% endtabs %}


# Testing

**Beware**: We have no multiple database setup at the moment. We clean the database after each test, running the tests will wipe out all your data!


{% tabs %}
{% tab title="Docker" %}

Run the _**jest**_ tests:

```bash
$ docker-compose exec backend yarn run test:jest
```

Run the _**cucumber**_ features:

```bash
$ docker-compose exec backend yarn run test:cucumber
```

{% endtab %}

{% tab title="Without Docker" %}

Run the _**jest**_ tests:

```bash
$ yarn run test:jest
```

Run the _**cucumber**_ features:

```bash
$ yarn run test:cucumber
```

{% endtab %}
{% endtabs %}
