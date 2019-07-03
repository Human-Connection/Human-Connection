FROM node:12.5-alpine
LABEL Description="API Service for fetching URL Information for the Social Network Human-Connection.org" Vendor="Human Connection gGmbH" Version="0.0.1" Maintainer="Human Connection gGmbH (developer@human-connection.org)"

EXPOSE 3050
ARG BUILD_COMMIT
ENV BUILD_COMMIT=$BUILD_COMMIT
ARG WORKDIR=/nitro-embed
RUN mkdir -p $WORKDIR
WORKDIR $WORKDIR

RUN apk --no-cache add git

COPY . .
RUN yarn install --frozen-lockfile --non-interactive
CMD ["yarn", "run", "start"]
