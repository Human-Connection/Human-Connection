FROM humanconnection/neo4j:latest

ENV NODE_ENV=maintenance
EXPOSE 7687 7474

RUN apk upgrade --update
RUN apk add --no-cache mongodb-tools openssh nodejs yarn rsync

COPY known_hosts /root/.ssh/known_hosts
COPY migration /migration
COPY ./binaries/* /usr/local/bin/
