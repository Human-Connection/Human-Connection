# Human-Connection - GraphQL API - Prototype

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

## Quick Start

Install dependencies:

```bash
yarn install
# -or-
npm install
```

Start the GraphQL service:

```bash
yarn start
# -or-
npm start
```

This will start the GraphQL service (by default on localhost:4000)
where you can issue GraphQL requests or access GraphQL Playground in the browser:

![GraphQL Playground](img/graphql-playground.png)

## Configure

Set your Neo4j connection string and credentials in `.env`.
For example:

_.env_

```yaml
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=letmein
```

Note that grand-stack-starter does not currently bundle a distribution
of Neo4j. You can download [Neo4j Desktop](https://neo4j.com/download/)
and run locally for development, spin up a [hosted Neo4j Sandbox instance](https://neo4j.com/download/),
run Neo4j in one of the [many cloud options](https://neo4j.com/developer/guide-cloud-deployment/),
or [spin up Neo4j in a Docker container](https://neo4j.com/developer/docker/).
Just be sure to update the Neo4j connection string and credentials accordingly in `.env`.

## Deployment

You can deploy to any service that hosts Node.js apps, but [Zeit Now](https://zeit.co/now) 
is a great easy to use service for hosting your app that has an easy to use free plan for small projects.

To deploy your GraphQL service on Zeit Now, first install [Now Desktop](https://zeit.co/download) - 
you'll need to provide an email address. Then run

```
now
```

to deploy your GraphQL service on Zeit Now. Once deployed you'll be given 
a fresh URL that represents the current state of your application where you 
can access your GraphQL endpoint and GraphQL Playgound. 
For example: https://hc-graph-api-prototype-sdga96ad7.now.sh/

## Seeding The Database

Optionally you can seed the GraphQL service by executing mutations that 
will write sample data to the database:

```bash
yarn seedDb
# -or-
npm run seedDb
```
