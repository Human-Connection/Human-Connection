import dotenv from 'dotenv'

dotenv.config()

const requiredConfigs = {
  MAPBOX_TOKEN: process.env.MAPBOX_TOKEN,
  JWT_SECRET: process.env.JWT_SECRET,
  PRIVATE_KEY_PASSPHRASE: process.env.PRIVATE_KEY_PASSPHRASE,
}

const developmentConfigs = {
  DEBUG: process.env.NODE_ENV !== 'production' && process.env.DEBUG === 'true',
  MOCKS: process.env.MOCKS === 'true',
}

// check required configs and throw error
Object.entries(requiredConfigs).map(entry => {
  if (!entry[1]) {
    throw new Error(`ERROR: "${entry[0]}" env variable is missing.`)
  }
})

export default {
  ...requiredConfigs,
  ...developmentConfigs,
}
