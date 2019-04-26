# Local Installation

For the local installation you need a recent version of [Node.js](https://nodejs.org/en/) \(&gt;= v10.12.0\) and [Neo4J](https://neo4j.com) along with [Neo4j Apoc plugin](https://github.com/neo4j-contrib/neo4j-apoc-procedures) installed on your system.

## Neo4j and APOC Plugin

Download [Neo4j Community Edition](https://neo4j.com/download-center/#releases) and unpack the files.

Download [Neo4j Apoc](https://github.com/neo4j-contrib/neo4j-apoc-procedures/releases) and drop the file into the `plugins` folder of the just extracted Neo4j-Server Note that grand-stack-starter does not currently bundle a distribution of Neo4j. You can download [Neo4j Desktop](https://neo4j.com/download/) and run locally for development, spin up a [hosted Neo4j Sandbox instance](https://neo4j.com/download/), run Neo4j in one of the [many cloud options, spin up Neo4j in a Docker container](https://neo4j.com/developer/docker/) or on Debian-based systems install [Neo4j from the Debian Repository](http://debian.neo4j.org/). Just be sure to update the Neo4j connection string and credentials accordingly in `.env`. Start Neo4J and confirm the database is running at [http://localhost:7474](http://localhost:7474).

## Human Connection

### Install

Now install all node dependencies for the Backend and Webapp with [yarn](https://yarnpkg.com/en/):

```bash
# in Human-Connection folder
$ yarn install
```

### Environment Variables

Copy Environment Variables:

```bash
# in Human-Connection folder
$ cp cypress.env.template.json cypress.env.json
```

```bash
# in backend folder
$ cd backend
$ cp .env.template .env
$ cd ..
```

```bash
# in webapp folder
$ cd webapp
$ cp .env.template .env
$ cd ..
```

Configure the new files according to your needs and your local setup.

### Development and Production

#### Backend

Open another terminal and start the Backend:

```bash
# in backend folder
$ cd backend

# for development, starts GraphQL Playground service at localhost:4000/
$ yarn run dev

# for production environment
$ yarn run start
```

#### Webapp

Open another terminal and start the Webapp:

```bash
# in webapp folder
$ cd webapp

# for development, serve with hot reload at localhost:3000
$ yarn dev

# build for production and launch server
$ yarn build
$ yarn start
```

To setup the Backend and play with the Neo4j database or open the Webapp in the browser, see the next sections.

