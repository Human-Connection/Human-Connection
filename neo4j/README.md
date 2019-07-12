# Neo4J

Human Connection is a social network. Using a graph based database which can
model nodes and edges natively - a network - feels like an obvious choice. We
decided to use [Neo4j](https://neo4j.com/), the currently most used graph
database available. The community edition of Neo4J is Free and Open Source and
we try our best to keep our application compatible with the community edition
only.

## Installation with Docker

Run:

```bash
docker-compose up
```

You can access Neo4J through [http://localhost:7474/](http://localhost:7474/)
for an interactive cypher shell and a visualization of the graph.

## Installation without Docker

Install the community edition of [Neo4j](https://neo4j.com/) along with the plugin
[Apoc](https://github.com/neo4j-contrib/neo4j-apoc-procedures) on your system.

To do so, go to [releases](https://neo4j.com/download-center/#releases), choose
"Community Server", download the installation files for you operation system
and unpack the files.

Download [Neo4j Apoc](https://github.com/neo4j-contrib/neo4j-apoc-procedures/releases)
and drop the `.jar` file into the `plugins` folder of the just extracted Neo4j-Server.

Then make sure to allow Apoc procedures by adding the following line to your Neo4j configuration \(`conf/neo4j.conf`\):

```
dbms.security.procedures.unrestricted=apoc.*
```

### Alternatives

You can download [Neo4j Desktop](https://neo4j.com/download/) and run locally
for development, spin up a
[hosted Neo4j Sandbox instance](https://neo4j.com/download/), run Neo4j in one
of the [many cloud options](https://neo4j.com/developer/guide-cloud-deployment/),
[spin up Neo4j in a Docker container](https://neo4j.com/developer/docker/),
on Archlinux you can install [neo4j-community from AUR](https://aur.archlinux.org/packages/neo4j-community/)
or on Debian-based systems install [Neo4j from the Debian Repository](http://debian.neo4j.org/).
Just be sure to update the Neo4j connection string and credentials accordingly
in `backend/.env`.

Start Neo4J and confirm the database is running at [http://localhost:7474](http://localhost:7474).

## Database Indices and Constraints

If you are not running our dedicated Neo4J [docker image](https://hub.docker.com/r/humanconnection/neo4j),
which is the case if you setup Neo4J locally without docker, then you have to
setup unique indices and database constraints manually.

If you have `cypher-shell` available with your local installation of neo4j you
can run:

```bash
# in folder neo4j/
$ cp .env.template .env
$ ./db_setup.sh
```

Otherwise, if you don't have `cypher-shell` available, copy the cypher
statements [from the `db_setup.sh` script](https://github.com/Human-Connection/Human-Connection/blob/master/neo4j/db_setup.sh) and paste the scripts into your
[database browser frontend](http://localhost:7474).
