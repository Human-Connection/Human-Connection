const pkg = require('./package')
const envWhitelist = ['NODE_ENV', 'BACKEND_URL', 'MAINTENANCE']
const dev = process.env.NODE_ENV !== 'production'

module.exports = {
  mode: 'universal',

  dev: dev,
  debug: dev ? 'nuxt:*,app' : null,

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
    keepAlivePages: ['index']
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
    link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }]
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
  ** Plugins to load before mounting the App
  */
  plugins: [
    { src: '~/plugins/keep-alive.js', ssr: false },
    { src: '~/plugins/design-system.js', ssr: true },
    { src: '~/plugins/vue-directives.js', ssr: false },
    { src: '~/plugins/v-tooltip.js', ssr: false },
    { src: '~/plugins/izi-toast.js', ssr: false },
    { src: '~/plugins/vue-filters.js' }
  ],

  router: {
    middleware: ['authenticated'],
    linkActiveClass: 'router-active-link'
  },
  /* router: {
    routes: [
      {
        name: 'index',
        path: '/',
        component: 'pages/index.vue'
      },
      {
        name: 'post-slug',
        path: '/post/:slug',
        component: 'pages/post/_slug.vue',
        children: [
          {
            path: 'more-info',
            component: 'pages/post/_slug.vue'
          },
          {
            path: 'take-action',
            component: 'pages/post/_slug.vue'
          }
        ]
      }
    ]
  }, */

  /*
  ** Nuxt.js modules
  */
  modules: [
    '@nuxtjs/apollo',
    '@nuxtjs/axios',
    ['@nuxtjs/dotenv', { only: envWhitelist }],
    ['nuxt-env', { keys: envWhitelist }]
  ],

  // Give apollo module options
  apollo: {
    // tokenName: 'yourApolloTokenName', // optional, default: apollo-token
    tokenExpires: 1, // optional, default: 7 (days)
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
     * Polyfill missing ES6 & 7 Methods to work on older Browser
     */
    vendor: ['@babel/polyfill'],

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
    }
  }
}
