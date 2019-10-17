import dotenv from 'dotenv'

dotenv.config()

const {
  MAPBOX_TOKEN,
  JWT_SECRET,
  PRIVATE_KEY_PASSPHRASE,
  SMTP_IGNORE_TLS = true,
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USERNAME,
  SMTP_PASSWORD,
  SENTRY_DSN_BACKEND,
  COMMIT,
  NEO4J_URI = 'bolt://localhost:7687',
  NEO4J_USERNAME = 'neo4j',
  NEO4J_PASSWORD = 'neo4j',
  GRAPHQL_PORT = 4000,
  CLIENT_URI = 'http://localhost:3000',
  GRAPHQL_URI = 'http://localhost:4000',
} = process.env

export const requiredConfigs = {
  MAPBOX_TOKEN,
  JWT_SECRET,
  PRIVATE_KEY_PASSPHRASE,
}

export const smtpConfigs = {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_IGNORE_TLS,
  SMTP_USERNAME,
  SMTP_PASSWORD,
}
export const neo4jConfigs = { NEO4J_URI, NEO4J_USERNAME, NEO4J_PASSWORD }
export const serverConfigs = {
  GRAPHQL_PORT,
  CLIENT_URI,
  GRAPHQL_URI,
  PUBLIC_REGISTRATION: process.env.PUBLIC_REGISTRATION === 'true',
}

export const developmentConfigs = {
  DEBUG: process.env.NODE_ENV !== 'production' && process.env.DEBUG,
  DISABLED_MIDDLEWARES:
    (process.env.NODE_ENV !== 'production' && process.env.DISABLED_MIDDLEWARES) || '',
}

export const sentryConfigs = { SENTRY_DSN_BACKEND, COMMIT }

export default {
  ...requiredConfigs,
  ...smtpConfigs,
  ...neo4jConfigs,
  ...serverConfigs,
  ...developmentConfigs,
  ...sentryConfigs,
}
