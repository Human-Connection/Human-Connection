# Backend


## Installation with Docker

Make sure you are on a [node](https://nodejs.org/en/) version &gt;= `v10.12.0`:

```text
  node --version
```

Run:

```bash
docker-compose up

# create indices etc.
docker-compose exec neo4j migrate

# if you want seed data
# open another terminal and run
docker-compose exec backend yarn run db:seed
```

App is [running on port 4000](http://localhost:4000/)

To wipe out your neo4j database run:

```bash
docker-compose down -v
```

## Installation without Docker

Install dependencies:

Download [Neo4j Community Edition](https://neo4j.com/download-center/#releases) and unpack the files.

Download [Neo4j Apoc](https://github.com/neo4j-contrib/neo4j-apoc-procedures/releases) and drop the file into the `plugins` folder of the just extracted Neo4j-Server

Start Neo4j

```text
neo4j\bin\neo4j start
```

and confirm it's running [here](http://localhost:7474)

```bash
yarn install
# -or-
npm install
```

Copy:

```text
cp .env.template .env
```

Configure the file `.env` according to your needs and your local setup.

Start the GraphQL service:

```bash
yarn dev
# -or-
npm dev
```

And on the production machine run following:

```bash
yarn start
# -or-
npm start
```

This will start the GraphQL service \(by default on localhost:4000\) where you can issue GraphQL requests or access GraphQL Playground in the browser:

![GraphQL Playground](../.gitbook/assets/graphql-playground.png)

## Configure

Set your Neo4j connection string and credentials in `.env`. For example:

_.env_

```yaml
NEO4J_URI=bolt://localhost:7687
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=letmein
```

> You need to install APOC as a plugin for the graph you create in the neo4j desktop app!

Note that grand-stack-starter does not currently bundle a distribution of Neo4j. You can download [Neo4j Desktop](https://neo4j.com/download/) and run locally for development, spin up a [hosted Neo4j Sandbox instance](https://neo4j.com/download/), run Neo4j in one of the [many cloud options](https://neo4j.com/developer/guide-cloud-deployment/), [spin up Neo4j in a Docker container](https://neo4j.com/developer/docker/) or on Debian-based systems install [Neo4j from the Debian Repository](http://debian.neo4j.org/). Just be sure to update the Neo4j connection string and credentials accordingly in `.env`.

# Seed and Reset the Database

Optionally you can seed the GraphQL service by executing mutations that will write sample data to the database:

```bash
yarn run db:seed
# -or-
npm run db:seed
```

For a reset you can use the reset script:

```bash
yarn db:reset
# -or-
npm run db:reset
```

# Testing

**Beware**: We have no multiple database setup at the moment. We clean the database after each test, running the tests will wipe out all your data!

Run the _**jest**_ tests:

```bash
yarn run test
# -or-
npm run test
```

Run the _**cucumber**_ features:

```bash
yarn run test:cucumber
# -or-
npm run test:cucumber
```

When some tests fail, try `yarn db:reset` and after that `yarn db:seed`. Then run the tests again
