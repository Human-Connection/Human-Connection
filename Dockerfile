FROM node:10-alpine
LABEL Description="Server part of the social network Human Connection" Vendor="Human-Connection gGmbH" Version="0.0.1" Maintainer="Human-Connection gGmbH (developer@human-connection.org)"

# expose the app port
EXPOSE 4000

ARG WORKDIR=/backend

RUN mkdir -p $WORKDIR
WORKDIR $WORKDIR

COPY package.json .
COPY yarn.lock .
RUN yarn install --production=false --frozen-lockfile --non-interactive

COPY . .

CMD ["yarn", "run", "start"]
