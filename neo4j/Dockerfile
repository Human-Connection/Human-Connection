FROM neo4j:3.5.11
LABEL Description="Neo4J database of the Social Network Human-Connection.org with preinstalled database constraints and indices" Vendor="Human Connection gGmbH" Version="0.0.1" Maintainer="Human Connection gGmbH (developer@human-connection.org)"

ARG BUILD_COMMIT
ENV BUILD_COMMIT=$BUILD_COMMIT

COPY db_setup.sh /usr/local/bin/db_setup

RUN apt-get update && apt-get -y install wget htop
RUN wget https://github.com/neo4j-contrib/neo4j-apoc-procedures/releases/download/3.5.0.4/apoc-3.5.0.4-all.jar -P plugins/
