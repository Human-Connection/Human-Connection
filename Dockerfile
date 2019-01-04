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

COPY package.json yarn.lock ./
COPY styleguide/ ./styleguide

FROM base as builder
RUN yarn install --frozen-lockfile --non-interactive
RUN cd styleguide && yarn install --production=false --frozen-lockfile --non-interactive \
    && cd .. \
    && yarn run styleguide:build
COPY . .
RUN yarn run build

FROM base as production
ENV NODE_ENV=production
ADD package.json ./
ADD nuxt.config.js ./
COPY --from=builder ./nitro-web/plugins ./plugins/
COPY --from=builder ./nitro-web/node_modules ./node_modules/
COPY --from=builder /nitro-web/.nuxt/ ./.nuxt
COPY --from=builder ./nitro-web/static ./static/

EXPOSE 3000
CMD ["yarn", "run", "start"]
