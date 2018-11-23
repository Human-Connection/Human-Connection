FROM node:10-alpine
LABEL Description="This image builds and runs the Human-Connection Web Application Frontend" Vendor="Human-Connection gGmbH" Version="0.0.1" Maintainer="Human-Connection gGmbH (developer@human-connection.org)"

# expose the app port
EXPOSE 3000

ARG WORKDIR=/HC-WebApp
RUN mkdir -p $WORKDIR
WORKDIR $WORKDIR

# See: https://github.com/nodejs/docker-node/pull/367#issuecomment-430807898
RUN apk --no-cache add git

COPY styleguide/ ./styleguide
RUN cd styleguide && yarn install --production=false --frozen-lockfile --non-interactive --ignore-engines

COPY package.json .
COPY yarn.lock .
RUN yarn run styleguide:build
RUN yarn install --production=false --frozen-lockfile --non-interactive --ignore-engines

COPY . .
RUN ["yarn", "run", "build"]
CMD ["yarn", "run", "start"]
