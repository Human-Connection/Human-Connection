<template>
  <a
    v-router-link
    :href="href(post)"
  >
    <ds-card
      :header="post.title"
      :image="post.image"
      style="cursor: pointer; position: relative;"
    >
      <no-ssr>
        <dropdown class="post-menu">
          <template
            slot="default"
            slot-scope="{toggleMenu}"
          >
            <a
              class="post-menu-trigger"
              href="#"
              @click.prevent="toggleMenu()"
            >
              Options
            </a>
          </template>
          <template
            slot="popover"
            slot-scope="{toggleMenu}"
          >
            <div class="post-menu-popover">
              <ds-menu
                :routes="routes"
                :is-exact="isExact"
              >
                <ds-menu-item
                  slot="Navigation"
                  slot-scope="item"
                  :route="item.route"
                  :parents="item.parents"
                  @click.native="toggleMenu"
                >
                  <ds-icon :name="item.route.icon" /> {{ item.route.name }}
                </ds-menu-item>
              </ds-menu>
              <ds-space margin="xx-small" />
              <nuxt-link :to="{ name: 'logout'}">
                <ds-icon name="sign-out" /> {{ $t('login.logout') }}
              </nuxt-link>
            </div>
          </template>
        </dropdown>
      </no-ssr>
      <!-- eslint-disable vue/no-v-html -->
      <!-- TODO: replace editor content with tiptap render view -->
      <ds-space margin-bottom="large">
        <div
          class="hc-editor-content"
          v-html="excerpt"
        />
      </ds-space>
      <!-- eslint-enable vue/no-v-html -->
      <ds-space
        margin="small"
        style="position: absolute; bottom: 44px;"
      >
        <!-- TODO: find better solution for rendering errors -->
        <no-ssr>
          <hc-author
            :post="post"
            :trunc="35"
            :show-author-popover="showAuthorPopover"
          />
        </no-ssr>
      </ds-space>
      <template slot="footer">
        <div style="display: inline-block; opacity: .5;">
          <ds-icon
            v-for="category in post.categories"
            :key="category.id"
            v-tooltip="{content: category.name, placement: 'bottom-start', delay: { show: 500 }}"
            :name="category.icon"
          />&nbsp;
        </div>
        <div style="display: inline-block; float: right">
          <span :style="{ opacity: post.shoutedCount ? 1 : .5 }">
            <ds-icon name="bullhorn" /> <small>{{ post.shoutedCount }}</small>
          </span>
          &nbsp;
          <span :style="{ opacity: post.commentsCount ? 1 : .5 }">
            <ds-icon name="comments" /> <small>{{ post.commentsCount }}</small>
          </span>
        </div>
      </template>
    </ds-card>
  </a>
</template>

<script>
import HcAuthor from '~/components/Author.vue'
import Dropdown from '~/components/Dropdown'
import { randomBytes } from 'crypto'

export default {
  name: 'HcPostCard',
  components: {
    HcAuthor,
    Dropdown
  },
  props: {
    post: {
      type: Object,
      required: true
    },
    showAuthorPopover: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    excerpt() {
      // remove all links from excerpt to prevent issues with the serounding link
      let excerpt = this.post.contentExcerpt.replace(/<a.*>(.+)<\/a>/gim, '')
      // do not display content that is only linebreaks
      if (excerpt.replace(/<br>/gim, '').trim() === '') {
        excerpt = ''
      }

      return excerpt
    },
    routes() {
      let routes = [
        {
          name: 'Melden',
          path: `/profile/`,
          icon: 'user'
        },
        {
          name: 'Irgendwass',
          path: `/settings`,
          icon: 'cogs'
        }
      ]
      // if (this.isAdmin) {
      //   routes.push({
      //     name: this.$t('admin.name'),
      //     path: `/admin`,
      //     icon: 'shield'
      //   })
      // }
      return routes
    }
  },
  methods: {
    href(post) {
      return this.$router.resolve({
        name: 'post-slug',
        params: { slug: post.slug }
      }).href
    },
    isExact(url) {
      return this.$route.path.indexOf(url) === 0
    }
  }
}
</script>
