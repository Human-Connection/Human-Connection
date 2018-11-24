FROM node:10-alpine
LABEL Description="Backend of the Social Network Human-Connection.org" Vendor="Human-Connection gGmbH" Version="0.0.1" Maintainer="Human-Connection gGmbH (developer@human-connection.org)"

# Expose the app port
EXPOSE 4000

ARG WORKDIR=/nitro-backend
RUN mkdir -p $WORKDIR
WORKDIR $WORKDIR

# Install the Application Dependencies
COPY package.json .
COPY yarn.lock .
RUN yarn install --production=false --frozen-lockfile --non-interactive

COPY . .
COPY .env.template .env

CMD ["yarn", "run", "start"]
