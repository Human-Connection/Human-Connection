FROM node:10-alpine as base
LABEL Description="Web Frontend of the Social Network Human-Connection.org" Vendor="Human-Connection gGmbH" Version="0.0.1" Maintainer="Human-Connection gGmbH (developer@human-connection.org)"

# Expose the app port
ARG BUILD_COMMIT
ENV BUILD_COMMIT=$BUILD_COMMIT
ARG WORKDIR=/nitro-web
RUN mkdir -p $WORKDIR
WORKDIR $WORKDIR

# See: https://github.com/nodejs/docker-node/pull/367#issuecomment-430807898
RUN apk --no-cache add git

COPY locales ./locales
COPY styleguide ./styleguide
COPY server ./server
COPY package.json yarn.lock nuxt.config.js ./
CMD ["yarn", "run", "start"]

FROM base as build-and-test
RUN yarn install --production=false --frozen-lockfile --non-interactive
RUN cd styleguide && yarn install --production=false --frozen-lockfile --non-interactive \
    && cd .. \
    && yarn run styleguide:build && eslint --init
COPY . .
RUN yarn run build

FROM base as production
ENV NODE_ENV=production
COPY --from=build-and-test ./nitro-web/node_modules ./node_modules
COPY --from=build-and-test ./nitro-web/plugins ./plugins
COPY --from=build-and-test ./nitro-web/.nuxt ./.nuxt
COPY --from=build-and-test ./nitro-web/static ./static

EXPOSE 3000
