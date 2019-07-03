FROM neo4j:3.5.5
LABEL Description="Neo4J database of the Social Network Human-Connection.org with preinstalled database constraints and indices" Vendor="Human Connection gGmbH" Version="0.0.1" Maintainer="Human Connection gGmbH (developer@human-connection.org)"

ARG BUILD_COMMIT
ENV BUILD_COMMIT=$BUILD_COMMIT

RUN wget https://github.com/neo4j-contrib/neo4j-apoc-procedures/releases/download/3.5.0.1/apoc-3.5.0.1-all.jar -P plugins/
RUN apk add --no-cache --quiet procps
COPY db_setup.sh /usr/local/bin/db_setup
COPY entrypoint.sh /docker-entrypoint-wrapper.sh
ENTRYPOINT ["/docker-entrypoint-wrapper.sh"]
