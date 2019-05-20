FROM node:10-alpine as base
LABEL Description="Backend of the Social Network Human-Connection.org" Vendor="Human Connection gGmbH" Version="0.0.1" Maintainer="Human Connection gGmbH (developer@human-connection.org)"

EXPOSE 4000
ARG BUILD_COMMIT
ENV BUILD_COMMIT=$BUILD_COMMIT
ARG WORKDIR=/nitro-backend
RUN mkdir -p $WORKDIR
WORKDIR $WORKDIR

RUN apk --no-cache add git

COPY package.json yarn.lock ./
COPY .env.template .env
CMD ["yarn", "run", "start"]

FROM base as builder
RUN yarn install --frozen-lockfile --non-interactive
COPY . .
RUN cp .env.template .env
RUN yarn run build

# reduce image size with a multistage build
FROM base as production
ENV NODE_ENV=production
COPY --from=builder /nitro-backend/dist ./dist
RUN yarn install --frozen-lockfile --non-interactive
