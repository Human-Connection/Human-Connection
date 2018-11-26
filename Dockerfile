FROM node:10-alpine
LABEL Description="Web Frontend of the Social Network Human-Connection.org" Vendor="Human-Connection gGmbH" Version="0.0.1" Maintainer="Human-Connection gGmbH (developer@human-connection.org)"

# Expose the app port
EXPOSE 3000

ARG WORKDIR=/nitro-web
RUN mkdir -p $WORKDIR
WORKDIR $WORKDIR

# See: https://github.com/nodejs/docker-node/pull/367#issuecomment-430807898
RUN apk --no-cache add git

# Install Web Application
COPY package.json .
COPY yarn.lock .
COPY styleguide/ ./styleguide
RUN yarn install --production=false --frozen-lockfile --non-interactive --ignore-engines

# Install and build Styleguide
COPY styleguide/ ./styleguide
RUN cd styleguide && yarn install --production=false --frozen-lockfile --non-interactive --ignore-engines \
    && cd .. \
    && yarn run styleguide:build \
    && rm -Rf styleguide/node_modules

COPY . .
RUN ["yarn", "run", "build"]
CMD ["yarn", "run", "start"]
