import dotenv from 'dotenv'

dotenv.config()

const requiredConfigs = {
  MAPBOX_TOKEN: process.env.MAPBOX_TOKEN,
  JWT_SECRET: process.env.JWT_SECRET,
  PRIVATE_KEY_PASSPHRASE: process.env.PRIVATE_KEY_PASSPHRASE,
}

const neo4jConfigs = {
  NEO4J_URI: process.env.NEO4J_URI || 'bolt://localhost:7687',
  NEO4J_USERNAME: process.env.NEO4J_USERNAME || 'neo4j',
  NEO4J_PASSWORD: process.env.NEO4J_PASSWORD || 'neo4j',
}

const serverConfigs = {
  GRAPHQL_PORT: process.env.GRAPHQL_PORT || 4000,
  CLIENT_URI: process.env.CLIENT_URI || 'http://localhost:3000',
  GRAPHQL_URI: process.env.GRAPHQL_URI || 'http://localhost:4000',
}

const developmentConfigs = {
  DEBUG: process.env.NODE_ENV !== 'production' && process.env.DEBUG === 'true',
  MOCKS: process.env.MOCKS === 'true',
  DISABLED_MIDDLEWARES: process.env.DISABLED_MIDDLEWARES || '',
}

// check required configs and throw error
Object.entries(requiredConfigs).map(entry => {
  if (!entry[1]) {
    throw new Error(`ERROR: "${entry[0]}" env variable is missing.`)
  }
})

export default {
  ...requiredConfigs,
  ...neo4jConfigs,
  ...serverConfigs,
  ...developmentConfigs,
}
