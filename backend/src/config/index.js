import dotenv from 'dotenv'

dotenv.config()

export const requiredConfigs = {
  MAPBOX_TOKEN: process.env.MAPBOX_TOKEN,
  JWT_SECRET: process.env.JWT_SECRET,
  PRIVATE_KEY_PASSPHRASE: process.env.PRIVATE_KEY_PASSPHRASE,
}

export const smtpConfigs = {
  SMTP_HOST: process.env.SMTP_HOST || 'localhost',
  SMTP_PORT: process.env.SMTP_PORT || 1025,
  SMTP_USERNAME: process.env.SMTP_USERNAME,
  SMTP_PASSWORD: process.env.SMTP_PASSWORD,
}

export const neo4jConfigs = {
  NEO4J_URI: process.env.NEO4J_URI || 'bolt://localhost:7687',
  NEO4J_USERNAME: process.env.NEO4J_USERNAME || 'neo4j',
  NEO4J_PASSWORD: process.env.NEO4J_PASSWORD || 'neo4j',
}

export const serverConfigs = {
  GRAPHQL_PORT: process.env.GRAPHQL_PORT || 4000,
  CLIENT_URI: process.env.CLIENT_URI || 'http://localhost:3000',
  GRAPHQL_URI: process.env.GRAPHQL_URI || 'http://localhost:4000',
}

export const developmentConfigs = {
  SEND_MAILS: process.env.SEND_MAILS || false,
  DEBUG: process.env.NODE_ENV !== 'production' && process.env.DEBUG === 'true',
  MOCKS: process.env.MOCKS === 'true',
  DISABLED_MIDDLEWARES:
    (process.env.NODE_ENV !== 'production' && process.env.DISABLED_MIDDLEWARES) || '',
}

export default {
  ...requiredConfigs,
  ...smtpConfigs,
  ...neo4jConfigs,
  ...serverConfigs,
  ...developmentConfigs,
}
