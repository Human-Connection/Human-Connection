<p align="center">
  <a href="https://human-connection.org"><img align="center" src="humanconnection.png" height="200" alt="Human Connection" /></a>
</p>

# NITRO Backend
[![Build Status](https://img.shields.io/travis/com/Human-Connection/Nitro-Backend/master.svg)](https://travis-ci.com/Human-Connection/Nitro-Backend)
[![MIT License](https://img.shields.io/badge/license-MIT-green.svg)](https://github.com/Human-Connection/Nitro-Backend/blob/backend/LICENSE.md)
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2FHuman-Connection%2FNitro-Backend.svg?type=shield)](https://app.fossa.io/projects/git%2Bgithub.com%2FHuman-Connection%2FNitro-Backend?ref=badge_shield)
[![Discord Channel](https://img.shields.io/discord/489522408076738561.svg)](https://discord.gg/6ub73U3)

> This Prototype tries to resolve the biggest hurdle of connecting
> our services together. This is not possible in a sane way using
> our current approach.
>
> With this Prototype we can explore using the combination of
> GraphQL and the Neo4j Graph Database for achieving the connected
> nature of a social graph with better development experience as we
> do not need to connect data by our own any more through weird table
> structures etc.

>
> #### Advantages:
> - easer data structure
> - better connected data
> - easy to achieve "recommendations" based on actions (relations)
> - more performant and better to understand API
> - better API client that uses caching
>
> We still need to evaluate the drawbacks and estimate the development
> cost of such an approach

## How to get in touch
Connect with other developers over [Discord](https://discord.gg/6ub73U3)

## Quick Start

### Requirements

Node >= `v10.12.0`
```
  node --version
```

### Forking the repository
Before you start, fork the repository using the fork button above, then clone it to your local machine using `git clone https://github.com/your-username/Nitro-Backend.git`

### Installation with Docker

Run:
```sh
docker-compose up

# create indices etc.
docker-compose exec neo4j migrate

# if you want seed data
# open another terminal and run
docker-compose exec backend yarn run db:seed
```

App is [running on port 4000](http://localhost:4000/)

To wipe out your neo4j database run:
```sh
docker-compose down -v
```


### Installation without Docker

Install dependencies:

Download [Neo4j Enterprise Edition](https://neo4j.com/download-center/#releases) and unpack the files.

Download [Neo4j Apoc](https://github.com/neo4j-contrib/neo4j-apoc-procedures/releases) and drop the file into the `plugins` folder of the just extracted Neo4j-Server

Start Neo4j
```
neo4j\bin\neo4j start
```
and confirm it's running [here](http://localhost:7474)


```bash
yarn install
# -or-
npm install
```

Copy:
```
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

This will start the GraphQL service (by default on localhost:4000)
where you can issue GraphQL requests or access GraphQL Playground in the browser:

![GraphQL Playground](graphql-playground.png)

## Configure

Set your Neo4j connection string and credentials in `.env`.
For example:

_.env_

```yaml
NEO4J_URI=bolt://localhost:7687
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=letmein
```

> You need to install APOC as a plugin for the graph you create in the neo4j desktop app!

Note that grand-stack-starter does not currently bundle a distribution
of Neo4j. You can download [Neo4j Desktop](https://neo4j.com/download/)
and run locally for development, spin up a [hosted Neo4j Sandbox instance](https://neo4j.com/download/),
run Neo4j in one of the [many cloud options](https://neo4j.com/developer/guide-cloud-deployment/),
[spin up Neo4j in a Docker container](https://neo4j.com/developer/docker/) or on Debian-based systems install [Neo4j from the Debian Repository](http://debian.neo4j.org/).
Just be sure to update the Neo4j connection string and credentials accordingly in `.env`.

## Mock API Results

Alternatively you can just mock all responses from the api which let
you build a frontend application without running a neo4j instance.

Just set `MOCK=true` inside `.env` or pass it on application start.

## Seed and Reset the Database

Optionally you can seed the GraphQL service by executing mutations that
will write sample data to the database:

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

## Run Tests

**Beware**: We have no multiple database setup at the moment. We clean the database after each test, running the tests will wipe out all your data!

Run the **_jest_** tests:
```bash
yarn run test
# -or-
npm run test
```
Run the **_cucumber_** features:
```bash
yarn run test:cucumber
# -or-
npm run test:cucumber
```

When some tests fail, try `yarn db:reset` and after that `yarn db:seed`. Then run the tests again
## Todo`s

- [x] add jwt authentication
- [ ] get directives working correctly (@toLower, @auth, @role, etc.)
- [x] check if search is working
- [x] check if sorting is working
- [x] check if pagination is working
- [ ] check if upload is working (using graphql-yoga?)
- [x] evaluate middleware
- [ ] ignore Posts and Comments by blacklisted Users


## License
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2FHuman-Connection%2FNitro-Backend.svg?type=large)](https://app.fossa.io/projects/git%2Bgithub.com%2FHuman-Connection%2FNitro-Backend?ref=badge_large)
