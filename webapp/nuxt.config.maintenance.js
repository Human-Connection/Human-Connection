import defaultNuxtConfig, { envWhitelist } from './nuxt.config.js'

export default {
  ...defaultNuxtConfig,
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
        content: 'Maintenance page for Human Connection'
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
  env: {
    ...defaultNuxtConfig.env,
    maintenance: true,
  },

  /*
   ** Plugins to load before mounting the App
   */
  plugins: [
    { src: `~/plugins/styleguide.js`, ssr: true },
    { src: '~/plugins/i18n.js', ssr: true },
    { src: '~/plugins/v-tooltip.js', ssr: false },
  ],


  /*
   ** Nuxt.js modules
   */
  modules: [
    [
      'nuxt-env',
      {
        keys: envWhitelist,
      },
    ],
    'cookie-universal-nuxt',
    '@nuxtjs/style-resources',
    '@nuxtjs/sentry',
  ],


  router: {
    middleware: ['maintenance'],
    extendRoutes (routes, resolve) {
      routes.push({
        name: 'maintenance',
        path: '*',
        component: resolve(__dirname, 'maintenance/maintenance.vue'),
      })
    }
  },
}
