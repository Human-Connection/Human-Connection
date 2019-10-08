FROM node:12.11.0-alpine as base
LABEL Description="Backend of the Social Network Human-Connection.org" Vendor="Human Connection gGmbH" Version="0.0.1" Maintainer="Human Connection gGmbH (developer@human-connection.org)"

EXPOSE 4000
CMD ["yarn", "run", "start"]
ARG BUILD_COMMIT
ENV BUILD_COMMIT=$BUILD_COMMIT
ARG WORKDIR=/nitro-backend
RUN mkdir -p $WORKDIR
WORKDIR $WORKDIR

RUN apk --no-cache add git

COPY package.json yarn.lock ./
COPY .env.template .env

FROM base as build-and-test
RUN yarn install --production=false --frozen-lockfile --non-interactive
COPY . .
RUN NODE_ENV=production yarn run build

# reduce image size with a multistage build
FROM base as production
ENV NODE_ENV=production
COPY --from=build-and-test /nitro-backend/dist ./dist
COPY ./public/img/ ./public/img/
RUN yarn install --production=true --frozen-lockfile --non-interactive --no-cache
