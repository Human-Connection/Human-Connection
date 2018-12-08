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
            v-tooltip="{content: category.name, placement: 'bottom-start', delay: { show: 500 }}"
            v-for="category in post.categories"
            :key="category.id"
            :name="category.icon" />&nbsp;
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
import { randomBytes } from 'crypto'

export default {
  name: 'HcPostCard',
  components: {
    HcAuthor
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
