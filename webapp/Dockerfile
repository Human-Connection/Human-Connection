FROM node:12.10.0-alpine as base
LABEL Description="Web Frontend of the Social Network Human-Connection.org" Vendor="Human-Connection gGmbH" Version="0.0.1" Maintainer="Human-Connection gGmbH (developer@human-connection.org)"

EXPOSE 3000
CMD ["yarn", "run", "start"]

# Expose the app port
ARG BUILD_COMMIT
ENV BUILD_COMMIT=$BUILD_COMMIT
ENV NODE_ENV=production
ARG WORKDIR=/nitro-web
RUN mkdir -p $WORKDIR
WORKDIR $WORKDIR

# See: https://github.com/nodejs/docker-node/pull/367#issuecomment-430807898
RUN apk --no-cache add git


FROM base as build-and-test
COPY . .
RUN cp .env.template .env
RUN yarn install --production=false --frozen-lockfile --non-interactive
RUN yarn run build

FROM base as production
COPY package.json yarn.lock ./
RUN yarn install --production=true --frozen-lockfile --non-interactive
COPY --from=build-and-test ./nitro-web/.nuxt ./.nuxt
