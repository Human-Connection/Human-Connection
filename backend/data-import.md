# Import

This guide helps you to import data from our legacy servers, which are using FeathersJS and MongoDB.

## Prerequisites

You need [docker](https://www.docker.com/) installed on your machine. Furthermore you need SSH access to the server and you need to know the following login credentials and server settings:

| Environment variable | Description |
| :--- | :--- |
| SSH\_USERNAME | Your ssh username on the server |
| SSH\_HOST | The IP address of the server |
| MONGODB\_USERNAME | Mongo username on the server |
| MONGODB\_PASSWORD | Mongo password on the server |
| MONGODB\_AUTH\_DB | Mongo authentication database |
| MONGODB\_DATABASE | The name of the mongo database |
| UPLOADS\_DIRECTORY | Path to remote uploads folder |

## Run the database migration

Run `docker-compose` with all environment variables specified:

```bash
SSH_USERNAME=username SSH_HOST=some.server.com MONGODB_USERNAME='hc-api' MONGODB_PASSWORD='secret' MONGODB_DATABASE=hc_api MONGODB_AUTH_DB=hc_api UPLOADS_DIRECTORY=/var/www/api/uploads  docker-compose up
```

Download the remote mongo database:

```bash
docker-compose exec db-migration-worker ./import.sh
```

Import the local download into Neo4J:

```bash
docker-compose exec neo4j import/import.sh
```

