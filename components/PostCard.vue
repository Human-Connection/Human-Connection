<template>
  <ds-card
    :header="post.title"
    :image="post.image"
    class="post-card"
  >
    <a
      v-router-link
      class="post-link"
      :href="href(post)"
    >
      {{ post.title }}
    </a>
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
      style="position: absolute; bottom: 44px; z-index: 1;"
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
        <no-ssr>
          <dropdown
            class="post-menu"
            placement="top-end"
          >
            <template
              slot="default"
              slot-scope="{toggleMenu}"
            >
              <a
                class="post-menu-trigger"
                href="#"
                @click.prevent="toggleMenu()"
              >
                <ds-icon name="angle-up" />
              </a>
            </template>
            <template
              slot="popover"
              slot-scope="{toggleMenu}"
            >
              <div class="post-menu-popover">
                <ds-menu :routes="routes">
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
              </div>
            </template>
          </dropdown>
        </no-ssr>
      </div>
    </template>
  </ds-card>
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
          name: this.$t('common.reportContent'),
          path: `/profile/`,
          icon: 'flag'
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
    }
  }
}
</script>

<style lang="scss">
.post-card {
  cursor: pointer;
  position: relative;

  .ds-card-footer {
    z-index: 1;
  }
}
.post-menu {
  // position: absolute;
  // bottom: $space-small;
  // right: $space-small;
  display: inline-block;
  margin-left: $space-base;
  z-index: 1;
}
.post-link {
  display: block;
  position: absolute;
  z-index: 1;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  text-indent: -999999px;
}
</style>
