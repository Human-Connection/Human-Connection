const pkg = require('./package')
const envWhitelist = ['NODE_ENV', 'MAINTENANCE', 'MAPBOX_TOKEN']
const dev = process.env.NODE_ENV !== 'production'

const styleguidePath = '../Nitro-Styleguide'
const styleguideStyles = process.env.STYLEGUIDE_DEV
  ? [
      `${styleguidePath}/src/system/styles/main.scss`,
      `${styleguidePath}/src/system/styles/shared.scss`
    ]
  : '@human-connection/styleguide/dist/shared.scss'

module.exports = {
  mode: 'universal',

  dev: dev,
  debug: dev ? 'nuxt:*,app' : null,

  modern: !dev ? 'server' : false,

  transition: {
    name: 'slide-up',
    mode: 'out-in'
  },

  env: {
    // pages which do NOT require a login
    publicPages: [
      'login',
      'logout',
      'register',
      'signup',
      'reset',
      'reset-token',
      'pages-slug'
    ],
    // pages to keep alive
    keepAlivePages: ['index'],
    // active locales
    locales: require('./locales')
  },
  /*
  ** Headers of the page
  */
  head: {
    title: 'Human Connection',
    titleTemplate: '%s - Human Connection',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: pkg.description }
    ],
    link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
    script: [
      {
        src: '/js/polyfill.min.js' // polyfill IntersectionObserver
      }
    ]
  },

  /*
  ** Customize the progress-bar color
  */
  loading: {
    color: '#86b31e',
    height: '2px',
    duration: 20000
  },

  /*
  ** Global CSS
  */
  css: ['~assets/styles/main.scss'],

  /*
  ** Global processed styles
  */
  styleResources: {
    scss: styleguideStyles
  },

  /*
  ** Plugins to load before mounting the App
  */
  plugins: [
    {
      src: `~/plugins/styleguide${process.env.STYLEGUIDE_DEV ? '-dev' : ''}.js`,
      ssr: true
    },
    { src: '~/plugins/i18n.js', ssr: true },
    { src: '~/plugins/axios.js', ssr: false },
    { src: '~/plugins/keep-alive.js', ssr: false },
    { src: '~/plugins/vue-directives.js', ssr: false },
    { src: '~/plugins/v-tooltip.js', ssr: false },
    { src: '~/plugins/izi-toast.js', ssr: false },
    { src: '~/plugins/vue-filters.js' }
  ],

  router: {
    middleware: ['authenticated'],
    linkActiveClass: 'router-link-active',
    linkExactActiveClass: 'router-link-exact-active',
    scrollBehavior: () => {
      return { x: 0, y: 0 }
    }
  },

  /*
  ** Nuxt.js modules
  */
  modules: [
    ['@nuxtjs/dotenv', { only: envWhitelist }],
    ['nuxt-env', { keys: envWhitelist }],
    'cookie-universal-nuxt',
    '@nuxtjs/apollo',
    '@nuxtjs/axios',
    '@nuxtjs/style-resources',
    'portal-vue/nuxt'
  ],

  /*
  ** Axios module configuration
  */
  axios: {
    // See https://github.com/nuxt-community/axios-module#options
    debug: dev,
    proxy: true
  },
  proxy: {
    '/api': {
      // make this configurable (nuxt-dotenv)
      target: process.env.BACKEND_URL || 'http://localhost:4000',
      pathRewrite: { '^/api': '' },
      toProxy: true, // cloudflare needs that
      changeOrigin: true,
      headers: {
        Accept: 'application/json',
        'X-UI-Request': true,
        'X-API-TOKEN': process.env.BACKEND_TOKEN || 'NULL'
      }
    }
  },

  // Give apollo module options
  apollo: {
    tokenName: 'human-connection-token', // optional, default: apollo-token
    tokenExpires: 3, // optional, default: 7 (days)
    // includeNodeModules: true, // optional, default: false (this includes graphql-tag for node_modules folder)
    // optional
    errorHandler(error) {
      console.log(
        '%cError',
        'background: red; color: white; padding: 2px 4px; border-radius: 3px; font-weight: bold;',
        error.message
      )
    },

    // Watch loading state for all queries
    // See 'Smart Query > options > watchLoading' for detail
    // TODO: find a way to get this working
    // watchLoading(isLoading) {
    //   console.log('Global loading', countModifier)
    //   this.$nuxt.$loading.start()
    // },
    // required
    clientConfigs: {
      default: '~/plugins/apollo-config.js'
    }
  },

  manifest: {
    name: 'Human-Connection.org',
    description: 'Human-Connection.org',
    theme_color: '#ffffff',
    lang: 'de'
  },

  /*
  ** Build configuration
  */
  build: {
    /*
    ** You can extend webpack config here
    */
    extend(config, ctx) {
      // Run ESLint on save
      if (ctx.isDev && ctx.isClient) {
        config.module.rules.push({
          enforce: 'pre',
          test: /\.(js|vue)$/,
          loader: 'eslint-loader',
          exclude: /(node_modules)/
        })
      }
      if (process.env.STYLEGUIDE_DEV) {
        const path = require('path')
        config.resolve.alias['@@'] = path.resolve(
          __dirname,
          `${styleguidePath}/src/system`
        )
        config.module.rules.push({
          resourceQuery: /blockType=docs/,
          loader: require.resolve(
            `${styleguidePath}/src/loader/docs-trim-loader.js`
          )
        })
      }

      const svgRule = config.module.rules.find(rule => rule.test.test('.svg'))
      svgRule.test = /\.(png|jpe?g|gif|webp)$/
      config.module.rules.push({
        test: /\.svg$/,
        loader: 'vue-svg-loader',
        options: {
          svgo: {
            plugins: [
              {
                removeViewBox: false
              },
              {
                removeDimensions: true
              }
            ]
          }
        }
      })
    }
  }
}
