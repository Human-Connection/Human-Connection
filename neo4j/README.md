# Neo4j Database

## Setup

### Indexes

Prepare the database with indexes:

{% tabs %}
{% tab title="Docker" %}
If Docker is up, open another terminal and create unique indixes with:

```bash
# in Human-Connection folder
$ docker-compose exec neo4j migrate
```
{% endtab %}

{% tab title="Local" %}
If Neo4j database runs, just use the comand:

\(**Attention:** This command is not working at the moment !!! Workaround: Search for file \`backend/neo4j/migrate.sh\` and copy the cypher comands that create the indexes directly into the the cypher shell of Neo4j at [http://localhost:7474/](http://localhost:7474/).\)

```bash
# in Human-Connection folder
$ ./backend/neo4j/migrate.sh
```
{% endtab %}
{% endtabs %}

### Data Seeding and Reset

If you want your Backend to return anything else than an empty response, you need to seed your database:

{% tabs %}
{% tab title="Docker" %}
In another terminal run:

```bash
# in Human-Connection folder
$ docker-compose exec backend yarn run db:seed
```

To reset the database run:

```bash
# in Human-Connection folder

# (indexes are not deleted)
$ docker-compose exec backend yarn run db:reset

# you could also wipe out your neo4j database and delete all volumes with:
# (indexes are deleted)
$ docker-compose down -v
```
{% endtab %}

{% tab title="Local" %}
Run:

```bash
# in webapp folder
$ yarn run db:seed
```

To reset the database run:

```bash
# (indexes are not deleted)
$ yarn run db:reset
```
{% endtab %}
{% endtabs %}

## Access

You can access Neo4j through [http://localhost:7474/](http://localhost:7474/) for an interactive `cypher` shell and a visualization of the graph.

The next section describes the access to the database from the Webapp view via **GraphQL**.

