FROM node:12.4-alpine as base
LABEL Description="Web Frontend of the Social Network Human-Connection.org" Vendor="Human-Connection gGmbH" Version="0.0.1" Maintainer="Human-Connection gGmbH (developer@human-connection.org)"

EXPOSE 3000
CMD ["yarn", "run", "start"]

# Expose the app port
ARG BUILD_COMMIT
ENV BUILD_COMMIT=$BUILD_COMMIT
ARG WORKDIR=/nitro-web
RUN mkdir -p $WORKDIR
WORKDIR $WORKDIR

# See: https://github.com/nodejs/docker-node/pull/367#issuecomment-430807898
RUN apk --no-cache add git

COPY . .

FROM base as build-and-test
RUN cp .env.template .env
RUN yarn install --ignore-engines --production=false --frozen-lockfile --non-interactive
RUN yarn run build

FROM base as production
ENV NODE_ENV=production
COPY --from=build-and-test ./nitro-web/node_modules ./node_modules
COPY --from=build-and-test ./nitro-web/.nuxt ./.nuxt
