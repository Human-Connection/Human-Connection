FROM humanconnection/neo4j:latest

ENV NODE_ENV=maintenance
EXPOSE 7687 7474

ENV BUILD_DEPS="gettext"  \
    RUNTIME_DEPS="libintl"

RUN set -x && \
    apk add --update $RUNTIME_DEPS && \
    apk add --virtual build_deps $BUILD_DEPS &&  \
    cp /usr/bin/envsubst /usr/local/bin/envsubst && \
    apk del build_deps


RUN apk upgrade --update
RUN apk add --no-cache mongodb-tools openssh nodejs yarn rsync

COPY known_hosts /root/.ssh/known_hosts
COPY migration ./migration
COPY ./binaries/* /usr/local/bin/
