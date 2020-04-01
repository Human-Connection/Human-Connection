import { storiesOf } from '@storybook/vue'
import { withA11y } from '@storybook/addon-a11y'
import HcEditor from '~/components/Editor/Editor.vue'
import helpers from '~/storybook/helpers'
import Vue from 'vue'

import contents from './contents.js'

const embed = {
  image: 'https://i.ytimg.com/vi/ptCcgLM-p8k/maxresdefault_live.jpg',
  title: 'Video Titel',
  // html: null,
  description: 'Video Description',
  html:
    '<iframe width="auto" height="250" src="https://www.youtube.com/embed/qkdXAtO40Fo?feature=oembed" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>',
}

const plugins = [
  (app = {}) => {
    app.$apollo = {
      mutate: () => {},
      query: () => {
        return { data: { embed } }
      },
    }
    Vue.prototype.$apollo = app.$apollo
    return app
  },
]
helpers.init({ plugins })

const users = [
  { id: 1, slug: 'peter' },
  { id: 2, slug: 'sandra' },
  { id: 3, slug: 'jane' },
]

storiesOf('Editor', module)
  .addDecorator(withA11y)
  .addDecorator((storyFn) => {
    const ctx = storyFn()
    return {
      components: { ctx },
      template: `
        <base-card style="width: 50%; min-width: 500px; margin: 0 auto;">
          <ctx />
        </base-card>
      `,
    }
  })
  .addDecorator(helpers.layout)
  .add('Empty', () => ({
    components: { HcEditor },
    store: helpers.store,
    data: () => ({
      users,
    }),
    template: `<hc-editor :users="users" />`,
  }))
  .add('Basic formatting', () => ({
    components: { HcEditor },
    store: helpers.store,
    data: () => ({
      users,
      content: contents.basicFormatting,
    }),
    template: `<hc-editor :users="users" :value="content" />`,
  }))
  .add('@Mentions', () => ({
    components: { HcEditor },
    store: helpers.store,
    data: () => ({
      users,
      content: contents.mentions,
    }),
    template: `<hc-editor :users="users" :value="content" />`,
  }))
  .add('#Hashtags', () => ({
    components: { HcEditor },
    store: helpers.store,
    data: () => ({
      users,
      content: contents.hashtags,
    }),
    template: `<hc-editor :users="users" :value="content" />`,
  }))
  .add('Embeds with iframe', () => ({
    components: { HcEditor },
    store: helpers.store,
    data: () => ({
      users,
      content: contents.iframeEmbed,
    }),
    template: `<hc-editor :users="users" :value="content" />`,
  }))
  .add('Embeds with plain link', () => ({
    components: { HcEditor },
    store: helpers.store,
    data: () => ({
      users,
      content: contents.linkEmbed,
    }),
    template: `<hc-editor :users="users" :value="content" />`,
  }))
