import { sentry } from 'graphql-middleware-sentry'
import { sentryConfigs } from '../config'

let sentryMiddleware = (resolve, root, args, context, resolveInfo) =>
  resolve(root, args, context, resolveInfo)

if (sentryConfigs.SENTRY_DSN_BACKEND) {
  sentryMiddleware = sentry({
    forwardErrors: true,
    config: {
      dsn: sentryConfigs.SENTRY_DSN_BACKEND,
      release: sentryConfigs.COMMIT,
      environment: process.env.NODE_ENV,
    },
    withScope: (scope, error, context) => {
      scope.setUser({
        id: context.user.id,
      })
      scope.setExtra('body', context.req.body)
      scope.setExtra('origin', context.req.headers.origin)
      scope.setExtra('user-agent', context.req.headers['user-agent'])
    },
  })
}

export default sentryMiddleware
