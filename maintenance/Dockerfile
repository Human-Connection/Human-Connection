FROM humanconnection/neo4j:latest as base

ENV NODE_ENV=maintenance
EXPOSE 7687 7474
VOLUME /mongo-export /uploads /data

RUN apk upgrade --update
RUN apk add --no-cache mongodb-tools openssh nodejs yarn rsync

FROM humanconnection/nitro-backend:latest as backend

FROM base

COPY --from=backend /nitro-backend /nitro-backend
COPY seeding/package.json .
# Install graphql-request manually, it's required for seeding and not included
# in backend's preinstalled node_modules/
RUN yarn install                                      && \
  cp -r ./node_modules/* /nitro-backend/node_modules/ && \
  rm -rf ./node_modules/ yarn.lock                    && \
  mv package.json /nitro-backend/package.json
# We have to do this odd copying to prevent cleaning `node_modules` folder which
# would happen if we `yarn install|add` in the target directory

COPY migration ./migration
COPY ./binaries/* /usr/local/bin/
