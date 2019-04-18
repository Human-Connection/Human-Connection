# Local Installation

For the local installation you need a recent version of [Node.js](https://nodejs.org/en/) \(&gt;= v10.12.0\) and [Neo4J](https://neo4j.com) along with [Apoc](https://github.com/neo4j-contrib/neo4j-apoc-procedures) plugin installed on your system.

Download [Neo4j Community Edition](https://neo4j.com/download-center/#releases) and unpack the files.

Download [Neo4j Apoc](https://github.com/neo4j-contrib/neo4j-apoc-procedures/releases) and drop the file into the `plugins` folder of the just extracted Neo4j-Server Note that grand-stack-starter does not currently bundle a distribution of Neo4j. You can download [Neo4j Desktop](https://neo4j.com/download/) and run locally for development, spin up a [hosted Neo4j Sandbox instance](https://neo4j.com/download/), run Neo4j in one of the [many cloud options, spin up Neo4j in a Docker container](https://neo4j.com/developer/docker/) or on Debian-based systems install [Neo4j from the Debian Repository](http://debian.neo4j.org/). Just be sure to update the Neo4j connection string and credentials accordingly in `.env`. Start Neo4J and confirm the database is running at [http://localhost:7474](http://localhost:7474).

XXX "Go ahead: Overtake Description from Backend …"

