FROM neo4j:4.0.2-enterprise
LABEL Description="Neo4J database of the Social Network Human-Connection.org with preinstalled database constraints and indices" Vendor="Human Connection gGmbH" Version="0.0.1" Maintainer="Human Connection gGmbH (developer@human-connection.org)"

ARG BUILD_COMMIT
ENV BUILD_COMMIT=$BUILD_COMMIT

RUN apt-get update && apt-get -y install wget htop
RUN wget https://github.com/neo4j-contrib/neo4j-apoc-procedures/releases/download/4.0.0.4/apoc-4.0.0.4-all.jar -P plugins/
