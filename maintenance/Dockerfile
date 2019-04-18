FROM humanconnection/neo4j:latest as base

RUN apk upgrade --update
RUN apk add mongodb mongodb-tools openssh nodejs yarn

COPY migration ./migration
COPY migrate.sh /usr/local/bin/migrate
COPY sync_uploads.sh /usr/local/bin/sync_uploads


ENV NODE_ENV=maintenance
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
