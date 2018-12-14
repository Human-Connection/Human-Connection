FROM node:10-alpine as builder
LABEL Description="Backend of the Social Network Human-Connection.org" Vendor="Human Connection gGmbH" Version="0.0.1" Maintainer="Human Connection gGmbH (developer@human-connection.org)"

# Expose the app port
EXPOSE 4000

ARG BUILD_COMMIT
ENV BUILD_COMMIT=$BUILD_COMMIT
ARG WORKDIR=/nitro-backend
RUN mkdir -p $WORKDIR
WORKDIR $WORKDIR

# Install the Application Dependencies
COPY package.json .
COPY yarn.lock .
RUN yarn install --frozen-lockfile --non-interactive

COPY . .
COPY .env.template .env

RUN yarn run build
CMD ["yarn", "run", "start"]

# reduce image size with a multistage build
FROM node:10-alpine as production
ENV NODE_ENV=production
COPY --from=builder /nitro-backend/dist ./dist
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --non-interactive
