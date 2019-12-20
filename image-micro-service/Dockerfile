FROM node:12.12.0-alpine as base
LABEL Description="Image micro service of the Social Network Human-Connection.org" Vendor="Human Connection gGmbH" Version="0.0.1" Maintainer="Human Connection gGmbH (developer@human-connection.org)"

EXPOSE 4001
CMD ["yarn", "run", "start"]
ARG BUILD_COMMIT
ENV BUILD_COMMIT=$BUILD_COMMIT
ARG WORKDIR=/image-micro-service
RUN mkdir -p $WORKDIR
WORKDIR $WORKDIR

RUN apk --no-cache add git

COPY package.json yarn.lock ./

FROM base as build-and-test
RUN yarn install --production=false --frozen-lockfile --non-interactive
COPY . .
RUN NODE_ENV=production yarn run build

# reduce image size with a multistage build
FROM base as production
ENV NODE_ENV=production
COPY --from=build-and-test /image-micro-service/dist ./dist
COPY --from=build-and-test /image-micro-service/static/img/sign-up/ ./static/img/sign-up/
RUN yarn install --production=true --frozen-lockfile --non-interactive --no-cache