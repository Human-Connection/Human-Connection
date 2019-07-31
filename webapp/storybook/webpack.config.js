const path = require('path')
const nuxtConf = require('../nuxt.config')
const srcDir = `../${nuxtConf.srcDir || ''}`
const rootDir = `../${nuxtConf.rootDir || ''}`

// Export a function. Accept the base config as the only param.
module.exports = async ({ config, mode }) => {
  // `mode` has a value of 'DEVELOPMENT' or 'PRODUCTION'
  // You can change the configuration based on that.
  // 'PRODUCTION' is used when building the static version of storybook.

  // Make whatever fine-grained changes you need
  config.module.rules.push({
    test: /\.scss$/,
    use: [
      { loader: 'style-loader' },
      { loader: 'css-loader', options: { sourceMap: true } },
      { loader: 'sass-loader', options: { sourceMap: true } },
      {
        loader: 'style-resources-loader',
        options: {
          patterns: [
            path.resolve(
              __dirname,
              '../node_modules/@human-connection/styleguide/dist/shared.scss',
            ),
          ],
          injector: 'prepend',
        },
      },
    ],
    include: path.resolve(__dirname, '../'),
  })

  config.resolve.alias = {
    ...config.resolve.alias,
    '~~': path.resolve(__dirname, rootDir),
    '~': path.resolve(__dirname, srcDir),
  }

  // Return the altered config
  return config
}
