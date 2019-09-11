import defaultConfig from './nuxt.config.js'

const {
  css,
  styleResources,
  env: { locales },
  manifest,
} = defaultConfig

export default {
  css,
  styleResources,
  env: { locales },
  manifest,

  head: {
    title: 'Human Connection',
    meta: [
      {
        charset: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        hid: 'description',
        name: 'description',
        content: 'Maintenance page for Human Connection',
      },
    ],
    link: [
      {
        rel: 'icon',
        type: 'image/x-icon',
        href: '/favicon.ico',
      },
    ],
  },

  plugins: [
    { src: `~/plugins/styleguide.js`, ssr: true },
    { src: '~/plugins/i18n.js', ssr: true },
    { src: '~/plugins/v-tooltip.js', ssr: false },
  ],

  modules: ['cookie-universal-nuxt', '@nuxtjs/style-resources'],

  router: {
    extendRoutes(routes, resolve) {
      routes.push({
        name: 'maintenance',
        path: '*',
        component: resolve(__dirname, 'pages/index.vue'),
      })
    },
  },
}
