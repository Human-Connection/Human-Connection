FROM node:12.11.1-alpine as base
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

COPY package.json yarn.lock ./
COPY .env.template .env


FROM base as build-and-test
RUN yarn install --production=false --frozen-lockfile --non-interactive
COPY . .
RUN NODE_ENV=production yarn run build

FROM base as production
RUN yarn install --production=true --frozen-lockfile --non-interactive --no-cache
COPY --from=build-and-test ./nitro-web/.nuxt ./.nuxt
COPY --from=build-and-test ./nitro-web/static ./static
COPY nuxt.config.js .
COPY locales locales
