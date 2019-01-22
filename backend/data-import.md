# Import of legacy data

This guide helps you to import data from our legacy servers, which are using FeathersJS and MongoDB. 

### Prerequisites
You need [docker](https://www.docker.com/) installed on your machine.
Furthermore you need SSH access to the server and you need to know the following login credentials and server settings:

| Environment variable | Description                      |
|----------------------|----------------------------------|
| SSH_USERNAME         | Your ssh username on the server  |
| SSH_HOST             | The IP address of the server     |
| MONGODB_USERNAME     | Mongo username on the server     |
| MONGODB_PASSWORD     | Mongo password on the server     |
| MONGODB_AUTH_DB      | Mongo authentication database    |
| MONGODB_DATABASE     | The name of the mongo database   |

### Run the database migration

Run `docker-compose` with all environment variables specified:
```sh
SSH_USERNAME=username SSH_HOST=some.server.com MONGODB_USERNAME='hc-api' MONGODB_PASSWORD='secret' MONGODB_DATABASE=hc_api MONGODB_AUTH_DB=hc_api  docker-compose up
```

Download the remote mongo database:
```sh
docker-compose exec db-migration-worker ./import.sh
```

Import the local download into Neo4J:
```sh
docker-compose exec neo4j import/import.sh
```
